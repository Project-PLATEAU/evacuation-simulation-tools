import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useFormContext, Controller } from 'react-hook-form';

import { KaishiChitenItem } from '../data/ItemData';
import { CityItem, AreaItem, AddressItem } from '../data/AddressData'

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

export default function StartingPoint() {
  const {
    getValues,
    setValue,
    register,
    clearErrors,
    setError,
    control,
  } = useFormContext();

  const [isAddressPoint, setPoint] = React.useState(getValues('pointType') - 1);

  /* 位置情報取得成功 */
  function getSuccess(pos) {
    const { latitude, longitude } = pos.coords;
    setValue('latitude', latitude, { shouldDirty: true });
    setValue('longitude', longitude, { shouldDirty: true });
  }
  /* 位置情報取得エラー */
  function getError(err) {
    console.log(`ERROR(${err.code}): ${err.message}`);
  }

  /* 位置情報取得 */
  function getPoint() {
    clearErrors();
    switch (Number(getValues('pointType'))) {
      case 1:  // PCから取得
        navigator.geolocation.getCurrentPosition(getSuccess, getError);
        break;
      case 2:  // 住所から取得
        let adr = getValues('address');
        // 選択されていない、または市区町村レベルまで
        if (adr === '' || getValues('areaName') === '') {
          setError('address', { type: 'required', message: '住所を入力してください。' });
          // 町丁目まで選択（代表地点の座標）
        } else {
          if (getValues('addressLabel') === '') {
            const area = AreaItem.filter(v => v.areaName === getValues('areaName'))[0];
            setValue('latitude', area.lat, { shouldDirty: true });
            setValue('longitude', area.lon, { shouldDirty: true });
            // 最後まで選択（通常の座標）
          } else {
            const address = AddressItem.filter(v => v.addressLabel === getValues('addressLabel'))[0];
            setValue('latitude', address.lat, { shouldDirty: true });
            setValue('longitude', address.lon, { shouldDirty: true });
          }
        }
        break;
      default:
        break;
    }
    // 避難先の選択解除
    setValue('hinanSaki', -1);
    // 再レンダリングを強制
    setUpdate(update ? false : true);
  }

  /* 地点タイプの変更イベント */
  register('pointType', {
    onChange(event) {
      // 初期化
      setValue('cityCode', -1, { shouldDirty: true });
      setValue('areaName', '', { shouldDirty: true });
      setValue('addressLabel', '', { shouldDirty: true });
      setValue('address', '', { shouldDirty: true });
      setValue('latitude', '', { shouldDirty: true });
      setValue('longitude', '', { shouldDirty: true });
      setPoint(event.target.value - 1); // 最後に再描画
    }
  })

  const [update, setUpdate] = React.useState(false);
  /* 市区町村変更イベント */
  register('cityCode', {
    onChange(event) {
      const city = CityItem.filter(v => v.cityCode === Number(getValues('cityCode')))[0];
      if (city) {
        setValue('address', city.cityName, { shouldDirty: true });
      } else {
        setValue('address', '', { shouldDirty: true });
      }
      setValue('areaName', '', { shouldDirty: true });
      setValue('addressLabel', '', { shouldDirty: true });
      // 再レンダリングを強制
      setUpdate(update ? false : true);
    }
  })

  /* 大字・町丁目変更イベント */
  register('areaName', {
    onChange(event) {
      const city = CityItem.filter(v => v.cityCode === Number(getValues('cityCode')))[0];
      setValue('address', city.cityName + getValues('areaName'), { shouldDirty: true });
      setValue('addressLabel', '', { shouldDirty: true });
      // 再レンダリングを強制
      setUpdate(update ? false : true);
    }
  })

  /* 街区符号・地番変更イベント */
  register('addressLabel', {
    onChange(event) {
      const city = CityItem.filter(v => v.cityCode === Number(getValues('cityCode')))[0];
      const address = AddressItem.filter(v => v.addressLabel === getValues('addressLabel'))[0];
      if (address) {
        setValue('address', city.cityName + getValues('areaName') + address.addressNumber, { shouldDirty: true });
      } else {
        setValue('address', city.cityName + getValues('areaName'), { shouldDirty: true });
      }
      // 再レンダリングを強制
      setUpdate(update ? false : true);
    }
  })

  return (
    <div>
      <FormControl sx={{ marginTop: 1 }}>
        <FormLabel>避難開始地点</FormLabel>
        <Card variant='outlined' sx={{ paddingBottom: 1, paddingRight: 1 }}>
          <div>
            <Controller
              name='pointType'
              control={control}
              render={({ field, fieldState }) => (
                <FormControl sx={{ marginTop: 0, marginBottom: 1, paddingLeft: 1 }}
                  error={fieldState.error}>
                  <RadioGroup sx={{ paddingLeft: 1 }} name='pointType' row
                    {...field}>
                    {KaishiChitenItem.map((option, index) => (
                      <FormControlLabel value={option.value} control={<Radio size='small' />} label={option.label} />
                    ))}
                  </RadioGroup>
                  <FormHelperText>{fieldState.error ? fieldState.error?.message : ''}</FormHelperText>
                </FormControl>
              )} />
          </div>
          <ThemeProvider theme={theme}>
            <Box sx={{ paddingLeft: 2 }}>
              <Stack direction='row' spacing={1}>
                {/* 市区町村 */}
                <Controller
                  name='cityCode'
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl size='small' sx={{ minWidth: '5em', width: '100%' }} error={fieldState.error}>
                      <InputLabel id='cityCode' shrink>区</InputLabel>
                      <Select
                        {...field}
                        notched
                        labelId='cityCode'
                        id='cityCode'
                        label='区' // InputLabelの文字列を基準に長さを調整
                        disabled={!isAddressPoint}
                        displayEmpty
                      >
                        <MenuItem value={-1}>
                          <em>（未選択）</em>
                        </MenuItem>
                        {CityItem.map((option, index) => (
                          <MenuItem value={option.cityCode}>{option.cityName}</MenuItem>
                        ))};
                      </Select>
                    </FormControl>
                  )}
                />
                {/* 大字・町丁目 */}
                <Controller
                  name='areaName'
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl size='small' sx={{ minWidth: '5em', width: '100%' }} error={fieldState.error}>
                      <InputLabel id='areaName' shrink>大字・町丁目</InputLabel>
                      <Select
                        {...field}
                        notched
                        labelId='areaName'
                        id='areaName'
                        label='大字・町丁目___' // InputLabelの文字列を基準に長さを調整
                        disabled={!isAddressPoint}
                        displayEmpty
                      >
                        <MenuItem value={''}>
                          <em>（未選択）</em>
                        </MenuItem>
                        {AreaItem.filter(
                          v => v.cityCode === Number(getValues('cityCode'))
                        ).map((option, index) => (
                          <MenuItem value={option.areaName}>{option.areaName}</MenuItem>
                        ))};
                      </Select>
                    </FormControl>
                  )}
                />
                {/* 街区符号・地番 */}
                <Controller
                  name='addressLabel'
                  control={control}
                  render={({ field, fieldState }) => (
                    <FormControl size='small' sx={{ minWidth: '5em', width: '100%' }} error={fieldState.error}>
                      <InputLabel id='addressLabel' shrink>街区符号・地番</InputLabel>
                      <Select
                        {...field}
                        notched
                        labelId='addressLabel'
                        id='addressLabel'
                        label='街区符号・地番____' // InputLabelの文字列を基準に長さを調整
                        disabled={!isAddressPoint}
                        displayEmpty
                      >
                        <MenuItem value={''}>
                          <em>（未選択）</em>
                        </MenuItem>
                        {AddressItem.filter(
                          v => v.areaName === getValues('areaName')
                        ).map((option, index) => (
                          <MenuItem value={option.addressLabel}>{option.addressNumber}</MenuItem>
                        ))};
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
              <Box sx={{ paddingTop: 1, paddingBottom: 1, }}>
                <FormLabel>住所：{getValues('address')}</FormLabel>
              </Box>
              <Box>
                <Controller
                  name='latitude'
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField sx={{ marginTop: 1, minWidth: '10m', width: '10em' }}
                      {...field}
                      id='latitude'
                      label='緯度　' variant='outlined' size='small'
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ readonly: true }}
                      disabled={false}
                      error={fieldState.error}
                      helperText={fieldState.error ? fieldState.error?.message : ''}
                    />
                  )} />
                <Controller
                  name='longitude'
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField sx={{ marginTop: 1, marginLeft: 1, minWidth: '10m', width: '10em' }}
                      {...field}
                      id='longitude'
                      label='経度　' variant='outlined' size='small'
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ readonly: true }}
                      disabled={false}
                      error={fieldState.error}
                      helperText={fieldState.error ? fieldState.error?.message : ''}
                    />
                  )} />
                <Button onClick={getPoint} sx={{ m: 1, border: 2 }} variant='outlined' size='medium'>位置情報取得</Button>
              </Box>
            </Box>
          </ThemeProvider>
        </Card>
      </FormControl>
    </div>
  );
}