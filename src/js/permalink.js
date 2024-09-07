import store from './store'
import { transform } from 'ol/proj.js'
import * as Layers from '../js/layers'
import * as MyMap from '../js/mymap'
import axios from "axios";
import {GeoJSON} from "ol/format";
import {Circle,LineString,Polygon,Point} from "ol/geom";
import Feature from "ol/Feature";
import OLCesium from "ol-cesium";
import * as layers from "@/js/layers";
import {drawLayer, undoInteraction} from "../js/mymap";
import {fromLonLat} from "ol/proj";
export function permalinkEventSet (response) {
  // 起動時の処理------------------------------------------------------------------------------
  // value.layerはオブジェクトになっており、map01から04が入っている。
  store.commit('base/unshiftLayerList', {
    value: {
      id: 2,
      title: '淡色地図',
      layer: Layers.paleObj,
      opacity: 1,
      summary: Layers.paleSumm,
      component: ''
    },
    mapName: 'map01'
  });
  store.commit('base/unshiftLayerList', {
    value: {
      id: 2,
      title: '淡色地図',
      layer: Layers.paleObj,
      opacity: 1,
      summary: Layers.paleSumm,
      component: ''
    },
    mapName: 'map02'
  });
  store.commit('base/unshiftLayerList', {
    value: {
      id: 2,
      title: '淡色地図',
      layer: Layers.paleObj,
      opacity: 1,
      summary: Layers.paleSumm,
      component: ''
    },
    mapName: 'map03'
  });
  store.commit('base/unshiftLayerList', {
    value: {
      id: 2,
      title: '淡色地図',
      layer: Layers.paleObj,
      opacity: 1,
      summary: Layers.paleSumm,
      component: ''
    },
    mapName: 'map04'
  });

  if (window.location.hash !== '' || localStorage.getItem('startLayerList')) {
    // const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    // console.log(response.data)
    let hash
    if (response.data) {
      // hash = decodeURIComponent(response.data.replace('#', ''));
      hash = response.data.replace('#', '');
    } else {
      hash = decodeURIComponent(window.location.hash.replace('#', ''));
    }
    // 場所、ズームを復帰
    const map = store.state.base.maps.map01;
    if (hash) {
      const parts = hash.split('/');
      const center = [parseFloat(parts[1]), parseFloat(parts[2])]
      const center3857 = transform(center, 'EPSG:4326', 'EPSG:3857')
      map.getView().setCenter(center3857)
      map.getView().setZoom(parts[0])
    } else if (localStorage.getItem('startPositionCoord')) {
      console.log(localStorage.getItem('startPositionCoord'))
      const coordSplit = localStorage.getItem('startPositionCoord').split(',')
      const center = [parseFloat(coordSplit[0]), parseFloat(coordSplit[1])]
      const zoom = localStorage.getItem('startPositionZoom')
      console.log(zoom)
      map.getView().setCenter(center)
      map.getView().setZoom(zoom)
    } else {
      const center = fromLonLat([140.097, 37.856])
      const zoom = 6
      map.getView().setCenter(center)
      map.getView().setZoom(zoom)
    }
    // パラメータで復帰
    // まずパラメータをオブジェクトにする
    const obj = {};
    // console.log((hash.split('?')[1]))
    if (hash.split('?')[1]) {
      const parameter = hash.split('?')[1].split('&');
      for (let i of parameter) {
        obj[i.split('=')[0]] = i.split('=')[1];
      }
    }
    //①-------------------------------------------------------------------------
    //obj.Lをローカルストレージから作る。
    // console.log(obj.L)
    const startLayerList = JSON.parse(localStorage.getItem('startLayerList'))
    const startLayerList2 = JSON.parse(localStorage.getItem('startLayerList2'))
    let layerList = []
    let layerList2 = []
    if (startLayerList && !window.location.hash) {
      layerList = startLayerList.map((layer) => {
        return layer
      })
      layerList2 = startLayerList2.map((layer) => {
        return layer
      })
      console.log(layerList)
      obj.L = "[]" //ダミーを送る。
    }
    //---------------------------------------------------------------------------

    for (let key in obj) {
      // const maps = ['map01','map02','map03','map04']
      const maps = ['map01']
      maps.forEach((map) => {
        if (key === '3d' + map) {
          store.state.base.ol3d[map] = new OLCesium({map: store.state.base.maps[map]})
          const ol3d = store.state.base.ol3d[map]
          const scene = ol3d.getCesiumScene()
          const json = JSON.parse(obj[key])
          // console.log(obj[key])
          // console.log(json)
          const terrainProvider = new Cesium.PngElevationTileTerrainProvider({
            url: 'https://gsj-seamless.jp/labs/elev2/elev/{z}/{y}/{x}.png?prj=latlng&size=257',
            // url: 'https://tiles.gsj.jp/tiles/elev/mixed/{z}/{y}/{x}.png',
            // url: 'https://gsj-seamless.jp/labs/elev2/elev/gsi10m_latlng_257/{z}/{y}/{x}.png',
            tilingScheme: new Cesium.GeographicTilingScheme(),
            credit: '',
            heightScale: json.hight,
            // heightScale: 0.01,
          })
          // console.log(json.hight)
          store.state.base.hight[map] = json.hight
          scene.terrainProvider = terrainProvider
          scene.terrainProvider.heightmapTerrainQuality = 0.5
          scene.screenSpaceCameraController._minimumZoomRate = 1//10000
          // // ズームしたときの，ホイールに対する動作制御。
          scene.screenSpaceCameraController.minimumZoomDistance = 10
          // // めり込みにくくするためズーム制限
          scene.globe.depthTestAgainstTerrain = true


          //--------------------------------------------------------------
          // なぜか配列を操作できない。
          // console.log(store.state.base.maps[map].getLayers().getArray())
          // store.state.base.maps[map].getLayers().getArray().forEach((layer) => {
          //   // alert()
          //   console.log(layer.values_.layers)
          //   if (layer.values_.layers) {
          //     layer.values_.layers.getArray().forEach((gv) => {
          //       console.log(gv)
          //       if (!gv.values_.name) gv.setVisible(false)
          //     })
          //   }
          // })
          //--------------------------------------------------------------

          ol3d.setEnabled(true)
          // const json = JSON.parse(obj[key])
          // console.log(obj[key])
          // console.log(json)
          ol3d.getCamera().setTilt(json.tilt)
          ol3d.getCamera().setHeading(json.heading)
          ol3d.getCamera().setDistance(json.distance)
          store.state.base.toggle3d[map] = true
          document.querySelector('#' + map + '-3d').style.display = 'block'
          // scene.primitives.add(Cesium.createOsmBuildings());
          // drawLayer.set('altitudeMode', 'clampToGround')
        }
      })

      // if (key==='3d1') {
      //   const mapName = 'map01'
      //   store.state.base.ol3d[mapName] = new OLCesium({map: store.state.base.maps[mapName]})
      //   const ol3d = store.state.base.ol3d[mapName]
      //   const scene = ol3d.getCesiumScene()
      //   const terrainProvider = new Cesium.PngElevationTileTerrainProvider( {
      //     url: 'https://gsj-seamless.jp/labs/elev2/elev/{z}/{y}/{x}.png?prj=latlng&size=257',
      //     tilingScheme: new Cesium.GeographicTilingScheme(),
      //     magnification: 5,
      //     crossOrigin: 'anonymous',
      //   })
      //   scene.terrainProvider = terrainProvider
      //   scene.terrainProvider.heightmapTerrainQuality = 0.5
      //   ol3d.setEnabled(true)
      //   const json = JSON.parse(obj[key])
      //   ol3d.getCamera().setTilt(json.tilt)
      //   ol3d.getCamera().setHeading(json.heading)
      // }
      if (key === 'DL') {
        // store.state.info.dokujiUrl['map01'] = JSON.parse(obj[key]).url
        // store.state.info.dokujiName['map01'] = JSON.parse(obj[key]).name
        store.state.info.dokujiLayers = JSON.parse(obj[key])


      }
      // if (key==='DN') {
      //   store.state.info.dokujiName['map01'] = obj[key]
      // }
      if (key === 'GJ') {

        // console.log(decodeURIComponent(obj[key]))
        MyMap.undoInteraction.blockStart()
        document.querySelector('#' + 'map01' + ' .ol-viewport').style.cursor = "wait"
        console.log(document.querySelector('#' + 'map01'  + ' .ol-viewport'))
        const features = new GeoJSON({
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        }).readFeatures(JSON.parse(decodeURIComponent(obj[key])))
        MyMap.undoInteraction.blockStart()
        MyMap.drawLayer.getSource().clear()
        MyMap.drawLayer.getSource().addFeatures(features)

        MyMap.drawLayer.getSource().getFeatures().forEach((feature) =>{
          if (feature.getGeometry().getType() === 'GeometryCollection') {
            drawLayer.getSource().removeFeature(feature)
            const distance = feature.getProperties().distance
            const circle = new Circle(feature.get('center'), feature.get('radius'));
            const newFeature = new Feature(circle);
            newFeature.setProperties({
              distance: distance,
              name: feature.getProperties().name,
              setumei: feature.getProperties().setumei,
              _fillColor: feature.getProperties()._fillColor
            })
            drawLayer.getSource().addFeature(newFeature)
            moveEnd()
          }
        })
        document.querySelector('#' + 'map01' + ' .ol-viewport').style.cursor = "default"
        MyMap.undoInteraction.blockEnd()



        // const geojson = JSON.parse(decodeURIComponent(obj[key]))
        //
        // console.log(geojson)
        // if (geojson.features[0]) {
        //   let newFeature
        //   geojson.features.forEach((feature) => {
        //     // console.log(feature.geometry.type)
        //     // const distance = feature.properties.distance
        //     if (feature.geometry.type === 'GeometryCollection') {
        //       const distance = feature.properties.distance
        //       const center = feature.properties.center
        //       const radius = feature.properties.radius
        //       const circle = new Circle(center, radius)
        //       newFeature = new Feature(circle)
        //       newFeature.setProperties({distance: distance})
        //       // MyMap.drawLayer.getSource().addFeature(newFeature)
        //     } else if (feature.geometry.type === 'LineString') {
        //       const distance = feature.properties.distance
        //       let coordinates = []
        //       feature.geometry.coordinates.forEach((coord) => {
        //         coordinates.push(transform(coord, "EPSG:4326", "EPSG:3857"))
        //       })
        //       // const distance = feature.properties.distance
        //       const lineString = new LineString(coordinates)
        //       newFeature = new Feature(lineString)
        //       // newFeature.setProperties({distance: "distance"})
        //       newFeature.setProperties({distance: distance})
        //       // console.log(newFeature)
        //       // if (feature.properties.description) newFeature.setProperties({description: feature.properties.description})
        //       // MyMap.drawLayer.getSource().addFeature(newFeature)
        //     } else if (feature.geometry.type === 'Point') {
        //       // alert()
        //       const coordinates = transform(feature.geometry.coordinates, "EPSG:4326", "EPSG:3857")
        //       //295097250.67020875, 3801416.360944879]
        //       const point = new Point(coordinates)
        //       newFeature = new Feature(point)
        //       // if (feature.properties.description) newFeature.setProperties({description: feature.properties.description})
        //       // MyMap.drawLayer.getSource().addFeature(newFeature)
        //
        //     } else if (feature.geometry.type === 'Polygon') {
        //       const distance = feature.properties.distance
        //       let coordinates = []
        //       feature.geometry.coordinates[0].forEach((coord) => {
        //         coordinates.push(transform(coord, "EPSG:4326", "EPSG:3857"))
        //       })
        //       const polygon = new Polygon([coordinates])
        //       newFeature = new Feature(polygon)
        //       newFeature.setProperties({distance: distance})
        //       // MyMap.drawLayer.getSource().addFeature(newFeature)
        //
        //     } else if (feature.geometry.type === 'MultiPolygon') {
        //       let distance
        //       if (feature.properties) distance = feature.properties.distance
        //       let coordinates = []
        //
        //       feature.geometry.coordinates[0].forEach((coord0) => {
        //         coord0.forEach((coord) => {
        //           coordinates.push(transform(coord, "EPSG:4326", "EPSG:3857"))
        //         })
        //         const polygon = new Polygon([coordinates])
        //         newFeature = new Feature(polygon)
        //         if (distance) newFeature.setProperties({distance: distance})
        //         if (feature.properties) {
        //           Object.keys(feature.properties).forEach(function (key) {
        //             // console.log(key, feature.properties[key])
        //             newFeature.setProperties({[key]: feature.properties[key]})
        //           })
        //         }
        //         MyMap.drawLayer.getSource().addFeature(newFeature)
        //       })
        //
        //
        //     }
        //
        //     if (feature.geometry.type !== 'MultiPolygon') {
        //       // console.log(feature.properties)
        //       if (feature.properties) {
        //         Object.keys(feature.properties).forEach(function (key) {
        //           // console.log(key, feature.properties[key])
        //           newFeature.setProperties({[key]: feature.properties[key]})
        //         })
        //       }
        //       MyMap.drawLayer.getSource().addFeature(newFeature)
        //     }
        //   })
        // }
        store.state.base.maps.map01.addLayer(MyMap.drawLayer)
      }
      if (key === 'GJO'){
        store.state.base.drawOpacity = Number(obj[key])
      }
      if (key === 'GJV'){
        let bool
        if (obj[key] === 'true') {
          bool = true
        } else {
          bool = false
        }
        store.state.base.drawVisible = bool
      }
      if (key === 'GJM'){
        // console.log(obj[key])
        let bool
        if (obj[key] === 'true') {
          bool = true
        } else {
          bool = false
        }
        store.state.base.drawMeasure = bool
      }
      if (key ==='S') {
        store.commit('base/updateSplitFlg',obj[key])
      }
      if (key ==='H') {
        store.state.info.divsDefault = JSON.parse(JSON.stringify(store.state.info.divs))
        store.state.info.divs = JSON.parse(obj[key])
      }
      if (key === 'HG'){
        store.state.info.gradationCheck = JSON.parse(obj[key])
      }
      if (key ==='L') {
        // 初期レイヤーをリセット
        store.commit('base/updateList', {value: [], mapName: 'map01'});
        store.commit('base/updateList', {value: [], mapName: 'map02'});
        // store.commit('base/updateList', {value: [], mapName: 'map03'});
        // store.commit('base/updateList', {value: [], mapName: 'map04'});
        store.state.base.maps.map01.removeLayer(store.state.base.maps.map01.getLayers().getArray()[0]);
        store.state.base.maps.map02.removeLayer(store.state.base.maps.map02.getLayers().getArray()[0]);
        // store.state.base.maps.map03.removeLayer(store.state.base.maps.map03.getLayers().getArray()[0]);
        // store.state.base.maps.map04.removeLayer(store.state.base.maps.map04.getLayers().getArray()[0]);
        const urlLayerListArr = JSON.parse(obj[key]);
        // ②----------------------------
        if (layerList.length > 0) {
          urlLayerListArr[0] = layerList
          urlLayerListArr[1] = layerList2
        }
        // ----------------------------

        let count = 0
        for (let i = 0; i < urlLayerListArr.length; i++) {
          // 逆ループ
          for (let j = urlLayerListArr[i].length - 1; j >= 0; j--) {
            const saiki =function (layers){
              for (let node of layers) {
                if (node.children) {
                  saiki(node.children)
                } else {
                  if (urlLayerListArr[i][j].id === node.data.id) {
                    const mapName = 'map0' + ( i + 1 )

                    // console.log(node.data.id)

                    // ここか？

                    let bookMark = JSON.parse(localStorage.getItem('bookmark'))
                    if (!bookMark) bookMark = []

                    // console.log(node.data.id)
                    let bookMarkFlg
                    if (bookMark.indexOf(node.data.id) !== -1) {
                      bookMarkFlg = true
                    } else {
                      bookMarkFlg = false
                    }
                    store.commit('base/unshiftLayerList', {
                      value: {
                        id: node.data.id,
                        // bookmark: urlLayerListArr[i][j].bk,
                        bookmark: bookMarkFlg,
                        multipli: urlLayerListArr[i][j].m,
                        // multipli: true,
                        check: urlLayerListArr[i][j].ck,
                        title: node.text,
                        layer: node.data.layer,
                        opacity: urlLayerListArr[i][j].o,
                        summary: node.data.summary,
                        component: urlLayerListArr[i][j].c
                      },
                      mapName: mapName
                    });
                    // レイヤーに設定項目があるとき
                    if (node.data.component) {
                      store.commit('base/incrDialogMaxZindex');
                      // レイヤーダイアログを開く時は下記１行を使う。
                      // store.state.base.dialogs[mapName].style.display = 'block';

                      // const top = store.state.base.dialogs[mapName].style.top;
                      // console.log(store.state.base.dialogs[mapName].style)
                      // $('#map01' + ' .dialog-div')の長さがわかればいい。それぞれに必要なし
                      // document.querySelector('#map01' + ' .dialog-div').style.display = 'block';
                      // const left = Number(store.state.base.dialogs[mapName].style.left.replace(/px/,"")) + document.querySelector('#map01' + ' .dialog-div').clientWidth + 96 + 'px';
                      // const left = '355px'
                      const c = urlLayerListArr[i][j].c;
                      let height
                      let maxHeight
                      let left
                      let bottom
                      let top
                      if (window.innerWidth < 600) {
                        bottom = ''
                        top = '60px'
                        left = '10px'
                        if (c) {
                          left = (window.innerWidth / 2 - 125) + 'px'
                          top  = ''
                          bottom = '60px'
                          switch (c.name) {
                            case 'tetsudoJikeiretsu':
                            case 'kosoku':
                            case 'jinko500m':
                            case 'jinko250m':
                            case 'jinko':
                              height = '210px'
                              break
                            case 'syogakkoR05':
                            case 'syogakkoR03':
                            case 'tyugakkoR03':
                            case 'tyugakkoR05':
                              height = '170px'
                              break
                            case 'jinko100m':
                              height = '425px'
                              break
                            case 'flood10m':
                              height = '357px'
                              break
                            case 'kijyunten':
                            case 'ssdsCity':
                            case 'ssdsPref':
                              bottom = ''
                              top = '60px'
                              left = '10px'
                              break
                            default:
                              bottom = ''
                              top = '60px'
                              left = '10px'
                          }
                          console.log(c.name)
                        }
                      } else {
                        const top0 = (60 + (40 * count)) + 'px'
                        const left0 = (10 + (40 * count)) + 'px'
                        top = top0
                        left = left0
                        bottom = ''
                        count++
                      }
                      const infoDialog =
                          {
                            id: node.data.id,
                            multipli: node.data.multipli,
                            check: node.data.check,
                            title: node.text,
                            summary: node.data.summary,
                            component: node.data.component,
                            style: {
                              display: 'block',
                              bottom: bottom,
                              top: top,
                              left: left,
                              height: height,
                              "max-height": maxHeight,
                              'z-index': store.state.base.dialogMaxZindex
                            }
                          };
                      store.commit('base/pushDialogsInfo', {mapName: mapName, dialog: infoDialog});
                      // const c = urlLayerListArr[i][j].c;
                      if (c){
                        for (let k=0; k<c.values.length;k++) {
                          console.log(c.name,c.values[k])
                          store.commit('info/update', {name: c.name, mapName: mapName, value: c.values[k], order: k})
                        }
                      }
                    }
                    // レイヤーに設定項目があるとき。ここまで
                  }
                }
              }
            };

            // console.log(store.state.info.dokujiLayers)

            store.state.info.dokujiLayers.forEach((value,i) =>{
              // store.state.info.dokujiUrl['map01'] = value.url
              // store.state.info.dokujiName['map01'] = value.name
              // console.log(value)
              layers.dokujiLayerTsuika(i)
              // console.log(layers.dokujiObjAr[i].map01)
              layers.dokujiObjAr[i].map01.getSource().setUrl(value.url)
              layers.dokujiObjAr[i].map02.getSource().setUrl(value.url)
              Layers.Layers.push({
                text: value.name,
                data: {
                  id: "dokuji" + i,
                  layer: layers.dokujiObjAr[i],
                  opacity: 1,
                  summary: '',
                }})
            })
            // console.log(Layers.Layers)

            // layers.dokujiLayerTsuika(0)
            // layers.dokujiObjAr[0].map01.getSource().setUrl(store.state.info.dokujiUrl['map01'])
            // layers.dokujiObjAr[0].map02.getSource().setUrl(store.state.info.dokujiUrl['map01'])
            // Layers.Layers.push({
            //   text: store.state.info.dokujiName['map01'],
            //   data: { id: "dokuji00", layer: layers.dokujiObjAr[0],
            //     opacity: 1,
            //     summary: '',
            //   }})

            saiki(Layers.Layers)
          }
        }
      }
    }
  } else {
    let startPositionCoord = localStorage.getItem('startPositionCoord')
    const map = store.state.base.maps.map01
    if (startPositionCoord) {
    startPositionCoord = [Number(startPositionCoord.split(',')[0]),Number(startPositionCoord.split(',')[1])]
    const startPositionZoom = localStorage.getItem('startPositionZoom')
      map.getView().setCenter(startPositionCoord)
      map.getView().setZoom(startPositionZoom)
    } else {
      const center = fromLonLat([140.097, 37.856])
      const zoom = 6
      map.getView().setCenter(center)
      map.getView().setZoom(zoom)
    }
  }
  // マップ移動時イベント------------------------------------------------------------------------
  // store.state.base.maps.map01.on('moveend', moveEnd)
}

