@echo off

mkdir log

: 「遅延環境変数の展開」は必要なし
for %%M in (00000 00010 00020) do (
  title 高潮 %%Mmin
  echo ==================================================
  echo 高潮 %%Mmin
  "C:\Program Files\FME\fme.exe" Converter_Flood_Meshes_to_3DTiles.fmw ^
    --入力ファイル data\high_tide\BP001_SHAPE\BP001_%%Mm.SHP ^
    --出力パス out ^
    --平面直角座標系 JGD2K-02 ^
    --最大面数 10000 ^
    --LOG_FILE log\log_high_tide_BP001_%%Mm.txt
)

pause
