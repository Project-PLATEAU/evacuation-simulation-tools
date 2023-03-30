//// import ////
// React
import * as React from 'react';
import { useState, useMemo } from 'react';

// Material-UI
import { styled } from '@mui/system';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionActions from '@mui/material/AccordionActions';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';

// 入力フォームデータ
import { useFormContext, useWatch } from 'react-hook-form';
import { SaigaiCase, HinanCase } from '../data/CaseData'
import { KojinZokuseiItem, HinanShudanItem, KaishiJikanItem, HinansakiItem } from '../data/ItemData';

// Resium
import {
  Viewer, Scene, Globe, ImageryLayer, SkyAtmosphere, SkyBox,
  CameraLookAt, CameraFlyTo, ScreenSpaceCameraController,
  CzmlDataSource, GeoJsonDataSource, Cesium3DTileset // データ読込
} from 'resium';

// Cesium
import {
  ClockViewModel, Clock as CesiumClock, JulianDate, ClockRange, ClockStep, // 時間関連
  Math as CesiumMath, Cartesian3, Rectangle, // 計算関連
  Ion, IonResource, CesiumTerrainProvider, UrlTemplateImageryProvider, // 地形・背景地図データ関連
  ScreenSpaceEventType, SunLight, Color, Cesium3DTileStyle // その他
} from 'cesium';

// JSON（CZML）データの読込
async function fetchJSON(path, comment) {
  const out = await fetch(path)
    .then(response => response.json())
  //.catch( err => alert('Resium fetchJSON ' + comment + ': ' + err.message));
  return out;
}

// 共通データ
const trafficLightData = fetchJSON('/other/traffic_light.czml', '信号');
const schoolDistrictData = fetchJSON('/other/school_district.geojson', '小学校区');


