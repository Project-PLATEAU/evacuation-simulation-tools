@echo off
title 熊本水害_徒歩パーソナル

:goto step3

set time_stamp=%~1
set saigai_case=%~2

:-----------------------------------------------------
:step1
echo STEP1:自宅から最寄りのリンクに垂線をひく
:-----------------------------------------------------
set RC=03
set F01=10,formatted,old    ,..\NW\徒歩NW_case_%saigai_case%.txt
set F02=11,formatted,old    ,..\param\%time_stamp%.txt
set F03=30,formatted,unknown,..\out\1徒歩suisen_%time_stamp%.txt
..\exe\10_suisen_P.exe
if errorlevel 1 echo ERROR LEVEL 1
if errorlevel 1 goto err


:-----------------------------------------------------
:step2
echo STEP2:徒歩避難の際の経路情報を付加する 行き先は指定済み
:-----------------------------------------------------
set RC=05
set F01=05,formatted,old    ,..\param\%time_stamp%.txt
set F02=10,formatted,old    ,..\NW\徒歩NW_case_%saigai_case%.txt
set F03=11,formatted,old    ,..\NW\避難所テーブル（徒歩）.prn
set F04=15,formatted,old    ,..\out\1徒歩suisen_%time_stamp%.txt
set F05=30,formatted,unknown,..\out\2徒歩Initial_%time_stamp%.txt
..\exe\21_TohoInitial_P.exe
:..\slib\21_TohoInitial_P\x64\debug\21_TohoInitial_P.exe
if errorlevel 1 echo ERROR LEVEL 1
if errorlevel 1 goto err


:-----------------------------------------------------
:step3
echo STEP3:徒歩避難シミュレーション
:-----------------------------------------------------
set RC=06
set F01=04,formatted,old    ,..\param\%time_stamp%.txt
set F02=05,formatted,old    ,..\settings\徒歩条件_case_%saigai_case%.txt
set F03=10,formatted,old    ,..\NW\徒歩NW_case_%saigai_case%.txt
set F04=11,formatted,old    ,..\NW\避難所テーブル（徒歩）.prn
set F05=15,formatted,old    ,..\out\2徒歩Initial_%time_stamp%.txt
set F06=35,formatted,unknown,..\out\3徒歩_避難情報_%time_stamp%.csv
..\exe\40_tohosim_v2_P.exe
:..\slib\40_tohosim_v2_P\x64\debug\40_tohosim_v2_P.exe
if errorlevel 1 echo ERROR LEVEL 1
if errorlevel 1 goto err


:-----------------------------------------------------
:step4
echo STEP4:徒歩避難の経路データ配列の作成
:-----------------------------------------------------
set F01=..\out\3徒歩_避難情報_%time_stamp%.csv
set F02=..\NW\歩行者用ネットワーク_link4_3d.geojson
set F03=..\personal\%time_stamp%.json
Powershell.exe -ExecutionPolicy RemoteSigned -File ..\exe\make_walk_route_array.ps1 %F01% %F02% %F03%
if errorlevel 1 echo ERROR LEVEL 1
if errorlevel 1 goto err

goto end


:err
exit /b 1

:end
exit /b 0
