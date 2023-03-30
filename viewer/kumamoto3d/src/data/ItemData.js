/* 災害種類 */
export const SaigaiSyuruiItem =[
  {
    value: 1 ,
    label: '洪水',
   },
  {
    value: 2 ,
    label: '高潮',
  },
  {
    value: 3 ,
    label: '津波',
  },
];

/* 避難開始地点 */
export const KaishiChitenItem =[
  {
    value: 1 ,
    label: 'あなたのＰＣから位置を取得',
   },
  {
    value: 2 ,
    label: '住所を入力',
  },
];

/* 個人属性 */
/* valueはユニークである必要があるため、要配慮者を暫定で3としている */
export const KojinZokuseiItem =[
  {
    value: 4 ,
    label: '健常者',
   },
  {
    value: 1 ,
    label: '高齢者',
  },
  {
    value: 3 ,
    label: '要配慮者',
  },
];

/* 避難手段 */
export const HinanShudanItem =[
  {
    value: 1 ,
    label: '徒歩',
   },
  {
    value: 2 ,
    label: '自動車',
  },
];

/* 避難開始時間用ラベル */
export const KaishiJikanLabelItem =[
  {category: 1, label: '９時に高齢者等避難（警戒レベル３）が発令、その６時間後の１５時に避難指示（警戒レベル４）が発令されました。'},
  {category: 2, label: '９時に高齢者等避難（警戒レベル３）が発令、その６時間後の１５時に避難指示（警戒レベル４）が発令されました。'},
  {category: 3, label: '１２時００分に地震が発生、その３分後の１２時０３分に避難指示が発令されました。'},
];

/* 避難開始時間（valueは経過秒） */
export const KaishiJikanItem =[
  {category: 1, value: 300,   label: '高齢者等避難（警戒レベル３）発令から 5分後'},
  {category: 1, value: 600,   label: '高齢者等避難（警戒レベル３）発令から 10分後'},
  {category: 1, value: 1200,  label: '高齢者等避難（警戒レベル３）発令から 20分後'},
  {category: 1, value: 1800,  label: '高齢者等避難（警戒レベル３）発令から 30分後'},
  {category: 1, value: 3600,  label: '高齢者等避難（警戒レベル３）発令から 1時間後'},
  {category: 1, value: 7200,  label: '高齢者等避難（警戒レベル３）発令から 2時間後'},
  {category: 1, value: 10800, label: '高齢者等避難（警戒レベル３）発令から 3時間後'},
  {category: 1, value: 14400, label: '高齢者等避難（警戒レベル３）発令から 4時間後'},
  {category: 1, value: 18000, label: '高齢者等避難（警戒レベル３）発令から 5時間後'},
  {category: 1, value: 21900, label: '避難指示（警戒レベル４）発令から 5分後'},
  {category: 1, value: 22200, label: '避難指示（警戒レベル４）発令から 10分後'},
  {category: 1, value: 22800, label: '避難指示（警戒レベル４）発令から 20分後'},
  {category: 1, value: 23400, label: '避難指示（警戒レベル４）発令から 30分後'},
  {category: 1, value: 25200, label: '避難指示（警戒レベル４）発令から 1時間後'},
  {category: 1, value: 28800, label: '避難指示（警戒レベル４）発令から 2時間後'},
  {category: 1, value: 32400, label: '避難指示（警戒レベル４）発令から 3時間後'},
  {category: 1, value: 36000, label: '避難指示（警戒レベル４）発令から 4時間後'},
  {category: 1, value: 39600, label: '避難指示（警戒レベル４）発令から 5時間後'},

  {category: 2, value: 300,   label: '高齢者等避難（警戒レベル３）発令から 5分後'},
  {category: 2, value: 600,   label: '高齢者等避難（警戒レベル３）発令から 10分後'},
  {category: 2, value: 1200,  label: '高齢者等避難（警戒レベル３）発令から 20分後'},
  {category: 2, value: 1800,  label: '高齢者等避難（警戒レベル３）発令から 30分後'},
  {category: 2, value: 3600,  label: '高齢者等避難（警戒レベル３）発令から 1時間後'},
  {category: 2, value: 7200,  label: '高齢者等避難（警戒レベル３）発令から 2時間後'},
  {category: 2, value: 10800, label: '高齢者等避難（警戒レベル３）発令から 3時間後'},
  {category: 2, value: 14400, label: '高齢者等避難（警戒レベル３）発令から 4時間後'},
  {category: 2, value: 18000, label: '高齢者等避難（警戒レベル３）発令から 5時間後'},
  {category: 2, value: 21900, label: '避難指示（警戒レベル４）発令から 5分後'},
  {category: 2, value: 22200, label: '避難指示（警戒レベル４）発令から 10分後'},
  {category: 2, value: 22800, label: '避難指示（警戒レベル４）発令から 20分後'},
  {category: 2, value: 23400, label: '避難指示（警戒レベル４）発令から 30分後'},
  {category: 2, value: 25200, label: '避難指示（警戒レベル４）発令から 1時間後'},
  {category: 2, value: 28800, label: '避難指示（警戒レベル４）発令から 2時間後'},
  {category: 2, value: 32400, label: '避難指示（警戒レベル４）発令から 3時間後'},
  {category: 2, value: 36000, label: '避難指示（警戒レベル４）発令から 4時間後'},
  {category: 2, value: 39600, label: '避難指示（警戒レベル４）発令から 5時間後'},

  {category: 3, value: 180, label: '地震発生から 3分後'},
  {category: 3, value: 240, label: '地震発生から 4分後'},
  {category: 3, value: 300, label: '地震発生から 5分後'},
  {category: 3, value: 360, label: '地震発生から 6分後'},
  {category: 3, value: 420, label: '地震発生から 7分後'},
  {category: 3, value: 480, label: '地震発生から 8分後'},
  {category: 3, value: 540, label: '地震発生から 9分後'},
  {category: 3, value: 600, label: '地震発生から 10分後'},
  {category: 3, value: 900, label: '地震発生から 15分後'},
  {category: 3, value: 1200, label: '地震発生から 20分後'},
];