export function moveEnd () {
  const features = MyMap.drawLayer.getSource().getFeatures()
  features.forEach(function(feature){
    if (feature.getGeometry()) {
      if (feature.getGeometry().getType() === 'Circle') {
        const radius = feature.getGeometry().getRadius()
        const center = feature.getGeometry().getCenter()
        feature.set('radius', radius)
        feature.set('center', center)
      }
    }
  })
  const drawSourceGeojson = new GeoJSON().writeFeatures(features, {
    featureProjection: "EPSG:3857"
  })
  let geojsonT = JSON.stringify(JSON.parse(drawSourceGeojson),null,1);

  // console.log(geojsonT)

  // geojsonT = encodeURIComponent(geojsonT)

  // ----------------------------------------------------------------------------------
  const map = store.state.base.maps.map01
  const zoom = map.getView().getZoom()
  const center = map.getView().getCenter()
  const center4326 = transform(center,'EPSG:3857','EPSG:4326')
  const hash = '#' +
      zoom + '/' +
      Math.round(center4326[0] * 100000) / 100000 + '/' +
      Math.round(center4326[1] * 100000) / 100000
  let parameter = '?S=' + store.state.base.splitFlg

  parameter += '&DL=' + JSON.stringify(store.state.info.dokujiLayers)


  // const url = JSON.stringify({
  //   url:store.state.info.dokujiUrl['map01'],
  //   name:store.state.info.dokujiName['map01']
  // })
  // parameter += '&DL=' + url

  parameter += '&L=' + store.getters['base/layerLists'];

  // console.log(store.getters['base/layerLists'])
  parameter += '&GJ=' + geojsonT
  parameter += '&GJO=' + store.state.base.drawOpacity
  parameter += '&GJV=' + store.state.base.drawVisible
  parameter += '&GJM=' + store.state.base.drawMeasure
  parameter += '&H=' + JSON.stringify(store.state.info.divs)
  parameter += '&HG=' + JSON.stringify(store.state.info.gradationCheck)



  // const maps = ['map01','map02','map03','map04']
  const maps = ['map01','map02']
  maps.forEach((map) => {
    if (store.state.base.ol3d[map]) {
      const json = {
        'enabled': true,
        'tilt':store.state.base.ol3d[map].getCamera().getTilt(),
        'heading':store.state.base.ol3d[map].getCamera().getHeading(),
        'distance':store.state.base.ol3d[map].getCamera().getDistance(),
        'hight':store.state.base.hight[map]
      }
      const jsonT = JSON.stringify(json,null,1)
      parameter += '&3d' + map + '=' + jsonT
    }
  })
  // console.log(hash)
  // console.log(parameter.replace(/,/g,encodeURIComponent(",")))
  // parameter = parameter.replace(/,/g,encodeURIComponent(","))
  // parameterだけエンコードする。起動時にwindow.location.hashでハッシュ値を取得するため
  // parameter = encodeURIComponent(parameter);
  const state = {
    zoom: zoom,
    center: center4326
  };
  // window.history.pushState(state, 'map', hash + parameter);
  // MyMap.history ('moveend')
  //---------------------------------------------------------------
  // const parameters = decodeURIComponent(window.location.hash)
  const parameters = hash + parameter
  // console.log(parameters)
  if(store.state.base.increment > 4) {

    let params = new URLSearchParams();
    params.append('parameters', parameters);
    axios.post('https://kenzkenz.xsrv.jp/open-hinata/php/insert2.php', params)
        // axios.post('/php/insert2.php', params)
        .then(response => {
          window.history.pushState(state, 'map', "#s" + response.data.urlid);
          console.log('保存しました。')
          MyMap.history('moveend', window.location.href)
        })
        .catch(error => {
          console.log(error);
        });


    // axios
    //     .get('https://kenzkenz.xsrv.jp/open-hinata/php/insert.php', {
    //       params: {
    //         parameters: parameters
    //       }
    //     })
    //     // .post('https://kenzkenz.xsrv.jp/open-hinata/php/insert2.php', params)
    //     .then(function (response) {
    //       console.log(response)
    //       // console.log(response.data.urlid)
    //       // const url = new URL(window.location.href) // URLを取得
    //       // window.history.replaceState(null, '', url.pathname) //パラメータを削除 FB対策
    //       window.history.pushState(state, 'map', "#s" + response.data.urlid);
    //       MyMap.history('moveend', window.location.href)
    //     })
    //     .catch(function (error) {
    //       console.log(error);
    //     })
    //     .finally(function () {
    //     });
  } else {
    store.commit('base/increment')
  }
}