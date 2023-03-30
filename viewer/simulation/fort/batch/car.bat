@echo off
title 熊本水害_自動車パーソナル

:goto step3

set time_stamp=%~1
set saigai_case=%~2
set hinan_case=%~3

:-----------------------------------------------------
:step1
echo 出発地の最寄りのリンク（セクション）の情報をゲット
:-----------------------------------------------------
echo STEP1 carSection_P Start
set RC=03
set F01=10,formatted,old    ,..\NW\推計用_自動車セクションデータ.txt
set F02=11,formatted,old    ,..\param\%time_stamp%.txt
set F03=30,formatted,unknown,..\out\5車Section_%time_stamp%.txt
..\exe\15_carSection_P.exe
:..\slib\15_carSection_P\x64\debug\15_carSection_P.exe
if errorlevel 1 echo ERROR LEVEL 1
if errorlevel 1 goto err


:-----------------------------------------------------
:step2
echo 自動車避難の出発セクションの確定
:-----------------------------------------------------
echo STEP2 carInitial Start
set RC=05
set F01=10,formatted,old    ,..\NW\自動車NW_case_%saigai_case%.txt
set F02=11,formatted,old    ,..\NW\着地点テーブル（自動車）.csv
set F03=12,formatted,old    ,..\NW\リンクSQNst.txt
set F04=15,formatted,old    ,..\out\5車Section_%time_stamp%.txt
set F05=30,formatted,unknown,..\out\6車Initial_%time_stamp%.csv
..\exe\25_carInitial_P.exe
:..\slib\25_carInitial_P\x64\debug\25_carInitial_P.exe
if errorlevel 1 echo ERROR LEVEL 1
if errorlevel 1 goto err


:--------------------------------------------------------
:step3
echo 自動車のパーソナル避難行動シミュレーション
:--------------------------------------------------------
echo STEP3 carPersonal Start
set RC=11
set F01=10,formatted,old    ,..\settings\自動車条件1_case_%saigai_case%.txt
set F02=11,formatted,old    ,..\settings\自動車条件2.txt
set F03=12,formatted,old    ,..\NW\自動車NW_case_%saigai_case%.txt
set F04=13,formatted,old    ,..\NW\セクションデータ.csv
set F05=14,formatted,old    ,..\NW\信号現示.csv
set F06=15,formatted,old    ,..\NW\交差点情報.txt
set F07=20,formatted,old    ,..\out\6車Initial_%time_stamp%.csv
set F08=21,unformatted,old  ,..\case_data\case_%saigai_case%_%hinan_case%\リンク情報.txt
set F09=22,unformatted,old  ,..\case_data\case_%saigai_case%_%hinan_case%\セクション情報.txt
set F10=23,formatted,old    ,..\NW\セクション浸水時刻_case_%saigai_case%.csv
set F11=30,formatted,unknown,..\out\7車_避難情報_%time_stamp%.txt
..\exe\50_carpersonal_v5.exe
:..\slib\50_carpersonal_v5\x64\Debug\50_carpersonal_v5.exe
:..\slib\50_carpersonal_v5\x64\release\50_carpersonal_v5.exe
if errorlevel 1 echo ERROR LEVEL 1
if errorlevel 1 goto err


:--------------------------------------------------------
:step4
echo 自動車避難の経路データ配列の作成
:--------------------------------------------------------
echo STEP4 carRoute Start
set RC=04
set F01=07,formatted,unknown,..\out\8車_経路データ配列_%time_stamp%.txt
set F02=10,formatted,old    ,..\NW\3次元座標テーブル_楕円体高_自動車NW_車線別.csv
set F03=11,formatted,old    ,..\out\7車_避難情報_%time_stamp%.txt
set F04=20,formatted,unknown,..\personal\%time_stamp%.json
..\exe\make_car_route_array.exe
if errorlevel 1 echo ERROR LEVEL 1
if errorlevel 1 goto err

goto end

:err
exit /b 1

:end
exit /b 0
