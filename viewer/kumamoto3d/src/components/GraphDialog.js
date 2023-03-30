import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';

import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { styled } from '@mui/material/styles';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js'; // https://www.chartjs.org/docs/latest/
import { Line, Bar } from 'react-chartjs-2'; // https://react-chartjs-2.js.org/examples/

// 入力フォームデータ
import { useFormContext } from 'react-hook-form';
import { SaigaiCase, HinanCase } from '../data/CaseData';
import { HinansakiItem } from '../data/ItemData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

// 参考
// ダイアログ（Full-screen dialogs）： https://mui.com/material-ui/react-dialog/
// タブ（Basic tabs）： https://mui.com/material-ui/react-tabs/
// Appbar内のToolbarにTabsを入れる（タブ部分を固定し、スクロールの対象外とする）

const titles = ['避難者数の推移（手段別・避難状況別）', '避難場所別・避難者数の推移'];
const graph2InitialValue = 38;

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

const StyledTab = styled((props) => <Tab {...props} />)(
  () => ({
    fontSize: 16,
  })
);

// JSON（CZML）データの読込
async function fetchJSON(path, comment) {
  const out = await fetch(path)
    .then(response => response.json())
  // .catch( err => alert('Resium fetchJSON ' + comment + ':  ' + err.message));
  return out;
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function GraphDialog() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(0);

  const { getValues } = useFormContext();

  const handleClickOpen = () => {
    if (getValues('isSubmit')) {
      setOpen(true);
    } else {
      alert('災害種類・災害発生シナリオ・避難行動シナリオを指定し、データを読み込んでください。');
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // グラフ描画
  function Graphs() {
    const saigaiCase = SaigaiCase.filter(v => v.id === Number(getValues('saigaiScenario')))[0].name;
    const hinanCase = HinanCase.filter(v => v.id === Number(getValues('hinanScenario')))[0].name;
    const casePath = '/sim_result/' + saigaiCase + '_' + hinanCase + '/'; // ルートパスで指定
    // alert('Graph casePath: ' + casePath);
    return (
      <Box sx={{ position: 'relative', top: 65 }}>
        {/* グラフ１ */}
        <TabPanel value={value} index={0}>
          <Box sx={{ width: '70%', marginLeft: '15%' }} alignItems='center' justifyContent='center' direction='column' >
            <Graph1 filePath={casePath + 'graph/g1_walk.json'} type={1} />
            <Divider sx={{ borderBottomWidth: 5, mt: 3, mb: 3 }} />
            <Graph1 filePath={casePath + 'graph/g1_car.json'} type={2} />
            <CommentForBackground />
            <Divider sx={{ borderBottomWidth: 5, mt: 3, mb: 3 }} />
            <Graph1 filePath={casePath + 'graph/g1_sum.json'} type={3} />
            <CommentForBackground />
          </Box>
        </TabPanel>
        {/* グラフ２ */}
        <TabPanel value={value} index={1}>
          <Box sx={{ width: '70%', marginLeft: '15%' }} >
            <Graph2 filePath={casePath + 'graph/g2.json'} />
            <CommentForBackground />
          </Box>
        </TabPanel>
      </Box>
    );
  }

  // グラフ１
  function Graph1({ filePath, type }) {
    const [data, setData] = React.useState();

    React.useEffect(() => {
      fetchJSON(filePath, 'グラフ１')
        .then((data) => {
          setData(data);
        });
    }, [filePath]);

    const typeNames = ['【徒歩】', '【自動車】', '【徒歩＋自動車】'];
    const options = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: titles[0] + typeNames[type - 1],
          font: { size: 25 }
        },
        legend: {
          labels: { font: { size: 18 } },
          reverse: true
        },
      },
      scales: {
        x: { title: { display: true, text: '経過時間（分）', font: { size: 20 } } },
        y: { title: { display: true, text: '人数（人）', font: { size: 20 } } }
      }
    };

    let content;
    if (typeof data === 'undefined') {
      content = <Box />;
    } else {
      content = <Line options={options} data={data} />;
    }
    return (content);
  }

  // グラフ２
  function Graph2({ filePath }) {
    const [data, setData] = React.useState();
    const [target, setTarget] = React.useState(graph2InitialValue); // 初期表示（グラフ２）

    React.useEffect(() => {
      fetchJSON(filePath, 'グラフ２')
        .then((data) => {
          setData(data);
          console.log(data);
        });
    }, [filePath]);

    const handleChange = (event) => {
      setTarget(event.target.value);
    };

    const options = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: titles[1] + '【' + HinansakiItem.filter(v => v.value === target)[0].label + '】',
          font: { size: 25 }
        },
        legend: { labels: { font: { size: 18 } } }
      },
      scales: {
        x: { title: { display: true, text: '経過時間（分）', font: { size: 20 } } },
        y: { title: { display: true, text: '人数（人）', font: { size: 20 } } }
      }
    };

    let content;
    if (typeof data === 'undefined') {
      content = <Box />;
    } else {
      content =
        <div>
          <Card sx={{ width: 320, mb: 1, borderColor: 'black' }} >
            <FormLabel sx={{ m: 1 }}>避難場所を選択してください</FormLabel>
            <FormControl size='small' sx={{ m: 1, width: '95%' }}>
              <InputLabel id='Graph2Select' shrink sx={{ fontSize: '1.3rem' }} >避難場所</InputLabel>
              <Select
                labelId='Graph2Select'
                id='Graph2Select'
                value={target}
                onChange={handleChange}
                label='避難場所__' // InputLabelの文字列を基準に長さを調整
              >
                {HinansakiItem.filter(function (v) {
                  return v.value < 1000; // 徒歩用
                }).map((option, index) => (
                  <MenuItem value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Card>
          <Bar options={options} data={data.filter(v => v.id === target)[0].data} />
        </div>;
    }
    return (content);
  }

  // 津波の際のバックグラウンド交通車両に対するコメント
  function CommentForBackground() {
    let content;
    if (Number(getValues('saigaiKind')) === 3) { // 津波で自動車避難の場合
      content = '※バックグラウンド交通車両は除く';
    } else {
      content = '';
    }

    return (
      <Typography sx={{ ml: 2 }} variant='h6'>
        {content}
      </Typography>
    );
  }

  return (
    <div>
      <Button onClick={handleClickOpen}
        sx={{ m: 2, border: 2, width: '85%' }} variant='outlined' size='medium'
      >
        グラフ表示（データ読込後に可）
      </Button>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar>
          <Toolbar>
            <IconButton
              edge='start'
              color='inherit'
              onClick={handleClose}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              閉じる
            </Typography>
            <Box display='flex' flexGrow={1} sx={{ position: 'relative', left: '-30px' }} >
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label='basic tabs'
                indicatorColor='secondary'
                textColor='inherit'
              >
                <StyledTab label={titles[0]} {...a11yProps(0)} />
                <StyledTab label={titles[1]} {...a11yProps(1)} />
              </Tabs>
            </Box>
          </Toolbar>
        </AppBar>
        {/* グラフ描画 */}
        <Graphs />
      </Dialog>
    </div>
  );
}