export default function Resium() {
  // alert('** Resium **')
  // console.log('** Resium **');
  const { getValues, setValue, watch, control } = useFormContext();
  const mode = getValues('simMode');
  // alert('mode: ' + mode)

  let view3D;
  let view2D;

  // カメラ設定（メイン）
  const homeCameraDestination = new Cartesian3.fromDegrees(130.638, 32.728, 300);
  const homeCameraOrientation = { pitch: CesiumMath.toRadians(-30) };

  // 描画範囲
  // 緯度経度（west, south, east, north）
  const graphicLimit = new Rectangle.fromDegrees(130.55, 32.7, 130.75, 32.85);

  // PLATEAU配信サービスのアクセストークン
  Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE';

  // Imageryデータ
  // PLATEAU配信サービスのPLATEAUオルソ（航空写真）
  const imageryProvider_PLATEAU = new UrlTemplateImageryProvider({
    url: 'https://gic-plateau.s3.ap-northeast-1.amazonaws.com/2020/ortho/tiles/{z}/{x}/{y}.png', // 整備地域のみ
    maximumLevel: 19,
    rectangle: graphicLimit
  });

  // clockViewModel（メイン地図と全体ミニマップで同期が必要）
  const clock = new CesiumClock({
    clockRange: ClockRange.CLAMPED, // 時間範囲の端に達した時は停止
    clockStep: ClockStep.SYSTEM_CLOCK_MULTIPLIER, // 時間経過の設定
    multiplier: 5, // 起動時再生速度
    shouldAnimate: false, // 自動再生しない
  });
  const clockViewModel = new ClockViewModel(clock);

  //// シナリオ・ケース選択 ////
  if (watch('isSubmit')) {
    // ケース選択
    // const saigaiKind = SaigaiSyuruiItem.filter(v => v.value === Number(getValues('saigaiKind')))[0].label;
    const saigaiCase = SaigaiCase.filter(v => v.id === Number(getValues('saigaiScenario')))[0];
    const hinanCase = HinanCase.filter(v => v.id === Number(getValues('hinanScenario')))[0];

    const caseName = saigaiCase.name + '_' + hinanCase.name;
    const casePath = '/sim_result/' + caseName + '/'; // ルートパスで指定
    // alert('Resuim casePath: ' + casePath);

    // 選択ケースの各種データを入力
    var carData = fetchJSON(casePath + 'car_min.czml', '自動車');
    var walkData = fetchJSON(casePath + 'walk_min.czml', '徒歩');
    var evacuationSiteData = fetchJSON(casePath + 'evacuation_site_with_count_min.czml', '避難場所');
    var miniMapData = fetchJSON(casePath + 'car_jutai.czml', '渋滞箇所');
    var FloodData = fetchJSON('/flood/' + saigaiCase.name + '/time_control.czml', '浸水');

    var kojinZokusei = KojinZokuseiItem.filter(v => v.value === Number(getValues('attribute')))[0];
    var hinanShudan = HinanShudanItem.filter(v => v.value === Number(getValues('hinanMeans')))[0];
    var kaishiJikan = KaishiJikanItem.filter(v => v.value === Number(getValues('startTime')))[0];
    var hinansaki = HinansakiItem.filter(v => v.value === Number(getValues('hinanSaki')))[0];
    var personalFile = getValues('personalFile');
    var startAddress = getValues('address');

    // 時間範囲を決定
    var simStartTimeStr = saigaiCase.simulationStartTime; // シミュレーション開始時刻
    var simStopTimeStr = saigaiCase.simulationStopTime;  // シミュレーション終了時刻（浸水後）

    var simTimeRangeStr = simStartTimeStr.concat('/', simStopTimeStr);

    var startTime = new JulianDate.fromIso8601(simStartTimeStr);
    var stopTime = new JulianDate.fromIso8601(simStopTimeStr);

    clock.startTime = startTime;
    clock.stopTime = stopTime;
    clock.currentTime = startTime; // startTimeをセット
  }

  //// 関数 ////
  // 日時文字列を作成（CZML用）
  function getStrDateTimeCZML(dateTime) {
    const obj = new JulianDate.toDate(dateTime);
    const date = obj.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' });
    const time = obj.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateEdited = date.substr(0, 4) + '-' + date.substr(5, 2) + '-' + date.substr(8, 2); // ハイフン接続で文字列作成 
    return dateEdited + 'T' + time + '+09';
  };

  // 日時文字列を作成（表示用）
  function getStrDateTimeDisplay(dateTime) {
    const obj = new JulianDate.toDate(dateTime);
    const date = obj.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const weekday = obj.toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo', weekday: 'short' });
    const time = obj.toLocaleTimeString('ja-JP', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return date + ' (' + weekday + ') ' + time;
  };

  // 時刻文字列を作成（ラベル表示用）
  function getStrTimeJpn(dateTime) {
    const obj = new JulianDate.toDate(dateTime);
    return obj.getHours() + ' 時 ' + obj.getMinutes() + ' 分 ' + obj.getSeconds() + ' 秒';
  };

  // ユーザーのCZMLデータを作成
  async function makeUserCzml() {
    // ユーザー情報を読込
    const res = await fetch('https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/personal/' + personalFile, { mode: 'cors' }); // サーバー上のシミュレーション結果を呼び出す
    const json = await res.json();
    const userLastState = json.state
    const userOriginPosition = json.route;
    const userPassingTime = json.time;
    const userCumsumDistance = json.distance;

    //// 時間設定 ////
    // ユーザーオブジェクトの描画時間を延長（避難開始前＆避難完了後も描画）
    const simTimeRangeSec = JulianDate.secondsDifference(stopTime, startTime); // シミュレーション時間（sec）
    const userFirstPosition = userOriginPosition.slice(0, 4); userFirstPosition[0] = 0; // 最初のXYZ（1～4番目）
    const userLastPosition = userOriginPosition.slice(-4); userLastPosition[0] = simTimeRangeSec; // 最後のXYZ
    const userPosition = userFirstPosition.concat(userOriginPosition, userLastPosition);

    // ユーザーの避難開始時刻と避難完了時刻（sec）
    const userStartTimeSec = userOriginPosition[0];
    const userStopTimeSec = userOriginPosition.slice(-4)[0];

    // ユーザーの避難所要時間（sec）
    const userStartTime = new JulianDate.addSeconds(startTime, userStartTimeSec, new JulianDate());
    const userStopTime = new JulianDate.addSeconds(startTime, userStopTimeSec, new JulianDate());
    const userMovingTimeSec = userStopTimeSec - userStartTimeSec;

    // カレントタイムを上書き
    clock.currentTime = userStartTime;

    // 避難所要時間（表示用文字列）
    let userMovingTimeStr = '';
    if (userMovingTimeSec >= 3600) {
      userMovingTimeStr = Math.floor(userMovingTimeSec / 3600) + ' 時間 ' + (Math.floor(userMovingTimeSec / 60) % 60) + ' 分 ' + (userMovingTimeSec % 60) + ' 秒'
    } else if (userMovingTimeSec >= 60) {
      userMovingTimeStr = (Math.floor(userMovingTimeSec / 60) % 60) + ' 分 ' + (userMovingTimeSec % 60) + ' 秒'
    } else {
      userMovingTimeStr = userMovingTimeSec + ' 秒'
    }

    //// 時間によって変化するラベルのテキストを作成 ////
    const labelsLength = userCumsumDistance.length;
    const userTotalDistance = Math.max(...userCumsumDistance);
    const userRemainDistanceKM = new Array(labelsLength);
    const labelsArray = [];

    let timeRangeStart = '';
    let timeRangeStop = '';
    let textInterval = '';
    let textString = '';

    const hinansakiLabel = hinansaki.label.replace('【徒歩】 ', '').replace('【自動車】 ', ''); // 暫定処理（避難先名称を修正）

    // 避難完了前のラベル表示
    const timeIntervalBeforeUserStart = simStartTimeStr + '/' + getStrDateTimeCZML(userStartTime);
    labelsArray.push({
      interval: timeIntervalBeforeUserStart,
      string: '避難先：' + hinansakiLabel + '\n' + getStrTimeJpn(userStartTime) + ' に避難開始'
    });

    // 避難中のラベル表示
    for (let i = 1; i < labelsLength; i += 1) {
      userRemainDistanceKM[i] = Math.ceil((userTotalDistance - userCumsumDistance[i - 1]) / 100) / 10; // 100m単位で切り上げし、X.Xkm単位でセット
      timeRangeStart = getStrDateTimeCZML(new JulianDate.addSeconds(startTime, userPassingTime[i - 1], new JulianDate()));
      timeRangeStop = getStrDateTimeCZML(new JulianDate.addSeconds(startTime, userPassingTime[i], new JulianDate()));
      textInterval = timeRangeStart + '/' + timeRangeStop;

      switch (userLastState) {
        case 4:
          textString = '避難先：' + hinansakiLabel + '\n残り ' + userRemainDistanceKM[i].toFixed(1) + ' km';
          break;
        case 8:
          textString = hinansakiLabel + ' に避難しようとしましたが、\n周囲が既に浸水していたため避難できませんでした';
          break;
        case 9:
          textString = hinansakiLabel + ' への避難中に浸水に巻き込まれます';
          break;
        default:
          textString = '計算エラー（避難先：' + hinansakiLabel + '）';
          break;
      }

      var obj = {
        interval: textInterval,
        string: textString
      };
      labelsArray.push(obj);
    }

    // 避難完了後のラベル表示
    const timeIntervalAfterUserStop = getStrDateTimeCZML(userStopTime) + '/' + simStopTimeStr;

    let textStringAfterUserStop = '';
    switch (userLastState) {
      case 4:
        textStringAfterUserStop = hinansakiLabel + ' に避難完了しました！\n所要時間は ' + userMovingTimeStr + ' でした';
        break;
      case 8:
        textStringAfterUserStop = hinansakiLabel + ' に避難しようとしましたが、\n周囲が既に浸水していたため避難できませんでした'; // 移動中と記述が同じ
        break;
      case 9:
        textStringAfterUserStop = hinansakiLabel + ' への避難中に浸水に巻き込まれました\n被災時刻：' + getStrDateTimeDisplay(userStopTime);
        break;
      default:
        textString = '計算エラー（避難先：' + hinansakiLabel + '）';
        break;
    }

    labelsArray.push({
      interval: timeIntervalAfterUserStop,
      string: textStringAfterUserStop
    });

    //// 説明（インフォボックス用記述）////
    let userDescription = ''
    let labelFillColor = [];
    if (userLastState === 4) {
      userDescription = '出発地：'.concat(startAddress,
        '<br> 避難先：', hinansakiLabel,
        '<br> 個人属性：', kojinZokusei.label,
        '<br> 避難手段：', hinanShudan.label,
        '<br> 避難開始時間の選択：', kaishiJikan.label,
        '<br> 避難　開始時刻：', getStrDateTimeDisplay(userStartTime),
        '<br> 避難先到着時刻：', getStrDateTimeDisplay(userStopTime),
        '<br> 避難所要時間：', userMovingTimeStr,
        '<br> 移動距離：', userTotalDistance, ' m');
      labelFillColor = [0, 255, 0, 255];
    } else {
      userDescription = '出発地：'.concat(startAddress,
        '<br> 避難先：', hinansakiLabel,
        '<br> 個人属性：', kojinZokusei.label,
        '<br> 避難手段：', hinanShudan.label,
        '<br> 避難開始時間の選択：', kaishiJikan.label,
        '<br> 避難開始時刻：', getStrDateTimeDisplay(userStartTime),
        '<br> 被災時刻：', getStrDateTimeDisplay(userStopTime),
        '<br> 移動距離：', userTotalDistance, ' m');
      labelFillColor = [255, 0, 0, 255]; // 被災時
    }

    //// CZML形式データの用意 ////
    const output = [
      { id: 'document', version: '1.0' },
      {
        id: 'user',
        name: 'あなた',
        description: userDescription,
        model: {
          gltf: '/icon/arrow_green_3mUp.glb',
          minimumPixelSize: 50,
          maximumScale: 1000,
          scale: 1.0,
          show: [{ interval: timeIntervalBeforeUserStart, boolean: false }, { interval: timeIntervalAfterUserStop, boolean: false }], // 避難開始前、完了後は非表示
        },
        label: {
          text: labelsArray,
          font: '30px sans-serif',
          fillColor: { rgba: labelFillColor },
          style: 'FILL_AND_OUTLINE',
          outlineColor: { rgba: [0, 0, 0, 255] },
          outlineWidth: 5,
          horizontalOrigin: 'CENTER',
          verticalOrigin: 'BOTTOM',
          pixelOffset: { cartesian2: [0, -100] },
          pixelOffsetScaleByDistance: { nearFarScalar: [1, 1, 10000, 0.3] },
          disableDepthTestDistance: 100000
        },
        path: {
          material: {
            polylineOutline: {
              color: { rgba: [255, 255, 0, 100] },
              outlineColor: { rgba: [255, 255, 0, 50] },
              outlineWidth: 3
            }
          },
          width: 10,
        },
        viewFrom: { cartesian: [0, -200, 50] },
        orientation: { velocityReference: '#position' },
        availability: simTimeRangeStr,
        position: {
          epoch: simStartTimeStr,
          cartographicDegrees: userPosition
        }
      }
    ];
    return output;
  }

  // 全体ミニマップ用のCZMLデータを作成
  async function makeUserCzmlMiniMap() {
    // ユーザー情報を読込
    const res = await fetch('https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/personal/' + personalFile, { mode: 'cors' });
    const json = await res.json();
    const userOriginPosition = json.route;

    //// 時間設定 ////
    // ユーザーオブジェクトの描画時間を延長（避難開始前＆避難完了後も描画）
    const simTimeRangeSec = JulianDate.secondsDifference(stopTime, startTime); // シミュレーション時間（sec）
    const userFirstPosition = userOriginPosition.slice(0, 4); userFirstPosition[0] = 0; // 最初のXYZ（1～4番目）
    const userLastPosition = userOriginPosition.slice(-4); userLastPosition[0] = simTimeRangeSec; // 最後のXYZ
    const userPosition = userFirstPosition.concat(userOriginPosition, userLastPosition);

    //// CZML形式データの用意 ////
    const output = [
      { id: 'document', version: '1.0' },
      {
        id: 'userMiniMap',
        point: {
          color: { rgba: [0, 255, 0, 255] },
          outlineColor: { rgba: [0, 0, 0, 255] },
          pixelSize: 10,
          disableDepthTestDistance: 100000
        },
        label: {
          text: '現在地',
          font: 'bold 12px sans-serif',
          fillColor: { rgba: [0, 0, 0, 255] },
          style: 'FILL_AND_OUTLINE',
          outlineColor: { rgba: [255, 255, 255, 255] },
          outlineWidth: 1,
          horizontalOrigin: 'CENTER',
          verticalOrigin: 'BOTTOM',
          pixelOffset: { cartesian2: [0, -8] },
          disableDepthTestDistance: 100000
        },
        path: {
          material: {
            polylineOutline: {
              color: { rgba: [255, 255, 0, 255] },
              outlineColor: { rgba: [255, 255, 0, 255] },
              outlineWidth: 1
            }
          },
          width: 3
        },
        availability: simTimeRangeStr,
        position: {
          epoch: simStartTimeStr,
          cartographicDegrees: userPosition
        }
      }
    ]
    return output;
  }

  // ユーザーの描画コンテンツを作成
  function PersonalComponent() {
    let output;
    switch (mode) {
      case '1':  // ３Ｄ水害避難シミュレーション
        break;
      case '2':  // ３Ｄパーソナル避難シミュレーション
        output = <CzmlDataSource data={makeUserCzml()}
          // 参考
          // https://github.com/reearth/resium-workshop/blob/master/README.md
          // https://groups.google.com/g/cesium-dev/c/5HhdAYC7ccg
          onLoad={dataSource => {
            // ユーザーオブジェクトを選択
            const entity = dataSource.entities.getById('user')
            view3D.trackedEntity = entity;
            view3D.selectedEntity = undefined; // entityを指定すると起動時にSelectionIndicatorおよびInfoBoxを表示するが、意図せずカメラボタンを押されると追跡しなくなるので非表示で設定（undefined）

            // タイムラインバーの表示時間範囲を更新
            view3D.timeline.updateFromClock();
            view3D.timeline.zoomTo(
              view3D.clock.startTime,
              view3D.clock.stopTime
            );
          }}
        />
        break;
      default:
        break;
    }
    return output;
  }

  // 全体ミニマップ用のユーザーの描画コンテンツを作成
  function MiniMapPersonalComponent() {
    let output;
    switch (mode) {
      case '1':  // ３Ｄ水害避難シミュレーション
        break;
      case '2':  // ３Ｄパーソナル避難シミュレーション
        output = <CzmlDataSource data={makeUserCzmlMiniMap()} />
        break;
      default:
        break;
    }
    return output;
  }

  // チェックボックスの切替に対応したGlobeコンポーネント
  function MyGlobe() {
    const checkDepthTest = useWatch({
      control,
      name: 'checkDepthTest',
    });
    const checkLighting = useWatch({
      control,
      name: 'checkLighting',
    });

    // requestVertexNormalsが変わっても地形データを再度ダウンロードはしていない模様（useMemoによって、他のチェック項目の変更による再描画を防ぐ）
    const terrainProvider = useMemo(() => new CesiumTerrainProvider({ url: IonResource.fromAssetId(770371), requestVertexNormals: checkLighting }), [checkLighting]);

    return (
      <Globe
        terrainProvider={terrainProvider}
        depthTestAgainstTerrain={!checkDepthTest} // falseで地形モデル（Terrain）の地下にあるオブジェクトを描画
        cartographicLimitRectangle={graphicLimit} // 対象領域
        enableLighting={checkLighting}
        baseColor={Color.BLACK} // 背景図を読み込まない（存在しない）領域の色
      />
    )
  }

  // チェックボックスの切替に対応した避難場所（アイコン・ラベル）のコンポーネント
  function EvacuationSite() {
    const show = useWatch({
      control,
      name: 'checkEvacuationSite',
    });
    return (
      <CzmlDataSource data={evacuationSiteData} show={show} />
    )
  }

  // チェックボックスの切替に対応した浸水データのコンポーネント
  function Flood() {
    const show = useWatch({
      control,
      name: 'checkFlood',
    });
    return (
      <CzmlDataSource data={FloodData} show={show} />
    )
  }

  // アコーディオンのタイトル部分（スタイル適用）
  const StyledAccordionSummary = styled(AccordionSummary)(() => ({
    '&.MuiAccordionSummary-root': {
      minHeight: 25,
      maxHeight: 25,
      backgroundColor: '#FFFFFF',
      '&.Mui-expanded': {
        minHeight: 25,
        maxHeight: 25,
        backgroundColor: '#FFFFFF',
      },
      //border: '1px solid rgba(0, 0, 0, .125)',
      //boxShadow: 'none',
      borderRadius: 5,
    }
  }));

  // 全体ミニマップ（アコーディオン機能付き）、参考： https://mui.com/material-ui/react-accordion/
  function MiniMap() {
    return (
      <Box sx={{ position: 'absolute', top: 10, left: 10, width: 250, zIndex: 2 }}>
        <Accordion defaultExpanded={true}>
          <StyledAccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel1a-content'
            id='panel1a-header'
          >
            <Typography variant='body1' align='center' sx={{ width: '100%' }}>全体マップ</Typography>
          </StyledAccordionSummary>
          <AccordionActions>
            <Box>
              <div>
                {/* ２Ｄ地図 */}
                <Viewer
                  ref={(e) => {
                    if (e?.cesiumElement) {
                      view2D = e.cesiumElement;
                      view2D.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK); // ダブルクリックによる動きを拒否（Resiumでの実行方法が不明）
                    }
                  }}

                  style={{
                    position: 'relative',
                    width: 240,
                    height: 240,
                  }}

                  imageryProvider={false} // falseでベースの背景図を読まない

                  clockViewModel={clockViewModel}
                  automaticallyTrackDataSourceClocks={false} // CZMLデータの時間範囲から設定しない
                  animation={false}
                  timeline={false}
                  selectionIndicator={false} // 選択後の機能搭載が困難
                  infoBox={false}            // 画面が小さいので属性情報の確認が困難
                  creditContainer={document.createElement('div')} // クレジット表示を変更

                  // ボタン配置（なし）
                  baseLayerPicker={false}
                  fullscreenButton={false}
                  geocoder={false}
                  homeButton={false}
                  navigationHelpButton={false}
                  scene3DOnly={false}
                  sceneModePicker={false}
                  vrButton={false}
                >

                  {/* カメラ設定 */}
                  <CameraLookAt target={new Cartesian3.fromDegrees(130.62, 32.78, 0)} offset={new Cartesian3(0, 0, 15000)} />

                  {/* 全体ミニマップの操作（受け付けない） */}
                  <ScreenSpaceCameraController
                    enableTranslate={false}
                    enableZoom={false}
                    enableRotate={false}
                    enableTilt={false}
                    enableLook={false}
                  />

                  {/* 全体ミニマップの背景色 */}
                  <Globe baseColor={Color.WHITE} />

                  {/* 追加データ */}
                  <CzmlDataSource data={miniMapData} />
                  <GeoJsonDataSource data={schoolDistrictData} fill={Color.LIGHTGREEN} stroke={Color.BLACK} strokeWidth={20} />
                  <MiniMapPersonalComponent />
                </Viewer>

                {/* 全体ミニマップの凡例 */}
                <List dense={true} disablePadding={true}
                  style={{
                    position: 'relative',
                    width: 240,
                    height: 110,
                    padding: '10px'
                  }}
                >
                  <ListItem dense={true} disablePadding={true} >
                    <ListItemText primary='渋滞箇所表示' primaryTypographyProps={{ fontSize: 14, fontWeight: 'bold', display: 'flex', justifyContent: 'center' }} />
                  </ListItem>
                  <ListItem dense={true} disablePadding={true} >
                    <Avatar sx={{ bgcolor: '#FF0000', width: 7, height: 7 }}> </Avatar>
                    <ListItemText primary='　自由走行速度の20％未満' primaryTypographyProps={{ fontSize: 12 }} />
                  </ListItem>
                  <ListItem dense={true} disablePadding={true} >
                    <Avatar sx={{ bgcolor: '#FFB74C', width: 7, height: 7 }}> </Avatar>
                    <ListItemText primary='　自由走行速度の20％以上～50％未満' primaryTypographyProps={{ fontSize: 12 }} />
                  </ListItem>
                  <ListItem dense={true} disablePadding={true} >
                    <ListItemText secondary='　対象地域 小学校区（国土数値情報）' secondaryTypographyProps={{ fontSize: 12 }} />
                  </ListItem>
                </List>
              </div>
            </Box>
          </AccordionActions>
        </Accordion>
      </Box>
    )
  }

  // 描画設定（アコーディオン機能付き）、参考： https://mui.com/material-ui/react-accordion/
  function DrawingSettings() {
    return (
      <Box sx={{ position: 'absolute', top: 10, left: 270, zIndex: 2 }}>
        <Accordion defaultExpanded={false}>
          <StyledAccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls='panel1b-content'
            id='panel1b-header'
          >
            <Typography variant='body1' align='center' sx={{ width: '100%' }}>描画設定</Typography>
          </StyledAccordionSummary>
          <AccordionActions>
            <Box sx={{ width: '100%' }}>
              <Stack>
                <MyCheckbox name={'checkDepthTest'} text='３Ⅾ地形の下（奥）を表示' />
                <MyCheckbox name={'checkLighting'} text='昼夜を表現' />
                <MyCheckbox name={'checkEvacuationSite'} text='避難場所を表示' />
                <MyCheckbox name={'checkFlood'} text='浸水データを表示' />
              </Stack>
            </Box>
          </AccordionActions>
        </Accordion>
      </Box>
    )
  }

  // チェックボックスの切替
  function MyCheckbox({ name, text }) {
    const [checked, setChecked] = useState(getValues(name));
    const handleChange = (event) => {
      setValue(name, event.target.checked, { shouldDirty: true });
      setChecked(event.target.checked);
    };
    return (
      <FormControlLabel control={
        <Checkbox
          checked={checked}
          onChange={handleChange}
          inputProps={{ 'aria-label': 'controlled' }}
          size='small'
        />}
        label={<Box fontSize={15} >{text}</Box>}
      />
    );
  }

  return (
    <Viewer
      ref={(e) => {
        if (e?.cesiumElement) {
          view3D = e.cesiumElement;

          // 協定世界時（UTC）を日本標準時に更新（オーバーライド）
          // 参考1： https://cesium.com/blog/2018/03/21/czml-time-animation/
          // 参考2： https://community.cesium.com/t/change-timeline-from-utc-to-local-time/11203/6
          // 参考3： https://www.programmerall.com/article/9225714394/

          // 曜日表示用の配列、getDayメソッドの数値で参照（0：日曜日）
          const dayStr = ['日', '月', '火', '水', '木', '金', '土'];
          // タイムコントローラーの表示年月日を更新（曜日を追加）
          view3D.animation.viewModel.dateFormatter = (date) => {
            const JpnDateStr = new JulianDate.toDate(date).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
            const JpnDateObj = new Date(JpnDateStr);
            return JpnDateStr + ' ' + dayStr[JpnDateObj.getDay()];
          };
          // タイムコントローラーの表示時間を日本標準時に更新
          view3D.animation.viewModel.timeFormatter = (date) => {
            return JulianDate.toDate(date).toLocaleTimeString({ timeZone: 'Asia/Tokyo' });
          };
          // タイムラインバーの表示を更新（西暦の頭2桁をカット、曜日を追加）
          view3D.timeline.makeLabel = (date) => {
            const JpnDateStr = new JulianDate.toDate(date).toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' });
            const JpnDateObj = new Date(JpnDateStr);
            return JpnDateStr.slice(2) + ' ' + dayStr[JpnDateObj.getDay()] + ' ' + JulianDate.toDate(date).toLocaleTimeString({ timeZone: 'Asia/Tokyo' });
          };

          // ホームボタン設定を上書き（オーバーライド）
          // 参考： https://www.chisou.go.jp/tiiki/toshisaisei/itoshisaisei/text/text4.pdf
          view3D.homeButton.viewModel.command.beforeExecute.addEventListener(
            function (e) {
              e.cancel = true;
              switch (mode) {
                case '1':  // ３Ｄ水害避難シミュレーション
                  view3D.camera.flyTo({
                    destination: homeCameraDestination,
                    orientation: homeCameraOrientation,
                    duration: 0 // 移動にかける秒数
                  });
                  break;
                case '2':  // ３Ｄパーソナル避難シミュレーション
                  // 複数のデータソースから探索（CustomDataSourceで追加されたEntityも対応）
                  const dataSources = view3D.dataSources;
                  let entity;
                  if (dataSources.length > 0) {
                    // loop through datasources to find entities with the selected object's id.
                    for (let x = 0; x < dataSources.length; x++) {
                      // console.info('datasource: ', dataSources.get(x));
                      entity = dataSources.get(x).entities.getById('user'); // getの代わりにgetByNameは効かない？ ⇒ 全ループ
                      if (entity !== undefined) {
                        view3D.trackedEntity = entity;
                        view3D.selectedEntity = undefined;
                        break;
                      }
                    }
                  }
                  break;
                default:
                  break;
              }
            }
          );

          // 太陽の点を非表示（sun のshow: falseが効かないので、undefinedを用いる）
          view3D.scene.sun = undefined;
        }
      }}

      style={{
        position: 'absolute',
        display: 'block',
        width: '78%',
        height: '90%',
        zIndex: 1
      }}

      imageryProvider={false} // falseでベースの背景図を読まない

      clockViewModel={clockViewModel}
      automaticallyTrackDataSourceClocks={false} // CZMLデータの時間範囲から設定しない
      animation={true}
      timeline={true}
      selectionIndicator={true}
      infoBox={true}

      // ボタン配置
      baseLayerPicker={false}
      fullscreenButton={false}
      geocoder={false}
      homeButton={true}
      navigationHelpButton={false}
      scene3DOnly={true}
      sceneModePicker={false}
      vrButton={false}

    // 拡張プラグイン（mixin）
    // extend={[viewerCesiumInspectorMixin, viewerCesium3DTilesInspectorMixin, viewerDragDropMixin]}
    >

      {/* カメラ設定 */}
      <CameraFlyTo destination={homeCameraDestination} orientation={homeCameraOrientation} duration={0} once={true} />

      {/* メインマップの操作、カメラの高さ（メートル）を制限 */}
      <ScreenSpaceCameraController maximumZoomDistance={30000} />

      {/* 地形モデル（Terrain）および地形に貼り付ける背景図 */}
      <MyGlobe />
      <ImageryLayer imageryProvider={imageryProvider_PLATEAU} />

      {/* 空模様 */}
      <SkyAtmosphere
        hueShift={0.05}        // 色相（0(1)：青緑、0.25：紫、0.5：橙、0.75：黄緑）
        saturationShift={-0.1} // 彩度（1：鮮やか、-1：モノクロ）
        brightnessShift={-0.3} // 明度（1：白、-1：黒）
      />

      {/* 宇宙（黒地に星々あり）を表示しない ⇒ SceneのbackgroundColorで色付け */}
      <SkyBox show={false} />

      {/* 個別コンポーネントで記述できなかった項目を追加 */}
      <Scene
        backgroundColor={Color.BLACK} // 対象領域外の色（SkyBoxがfalseの場合に適用）
        light={new SunLight({ intensity: 2.0 })}
      />

      {/* CZMLデータ
        ・参考1 https://github.com/AnalyticalGraphicsInc/czml-writer/wiki/CZML-Structure
        ・参考2 https://github.com/AnalyticalGraphicsInc/czml-writer/wiki/Packet
      */}
      <CzmlDataSource data={carData} />
      <CzmlDataSource data={walkData} />
      <EvacuationSite />
      <Flood />
      <PersonalComponent />
      <CzmlDataSource data={trafficLightData} />

      {/* 3D Tiles 建物モデル */}
      <Cesium3DTileset
        url={'/bldg/tileset.json'}
        maximumScreenSpaceError={16} // デフォルト値の16では非表示になりやすい、0方向に動かすことで非表示になりにくい（10では画面の端が非表示となることがある）
        // 3D Tiles のスタイルは独自の記述方法
        // https://github.com/CesiumGS/3d-tiles/tree/main/specification/Styling
        style={new Cesium3DTileStyle({
          color: "color('lightgray', 1.0)" // lightgray, gray, darkgray
        })}
      />

      {/* 全体ミニマップと描画設定 */}
      <MiniMap />
      <DrawingSettings />

    </Viewer>
  );
}
