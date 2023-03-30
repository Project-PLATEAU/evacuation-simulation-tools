# saigaiKind:災害種類
# saigaiScenario:災害発生シナリオ
# hinanScenario:避難行動シナリオ
# latitude:緯度
# longitude:経度
# attribute:個人属性
# startTime:避難開始時間
# hinanMeans:避難手段
# hinanSaki:避難先

import subprocess
import urllib.request
import os
#import cgi
#import cgitb
from pyproj import Transformer
import xml.dom.minidom
from urllib.parse import urlparse

#cgitb.enable()

# パラメータファイルの出力
def write_param(fname, query):
    # 緯度、経度を平面直角座標第2系（epsg:6670）に変換
    latitude, longitude = float(query['latitude'][0]), float(query['longitude'][0])
    transf = Transformer.from_crs('epsg:4326', 'epsg:6670')
    y, x = transf.transform(latitude, longitude) # 入力、出力の順番に注意
    encode ='shift_jis' # 'UTF-8'
    with open(fname, 'w', encoding=encode) as f:
        f.write(query['saigaiKind'][0]+',saigaiKind'+'\n')          # 災害種類
        f.write(query['saigaiScenario'][0]+',saigaiScenario'+'\n')  # 災害発生シナリオ
        f.write(query['hinanScenario'][0]+',hinanScenario'+'\n')    # 避難行動シナリオ
        f.write(str(x)+',X from longitude'+'\n')                    # 東西
        f.write(str(y)+',Y from latitude'+'\n')                     # 南北
        f.write(query['attribute'][0]+',attribute'+'\n')            # 個人属性
        f.write(query['startTime'][0]+',startTime'+'\n')            # 避難開始時間
        f.write(query['hinanMeans'][0]+',hinanMeans'+'\n')          # 避難手段
        f.write(query['hinanSaki'][0]+',hinanSaki'+'\n')            # 避難先

# XML文字列の生成
def create_Xml(rd, msg):
    dom = xml.dom.minidom.Document()
    root = dom.createElement('results')
    dom.appendChild(root)
    subnode = dom.createElement('code')
    subnode.appendChild(dom.createTextNode(str(rd)))
    root.appendChild(subnode)
    subnode = dom.createElement('message')
    subnode.appendChild(dom.createTextNode(str(msg)))
    root.appendChild(subnode)
    return dom.toprettyxml()

# main
if __name__ == '__main__':
    try:
        # クエリ文字列のパース
        if 'QUERY_STRING' in os.environ:
            #query = cgi.parse(os.environ['QUERY_STRING'])
            query = urllib.parse.parse_qs(os.environ['QUERY_STRING'])
        else:
            query = {}

        # パラメータの出力
        paramf = './fort/param/@f@.txt'
        paramf = paramf.replace('@f@',query['id'][0])
        write_param(paramf, query)

        # シミレーションの同時実行
        if query['hinanMeans'][0] == '1': # 徒歩
            batchF = 'walk.bat'
        else:                             # 自動車
            batchF = 'car.bat'
        param = ' '.join([query['id'][0], query['saigaiScenario'][0], query['hinanScenario'][0]])
        cmd = batchF + ' ' +  param
        folder1 = os.getcwd() + '/fort/batch'
        ret = subprocess.run(cmd, shell=True, cwd=folder1, check=True)
        print ('Access-Control-Allow-Origin: *')
        print ('Status: 200 OK')
        print ('Content-type: application/xml\n')
        print (create_Xml(ret.returncode, ret.stderr))
    except Exception as e:
        print ('Access-Control-Allow-Origin: *')
        print ('Status: 201 Created')
        print ('Content-type: application/xml\n')
        print (create_Xml(10, e))
        #print (create_Xml(10, os.environ['QUERY_STRING']))
        
