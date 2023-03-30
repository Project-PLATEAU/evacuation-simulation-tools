import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

import { useFormContext, Controller } from 'react-hook-form';

import Scenario from './Scenario';
import StartingPoint from './StartingPoint';
import { KaishiJikanLabelItem, KaishiJikanItem, KojinZokuseiItem, HinanShudanItem, HinansakiItem } from '../data/ItemData';
import axios from 'axios';

//var url = 'http://localhost/';
const domain = 'https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const theme = createTheme({
  components: {
    MuiInputLabel: {
      styleOverrides: {
        shrink: {
          fontSize: '1.3rem'
        }
      }
    }
  }
});

const BootstrapDialogTitle = (props) => {
  const { children, onClose, ...other } = props;
  return (
    <DialogTitle sx={{ m: 0, p: 1 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

function getNowTime() {
  var dt = new Date();
  var y = dt.getFullYear();
  var m = ("00" + (dt.getMonth() + 1)).slice(-2);
  var d = ("00" + dt.getDate()).slice(-2);
  var h = ("00" + dt.getHours()).slice(-2);
  var M = ("00" + dt.getMinutes()).slice(-2);
  var s = ("00" + dt.getSeconds()).slice(-2);
  var ms = ("000" + dt.getMilliseconds()).slice(-3);
  var result = y + m + d + h + M + s + ms;
  return result;
}

export default function SettingDialog({ show, setShow }) {
  const [processing, setProcessing] = React.useState(false);
  const [actionState, setAction] = React.useState('');
  const handleClose = () => {
    // 処理中の場合、送信をしない
    if (processing) return;

    setValue('isSubmit', false);
    setShow(false);
    clearErrors();
  };
  // submitをハンドリング
  const handleOnSubmit = (valuses) => {
    // 処理中の場合、送信をしない
    if (processing) return;

    if (window.confirm("シミュレーションを実行しますか。")) {
      var timeout = 180000;
      //var timeout=1000;
      setValue('personalFile', '');
      setProcessing(true);
      setAction('計算中です...');

      // 設定時間後（ミリ秒単位）に解除
      var id = setTimeout(() => {
        setProcessing(false);
      }, timeout);

      setValue('isSubmit', true);
      clearErrors();

      const tm = getNowTime();
      const fileName = tm + '.json';
      var url = domain + 'cgi/personal.py?'
        + 'id=' + tm
        + '&saigaiKind=' + getValues('saigaiKind')
        + '&saigaiScenario=' + getValues('saigaiScenario')
        + '&hinanScenario=' + getValues('hinanScenario')
        + '&latitude=' + getValues('latitude')
        + '&longitude=' + getValues('longitude')
        + '&attribute=' + getValues('attribute')
        + '&startTime=' + getValues('startTime')
        + '&hinanMeans=' + getValues('hinanMeans')
        + '&hinanSaki=' + getValues('hinanSaki');
      console.log(url);
      axios.get(url, {
        responseType: 'blob',
      })
        .then((res) => {
          if (res.status === 200) {
            setValue('personalFile', fileName);
            alert("シミュレーションが終了しました。");
          } else {
            alert("シミュレーションに失敗しました。");
          }
          setShow(false);
          setProcessing(false);
          clearTimeout(id);
          setAction('');
        });
    };
  };

  const {
    getValues,
    setValue,
    handleSubmit,
    clearErrors,
  } = useFormContext();
  // setValue('isSubmit',false);

  // 条件設定ダイアログ
  function MyDialogContents() {
    const [stateSaigaiKind, setStateSaigaiKind] = React.useState(0);
    const [stateHinanMeans, setStateHinanMeans] = React.useState(1);
    return (
      <DialogContent dividers>
        <Box sx={{ paddingLeft: 1, paddingRight: 1 }}>
          {/* シナリオ */}
          <Scenario isRow={true} setStateSaigaiKind={setStateSaigaiKind} />
          {/* 避難開始地点 */}
          <StartingPoint />
          {/* 個人属性 */}
          <KojinGroup />
          <KaishiJikanLabel />
          {/* <FormLabel>災害種類番号: {stateSaigaiKind}</FormLabel> */}
          {/* 避難開始時間 */}
          <KaishiJikanSelect />
          {/* 避難手段 */}
          <HinanGroup setStateHinanMeans={setStateHinanMeans} />
          {/* <FormLabel>避難手段番号: {stateHinanMeans}</FormLabel> */}
          {/* 避難先リスト */}
          <HinansakiList />
        </Box>
      </DialogContent>
    );
  }

  return (
    <div>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby='customized-dialog-title'
        open={show}
      >
        <BootstrapDialogTitle id='customized-dialog-title' onClose={handleClose}>
          ３Ｄパーソナル避難シミュレーション条件設定
        </BootstrapDialogTitle>
        <MyDialogContents />

        <DialogActions>
          <Box width={'30%'} color='#ff0000'>{actionState}</Box>
          <Button autoFocus disabled={processing} onClick={handleSubmit(handleOnSubmit)}>
            シミュレーション開始
          </Button>
          {/*
          <Button autoFocus disabled={processing} onClick={handleClose}>
            中止
          </Button>
          */}
        </DialogActions>

      </BootstrapDialog>
    </div>
  );
}

/* 個人属性 */
function KojinGroup() {
  const {
    control,
  } = useFormContext();
  return (
    <div>
      <Controller
        name='attribute'
        control={control}
        render={({ field, fieldState }) => (
          <FormControl sx={{ marginTop: 1 }}
            error={fieldState.error}>
            <FormLabel style={{ fontSize: '1rem' }} id='attribute'>個人属性</FormLabel>
            <RadioGroup sx={{ paddingLeft: 1 }} name='attribute' row
              {...field} >
              {KojinZokuseiItem.map((option, index) => (
                <FormControlLabel value={option.value} control={<Radio size='small' />} label={option.label} />
              ))}
            </RadioGroup>
            <FormHelperText>{fieldState.error ? fieldState.error?.message : ''}</FormHelperText>
          </FormControl>
        )} />
    </div>
  );
}

/* 避難開始時間に関するラベル */
function KaishiJikanLabel() {
  const { getValues } = useFormContext();
  return (
    <Box sx={{ paddingTop: 1 }}>
      <FormLabel>{KaishiJikanLabelItem.filter(v => v.category === Number(getValues('saigaiKind')))[0].label}</FormLabel>
    </Box>
  );
}

/* 避難開始時間 */
function KaishiJikanSelect() {
  const {
    getValues,
    control,
  } = useFormContext();
  return (
    <ThemeProvider theme={theme}>
      <Controller
        name='startTime'
        control={control}
        render={({ field, fieldState }) => (
          <FormControl size='small' sx={{ marginTop: '1em', minWidth: '5em', width: '100%' }}
            error={fieldState.error}>
            <InputLabel id='startTime' shrink>あなたはいつ避難を開始しますか？</InputLabel>
            <Select
              {...field}
              notched
              labelId='startTime'
              id='startTime'
              label='あなたはいつ避難を開始しますか？startTime'
              displayEmpty
            >
              <MenuItem value={-99}>
                <em>（未選択）</em>
              </MenuItem>
              {KaishiJikanItem.filter(
                v => v.category === Number(getValues('saigaiKind'))
              ).map((option, index) => (
                <MenuItem value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
            <FormHelperText>{fieldState.error ? fieldState.error?.message : ''}</FormHelperText>
          </FormControl>
        )} />
    </ThemeProvider>
  );
}

// 移動可能範囲(徒歩、自動車)
const mode_distance = [4, 9999];
var maxDistance = mode_distance[0];

/* 避難手段 */
function HinanGroup({ setStateHinanMeans }) {
  const {
    register,
    getValues,
    setValue,
    control,
  } = useFormContext();

  const [update, setUpdata] = React.useState(false);
  /* 変更イベント */
  register('hinanMeans', {
    onChange(event) {
      maxDistance = mode_distance[event.target.value - 1];
      // 避難先の選択解除
      setValue('hinanSaki', -1);
      // 再レンダリングを強制
      setUpdata(update ? false : true);
    }
  })

  return (
    <div>
      <Controller
        name='hinanMeans'
        control={control}
        render={({ field, fieldState }) => (
          <FormControl sx={{ marginTop: 1 }} error={fieldState.error}>
            <FormLabel style={{ fontSize: '1rem' }} id='hinanMeans'>避難手段</FormLabel>
            <RadioGroup sx={{ paddingLeft: 1 }} defaultValue='1' name='hinanMeans' row
              {...field} >
              {HinanShudanItem.map((option, index) => (
                <FormControlLabel value={option.value} control={<Radio size='small' />} label={option.label} />
              ))}
            </RadioGroup>
            <FormHelperText>{fieldState.error ? fieldState.error?.message : ''}</FormHelperText>
          </FormControl>
        )}
      />
      <p>{setStateHinanMeans(Number(getValues('hinanMeans')))}</p>
    </div>
  );
}

/* 避難先 */
function HinansakiList() {
  const {
    register,
    getValues,
    setValue,
    control,
  } = useFormContext();

  /* 変更イベント */
  register('hinanSaki', {
    onChange(event) {
      //console.log(event.target.value); 
      setValue('hinanSaki', event.target.value);
    }
  })
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <Controller
          name='hinanSaki'
          control={control}
          render={({ field, fieldState }) => (
            <FormControl size='small' sx={{ marginTop: '1em', minWidth: '5em', width: '100%' }}
              error={fieldState.error}>
              <InputLabel id='hinanSaki' shrink>避難先</InputLabel>
              <Select
                {...field}
                notched
                labelId='hinanSaki'
                id='hinanSaki'
                label='避難先__' // InputLabelの文字列を基準に長さを調整
                displayEmpty
                defaultValue={{ value: -1, label: '（未選択）' }}
              >
                <MenuItem value={-1}>
                  <em>（未選択）</em>
                </MenuItem>
                {HinansakiItem.filter(function (v) {
                  // 基準点と避難先の距離(Km)
                  var d = distance(getValues('latitude'), getValues('longitude'), v.lat, v.lon);
                  return v.category === Number(getValues('hinanMeans')) && d <= maxDistance;
                }).map((option, index) => (
                  <MenuItem value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{fieldState.error ? fieldState.error?.message : ''}</FormHelperText>
            </FormControl>
          )} />
      </Box>
    </ThemeProvider>
  );

  // 2地点の緯度経度を指定して距離を km で返す
  function distance(lat1, lng1, lat2, lng2) {
    // console.log('   distance: lat1=' + lat1 + ',lng1=' + lng1);
    const R = Math.PI / 180;
    if ((lat1 == null || lat1 === '') || (lng1 == null || lng1 === '')) {
      return 0;
    }
    lat1 *= R;
    lng1 *= R;
    lat2 *= R;
    lng2 *= R;
    return 6371 * Math.acos(Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1) + Math.sin(lat1) * Math.sin(lat2));
  };
}