/* 避難先 */
/* category: 1は徒歩用（value: 1000未満）、category: 2は自動車用（value: 1000以上） */
/* valueの値順に並べる必要なし（徒歩：50音順、自動車：宇土方面（平木橋）から反時計回り） */
export const HinansakiItem =[
  {category: 1, value: 24, label: '飽田公園運動場', lat: 32.757768, lon: 130.651791},
  {category: 1, value: 23, label: '飽田中学校', lat: 32.760081, lon: 130.653513},
  {category: 1, value: 26, label: '飽田西小学校', lat: 32.754641, lon: 130.633896},
  {category: 1, value: 22, label: '飽田東小学校', lat: 32.763097, lon: 130.662251},
  {category: 1, value: 27, label: '飽田まちづくりセンター・公民館', lat: 32.754402, lon: 130.653548},
  {category: 1, value: 28, label: '飽田南小学校', lat: 32.750142, lon: 130.662915},
  {category: 1, value: 38, label: 'アクアドームくまもと', lat: 32.763367, lon: 130.667877},
  {category: 1, value: 30, label: '奥古閑小学校', lat: 32.730595, lon: 130.624544},
  {category: 1, value: 6, label: '小島公園', lat: 32.775679, lon: 130.637599},
  {category: 1, value: 4, label: '小島小学校', lat: 32.778965, lon: 130.634592},
  {category: 1, value: 15, label: '花陵中学校', lat: 32.779312, lon: 130.678554},
  {category: 1, value: 33, label: '川口小学校', lat: 32.717522, lon: 130.627398},
  {category: 1, value: 34, label: '川尻小学校', lat: 32.739829, lon: 130.681847},
  {category: 1, value: 7, label: '河内交流室・公民館', lat: 32.836681, lon: 130.583859},
  {category: 1, value: 8, label: '河内小学校', lat: 32.828436, lon: 130.591516},
  {category: 1, value: 9, label: '旧河内小学校白浜分校', lat: 32.841890, lon: 130.586991},
  {category: 1, value: 10, label: '河内中学校', lat: 32.828428, lon: 130.590583},
  {category: 1, value: 12, label: '熊本西高校', lat: 32.782722, lon: 130.649432},
  {category: 1, value: 1, label: '三和中学校', lat: 32.786011, lon: 130.665220},
  {category: 1, value: 14, label: '城山公園運動施設', lat: 32.775687, lon: 130.651184},
  {category: 1, value: 11, label: '城山小学校', lat: 32.778053, lon: 130.657128},
  {category: 1, value: 5, label: '城西中学校', lat: 32.781948, lon: 130.633432},
  {category: 1, value: 25, label: '白川飽田緑地', lat: 32.769503, lon: 130.661625},
  {category: 1, value: 19, label: '白川中原緑地', lat: 32.769703, lon: 130.643632},
  {category: 1, value: 13, label: '西部環境工場', lat: 32.774128, lon: 130.646789},
  {category: 1, value: 3, label: '西部公民館', lat: 32.776376, lon: 130.647513},
  {category: 1, value: 2, label: '西部交流センター', lat: 32.776459, lon: 130.646647},
  {category: 1, value: 35, label: '銭塘小学校', lat: 32.741676, lon: 130.645965},
  {category: 1, value: 16, label: '高橋小学校', lat: 32.784200, lon: 130.656276},
  {category: 1, value: 29, label: '天明体育館', lat: 32.732459, lon: 130.635926},
  {category: 1, value: 31, label: '天明中学校', lat: 32.734460, lon: 130.636448},
  {category: 1, value: 32, label: '天明まちづくりセンター・公民館', lat: 32.732855, lon: 130.636816},
  {category: 1, value: 17, label: '中島小学校', lat: 32.766600, lon: 130.628889},
  {category: 1, value: 18, label: '中島中央公園', lat: 32.766841, lon: 130.627449},
  {category: 1, value: 36, label: '中緑小学校', lat: 32.730923, lon: 130.660262},
  {category: 1, value: 37, label: '南部総合スポーツセンター', lat: 32.755320, lon: 130.673341},
  {category: 1, value: 20, label: '旧松尾西小学校', lat: 32.797863, lon: 130.614642},
  {category: 1, value: 21, label: '旧松尾東小学校', lat: 32.796608, lon: 130.634616},

  {category: 2, value: 1001, label: '宇土方面（国道501号，平木橋）', lat: 32.720127, lon: 130.614558},
  {category: 2, value: 1002, label: '川尻四丁目方面', lat: 32.735188, lon: 130.605547},
  {category: 2, value: 1003, label: '川尻駅の北（畠口川尻停車場線）', lat: 32.782746, lon: 130.665835},
  {category: 2, value: 1004, label: '白藤公園方面', lat: 32.730909, lon: 130.606821},
  {category: 2, value: 1005, label: '西熊本駅の北（熊本港線）', lat: 32.718252, lon: 130.626329},
  {category: 2, value: 1006, label: 'イオン西熊本の裏', lat: 32.785133, lon: 130.655655},
  {category: 2, value: 1007, label: '蓮台寺橋方面', lat: 32.785537, lon: 130.655428},
  {category: 2, value: 1008, label: '熊本車両センター方面', lat: 32.763120, lon: 130.655166},
  {category: 2, value: 1017, label: '八島方面', lat: 32.768321, lon: 130.610933},
  {category: 2, value: 1009, label: 'イオンタウン田崎の前', lat: 32.718915, lon: 130.628931},
  {category: 2, value: 1010, label: '万日山トンネル方面', lat: 32.777237, lon: 130.670992},
  {category: 2, value: 1011, label: '谷尾崎町方面（西廻りバイパス）', lat: 32.771958, lon: 130.627872},
  {category: 2, value: 1012, label: '鼓ヶ滝方面（河内）', lat: 32.761703, lon: 130.658999},
  {category: 2, value: 1013, label: 'ナルシストの丘方面（河内）', lat: 32.768438, lon: 130.663579},
  {category: 2, value: 1014, label: '玉名市方面（国道501号）', lat: 32.842951, lon: 130.588158},
  {category: 2, value: 1015, label: 'アクアドームくまもと', lat: 32.746385, lon: 130.626295},
];
