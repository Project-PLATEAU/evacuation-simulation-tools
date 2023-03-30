import * as yup from 'yup';

// スキーマを定義
// inputのvalue値のエラー条件を定義

export const InputSchema = yup.object().shape({
  saigaiKind: yup         // 災害種類
    .number()
    .min(1,'災害種類を選択してください。'),
  saigaiScenario: yup   // 災害発生シナリオ
    .number()
    .min(1,'災害発生シナリオを選択してください。'),
  hinanScenario: yup    // 避難シナリオ
    .number()
    .min(1,'避難シナリオを選択してください。'),
  pointType: yup        // 地点タイプ
    .number()
    .min(1,'地点タイプを選択してください。'),
  zipCode: yup          // 郵便番号
    .number(),
  address: yup          // 住所
    .string()
    .test('optionAddress', '住所を入力してください。', function(value) {
      if (this.parent.pointType === 2 && value === '') {
        return false;
      }
      return true;
    }),
  latitude: yup         // 緯度 
    .number('緯度は数値で入力してください。')
    .nullable()
    .typeError('緯度は数値で入力してください。')
    .required('緯度を入力してください。'),
  longitude: yup        // 経度 
    .number('経度は数値で入力してください。') 
    .nullable()
    .typeError('経度は数値で入力してください。')
    .required('経度を入力してください。'),
  attribute: yup        // 個人属性
    .number() 
    .min(1,'個人属性を選択してください。'),
  startTime: yup        // 開始時間 
    .number() 
    .min(-48,'開始時間を選択してください。'),
  hinanMeans: yup       // 避難手段 
    .number() 
    .min(1,'避難手段を選択してください。'),
  hinanSaki: yup        // 避難先 
    .number() 
    .min(1,'避難先を選択してください。'),
});
