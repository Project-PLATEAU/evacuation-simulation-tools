import '../App.css';
import React from 'react';
import SideMenu1 from './SideMenu1';
import SideMenu2 from './SideMenu2';
import SettingDialog from './SettingDialog';
import Resium from './Resium';

import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import { InputSchema } from '../schema/Schema';
import { Link } from 'react-router-dom';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(1),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: -320, // サイドメニューに合わせる
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }));

export default function AppMain(props) {
  const [isOpen, setOpenState] = React.useState(true);
  const [isOpenDlg, setOpenDlgState] = React.useState(false);

  const useFormMethods = useForm({
    mode: 'onSubmit',
    resolver: yupResolver(InputSchema),
    defaultValues: {
      saigaiKind: 1,             /* 災害種類 */
      saigaiScenario: -1,        /* 災害発生シナリオ */
      hinanScenario: -1,         /* 避難シナリオ */
      pointType: 1,              /* 地点タイプ */
      cityCode: -1,              /* 市区町村コード */
      areaName: '',              /* 町丁目名 */
      addressLabel: '',          /* 町丁目名＋街区番号・地番 */
      address: '',               /* 住所 */
      latitude: null,            /* 緯度 */
      longitude: null,           /* 経度 */
      attribute: 4,              /* 個人属性 */
      startTime: -99,            /* 開始時間 */
      hinanMeans: 1,             /* 避難手段 */
      hinanSaki: -1,             /* 避難先 */
      personalFile: '',          /* シミュレーション結果ファイル */
      isSubmit: false,           /* データ読込 */
      simMode: '',               /* props.mode */
      checkDepthTest: true,      /* UIのチェック状態（地形に対する深度テストの有無） */
      checkLighting: false,      /* UIのチェック状態（昼夜表現の有無） */
      checkEvacuationSite: true, /* UIのチェック状態（避難場所のアイコン・ラベルの表示有無） */
      checkFlood: true,          /* UIのチェック状態（浸水の表示有無） */
    }
  });
  const toggleOpenState = () => {
    setOpenState(!isOpen)
  };
  const dialogOpen = () => {
    //useFormMethods.setvalues('isSubmit',false);
    setOpenDlgState(true);
  };

  function Title() {
    let title = '';
    switch (props.mode) {
      case '1':  // ３Ｄ水害避難シミュレーション。
        title = <div>３Ｄ水害避難シミュレーション</div>;
        break;
      case '2':  // ３Ｄパーソナル避難シミュレーション
        title = <div>３Ｄパーソナル避難シミュレーション</div>;
        break;
      default:
        title = <div>３Ｄ水害避難シミュレーション</div>;
        break;
    }
    return title;
  }
  function SideMenu() {
    useFormMethods.setValue('simMode', props.mode);
    //console.log('## SideMenu: ' + useFormMethods.getValues('simMode'));
    let menu = '';
    switch (props.mode) {
      case '1':  // ３Ｄ水害避難シミュレーション
        menu = <SideMenu1 />;
        break;
      case '2':  // ３Ｄパーソナル避難シミュレーション
        menu =
          <div>
            <Button onClick={dialogOpen} sx={{ m: 2, border: 2, width: '85%' }} variant='outlined' size='medium'>条件設定</Button>
            <SideMenu2 />
          </div>;
        break;
      default:
        menu =
          <Box sx={{ marginTop: 2 }}>
            <div className='Setting-Item'>
              <Link to='/simulation1'>３Ｄ水害避難シミュレーション</Link>
            </div>
            <div className='Setting-Item'>
              <Link to='/simulation2'>３Ｄパーソナル避難シミュレーション</Link>
            </div>
          </Box>;
        break;
    }
    return menu;
  }

  function MainContent() {
    let content;
    // alert('MainContent実行');
    switch (props.mode) {
      case '1':  // ３Ｄ水害避難シミュレーション
        content =
          <Box display='flex' justifyContent='center'>
            <Resium />
          </Box>;
        break;
      case '2':  // ３Ｄパーソナル避難シミュレーション
        content =
          <Box display='flex' justifyContent='center'>
            <Resium />
          </Box>
        break;
      default:
        content = <Box />;
        break;
    }
    return content;
  }

  // alert('AppMain実行');

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* AppBar */}
      <Box sx={{ display: 'flex' }}>
        <AppBar
          position='fixed'
          sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='end'
              onClick={toggleOpenState}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant='h6'
              noWrap
              component='div'
              sx={{ display: 'block' }}
            >
              <Title />
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      {/* AppBar */}
      {/* Drawer */}
      <Drawer
        sx={{
          width: 320,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 320,
          },
        }}
        variant='persistent'
        anchor='left'
        open={isOpen}
      >
        <Toolbar />
        <FormProvider {...useFormMethods}>
          <SideMenu />
        </FormProvider>
      </Drawer>
      {/* Drawer */}
      {/* Main */}
      <Main open={isOpen}>
        <Toolbar />
        <FormProvider {...useFormMethods}>
          <SettingDialog show={isOpenDlg} setShow={setOpenDlgState} />
          <MainContent />
        </FormProvider>
      </Main>
      {/* Main */}
    </Box>
  );
}


