import React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useFormContext, Controller } from 'react-hook-form';

import { HinanCase, SaigaiCase } from '../data/CaseData'
import { SaigaiSyuruiItem } from '../data/ItemData';

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

export default function Scenario({ isRow, setStateSaigaiKind }) {
  const {
    register,
    getValues,
    setValue,
    control,
  } = useFormContext();

  const [update, setUpdate] = React.useState(false);
  /* 災害種類の変更イベント */
  register('saigaiKind', {
    onChange(event) {
      // 他の設定を選択解除
      setValue('saigaiScenario', -1, { shouldDirty: true });
      setValue('hinanScenario', -1, { shouldDirty: true });
      setValue('startTime', -99, { shouldDirty: true });
      setSaigaiInfo(getSaigaiScenarioInfo(-1));
      setHinanInfo(getHinanScenarioInfo(-1));
      // 再レンダリングを強制
      setUpdate(update ? false : true);
    }
  })

  const [saigaiInfo, setSaigaiInfo] = React.useState(getSaigaiScenarioInfo(getValues('saigaiScenario')));
  /* 災害発生シナリオの変更イベント */
  register('saigaiScenario', {
    onChange(event) {
      setSaigaiInfo(getSaigaiScenarioInfo(event.target.value));
    }
  })
  // 災害発生シナリオの説明の取得
  function getSaigaiScenarioInfo(num) {
    return (num === -1 ? '選択ケースの説明' : SaigaiCase[num - 1].info);
  }

  const [hinanInfo, setHinanInfo] = React.useState(getHinanScenarioInfo(getValues('hinanScenario')));
  /* 避難行動シナリオの変更イベント */
  register('hinanScenario', {
    onChange(event) {
      setHinanInfo(getHinanScenarioInfo(event.target.value));
    }
  })
  // 避難行動シナリオの説明の取得
  function getHinanScenarioInfo(num) {
    return (num === -1 ? '選択ケースの説明' : HinanCase[num - 1].info);
  }

  // 洪水と高潮は避難行動シナリオを統一（1: 洪水＆高潮, 2: 津波）
  let saigaiKindForFilter;
  switch (Number(getValues('saigaiKind'))) {
    case 3:
      saigaiKindForFilter = 2;
      break;
    default:
      saigaiKindForFilter = 1;
      break;
  }
  // console.log(getValues('simMode'));

  return (
    <div>
      {/* 災害種類 */}
      <Controller
        name='saigaiKind'
        control={control}
        render={({ field, fieldState }) => (
          <FormControl sx={{ marginTop: 1 }} error={fieldState.error}>
            <FormLabel style={{ fontSize: '1rem' }} id='saigaiKind'>災害種類</FormLabel>
            <RadioGroup sx={{ paddingLeft: 1 }} name='saigaiKind' row={isRow}
              {...field}
            >
              {SaigaiSyuruiItem.map((option, index) => (
                <FormControlLabel
                  value={option.value}
                  control={<Radio size='small' />}
                  label={option.label} />
              ))}
            </RadioGroup>
            <FormHelperText>{fieldState.error ? fieldState.error?.message : ''}</FormHelperText>
          </FormControl>
        )} />
      {/* 災害種類 */}
      <ThemeProvider theme={theme}>
        {/* 災害発生シナリオ */}
        <Controller
          name='saigaiScenario'
          control={control}
          render={({ field, fieldState }) => (
            <FormControl size='small' sx={{ marginTop: '1em', minWidth: '5em', width: '100%' }}
              error={fieldState.error}>
              <InputLabel id='saigaiScenario' shrink>災害発生シナリオ</InputLabel>
              <Select
                {...field}
                notched
                labelId='saigaiScenario'
                id='saigaiScenario'
                label='災害発生シナリオ____' // InputLabelの文字列を基準に長さを調整
                displayEmpty
              >
                <MenuItem value={-1}>
                  <em>（未選択）</em>
                </MenuItem>
                {/*選択中の災害種別に該当するケースのみ抽出*/}
                {SaigaiCase.filter(
                  v => v.category === Number(getValues('saigaiKind'))
                ).map((option, index) => (
                  <MenuItem value={option.id}>{option.title}</MenuItem>
                ))};
              </Select>
              <FormHelperText>{fieldState.error ? fieldState.error?.message : saigaiInfo}</FormHelperText>
            </FormControl>
          )} />
        {/* 災害発生シナリオ */}

        {/* 避難行動シナリオ */}
        <Controller
          name='hinanScenario'
          control={control}
          render={({ field, fieldState }) => (
            <FormControl size='small' sx={{ marginTop: '1em', minWidth: '5em', width: '100%' }} error={fieldState.error}>
              <InputLabel id='hinanScenario' shrink>避難行動シナリオ</InputLabel>
              <Select
                {...field}
                notched
                labelId='hinanScenario'
                id='hinanScenario'
                label='避難行動シナリオ____' // InputLabelの文字列を基準に長さを調整
                displayEmpty
              >
                <MenuItem value={-1}>
                  <em>（未選択）</em>
                </MenuItem>
                {HinanCase.filter(function (v) {
                  const mode = getValues('simMode');
                  let output;
                  // console.log('* simMode: ' + mode);
                  if (mode === '1') {
                    output = (v.category === saigaiKindForFilter);
                  } else if (mode === '2') {
                    output = (v.category === saigaiKindForFilter) && (v.personal === 1); // パーソナルはデータを用意したケースのみ抽出
                  }
                  return output;
                }).map((option, index) => (
                  <MenuItem value={option.id}>{option.title}</MenuItem>
                ))}
              </Select>
              <FormHelperText>{fieldState.error ? fieldState.error?.message : hinanInfo}</FormHelperText>
            </FormControl>
          )} />
        {/* 避難行動シナリオ */}
      </ThemeProvider>
      <p>{setStateSaigaiKind(Number(getValues('saigaiKind')))}</p>
    </div>
  );
}
