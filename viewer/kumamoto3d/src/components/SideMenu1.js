import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import FormLabel from '@mui/material/FormLabel';
import { useFormContext } from 'react-hook-form';
import Scenario from './Scenario';
import GraphDialog from './GraphDialog';

export default function SideMenu1() {

  // こちらでは利用しないが、３Ｄパーソナル避難シミュレーション側で利用するためにsetStateSaigaiKindを渡せるようにする
  const [stateSaigaiKind, setStateSaigaiKind] = React.useState(0);

  // submitをハンドリング
  const handleOnSubmit = (values) => {
    // alert('開始');
    setValue('isSubmit', true);
    clearErrors();
  };
  const handleOnError = (errors) => {
    console.log(errors);
  };

  const {
    setValue,
    handleSubmit,
    clearErrors,
  } = useFormContext();

  // バリデーションエラーにならないように未使用フィールドに値を設定
  setValue('latitude', -1);
  setValue('longitude', -1);
  setValue('startTime', 1);
  setValue('hinanSaki', 1);
  // alert('SideMenu1');

  return (
    <div>
      <Paper sx={{ m: [0, 1], p: 1 }} elevation={4}>
        <FormLabel>条件を設定してください</FormLabel>
        <Box sx={{ p: 1 }}>
          <Scenario isRow={false} setStateSaigaiKind={setStateSaigaiKind} />
        </Box>
      </Paper>
      <Button onClick={handleSubmit(handleOnSubmit, handleOnError)}
        sx={{ m: 2, border: 2, width: '85%' }} variant='outlined' size='medium'
      >
        データ読込開始
      </Button>
      <GraphDialog />
    </div>
  );
}

