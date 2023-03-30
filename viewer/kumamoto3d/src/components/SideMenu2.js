import '../App.css';
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import { useFormContext } from 'react-hook-form';
import {
  KaishiJikanItem,
  KojinZokuseiItem,
  HinanShudanItem,
  HinansakiItem,
  SaigaiSyuruiItem,
} from '../data/ItemData';
import { HinanCase, SaigaiCase } from '../data/CaseData'

const noSet = '　'

const condition = {
  saigaiKind: noSet,         /* 災害種類 */
  saigaiScenario: noSet,     /* 災害発生シナリオ */
  saigaiScenarioInfo: noSet, /* 災害発生シナリオ説明 */
  hinanScenario: noSet,      /* 避難シナリオ */
  hinanScenarioInfo: noSet,  /* 避難シナリオの説明 */
  latitude: noSet,           /* 緯度 */
  longitude: noSet,          /* 経度 */
  attribute: noSet,          /* 個人属性 */
  startTime: noSet,          /* 開始時間 */
  hinanMeans: noSet,         /* 避難手段 */
  hinanSaki: noSet,          /* 避難先 */
};

export default function SideMenu2() {
  const {
    getValues,
    setValue,
  } = useFormContext();
  if (getValues('latitude') === 1) setValue('latitude', null);
  if (getValues('longitude') === 1) setValue('longitude', null);

  if (getValues('isSubmit')) {
    var v = SaigaiSyuruiItem.filter(v => v.value === Number(getValues('saigaiKind')));
    var num = 0;
    console.log(v);
    condition.saigaiKind = SaigaiSyuruiItem.filter(v => v.value === Number(getValues('saigaiKind')))[0].label;
    num = Number(getValues('saigaiScenario'));
    condition.saigaiScenario = SaigaiCase.filter(v => v.id === num)[0].title;
    condition.saigaiScenarioInfo = SaigaiCase[num - 1].info;
    num = Number(getValues('hinanScenario'));
    condition.hinanScenario = HinanCase.filter(v => v.id === num)[0].title;
    condition.hinanScenarioInfo = HinanCase[num - 1].info;
    condition.latitude = getValues('latitude');
    condition.longitude = getValues('longitude');
    condition.attribute = KojinZokuseiItem.filter(v => v.value === Number(getValues('attribute')))[0].label;
    condition.startTime = KaishiJikanItem.filter(v => v.category === Number(getValues('saigaiKind')) && v.value === Number(getValues('startTime')))[0].label;
    condition.hinanMeans = HinanShudanItem.filter(v => v.value === Number(getValues('hinanMeans')))[0].label;
    condition.hinanSaki = HinansakiItem.filter(v => v.value === Number(getValues('hinanSaki')))[0].label;
    // setValue('isSubmit',false); 
  }

  return (
    <div>
      {/* <Box sx={{ m:1,border:1,p:1}}> */}
      <Paper sx={{ m: [0, 1], p: 1 }} elevation={4}>
        <FormLabel style={{ fontSize: '1rem' }}>設定条件</FormLabel>
        <Box sx={{ p: 1 }}>
          <div>
            <div className='Setting-Label'>災害種類</div>
            <div className='Setting-Item'>
              <FormLabel style={{ fontSize: '1rem' }}>{condition.saigaiKind}</FormLabel>
            </div>
          </div>
          <div>
            <div className='Setting-Label'>災害発生シナリオ</div>
            <div className='Setting-Item'>
              <FormLabel style={{ fontSize: '1rem' }}>{condition.saigaiScenario}</FormLabel>
              <div>
                <FormLabel style={{ fontSize: '0.8rem' }}>{condition.saigaiScenarioInfo}</FormLabel>
              </div>
            </div>
          </div>
          <div>
            <div className='Setting-Label'>避難行動シナリオ</div>
            <div className='Setting-Item'>
              <FormLabel style={{ fontSize: '1rem' }}>{condition.hinanScenario}</FormLabel>
              <div>
                <FormLabel style={{ fontSize: '0.8rem' }}>{condition.hinanScenarioInfo}</FormLabel>
              </div>
            </div>
          </div>
          <div>
            <div className='Setting-Label'>避難開始地点</div>
            <div className='Setting-Item'>
              <div><FormLabel style={{ fontSize: '1rem' }}>緯度：{condition.latitude}</FormLabel></div>
              <div><FormLabel style={{ fontSize: '1rem' }}>経度：{condition.longitude}</FormLabel></div>
            </div>
          </div>
          <div>
            <div className='Setting-Label'>個人属性</div>
            <div className='Setting-Item'>
              <FormLabel style={{ fontSize: '1rem' }}>{condition.attribute}</FormLabel>
            </div>
          </div>
          <div>
            <div className='Setting-Label'>避難開始時間</div>
            <div className='Setting-Item'>
              <FormLabel style={{ fontSize: '1rem' }}>{condition.startTime}</FormLabel>
            </div>
          </div>
          <div>
            <div className='Setting-Label'>避難手段</div>
            <div className='Setting-Item'>
              <FormLabel style={{ fontSize: '1rem' }}>{condition.hinanMeans}</FormLabel>
            </div>
          </div>
          <div>
            <div className='Setting-Label'>避難先</div>
            <div className='Setting-Item'>
              <FormLabel style={{ fontSize: '1rem' }}>{condition.hinanSaki}</FormLabel>
            </div>
          </div>
        </Box>
      </Paper>
    </div>
  )
}

