// マップ関係の関数
import store from './store'
import 'ol/ol.css'
import Map from 'ol/Map'
import Overlay from 'ol/Overlay';
import View from 'ol/View'
import { transform, fromLonLat } from 'ol/proj'
import { ScaleLine } from 'ol/control';
import Colorize from 'ol-ext/filter/Colorize'
import Synchronize from 'ol-ext/interaction/Synchronize'
import Lego from 'ol-ext/filter/Lego'
import Notification from 'ol-ext/control/Notification'
import * as Layers from './layers'
import * as LayersMvt from './layers-mvt'
import * as PopUp from './popup'
import {defaults as defaultInteractions, DragRotateAndZoom, Modify, Snap} from 'ol/interaction'
import VectorSource from "ol/source/Vector.js"
import VectorLayer from "ol/layer/Vector"
import axios from "axios"
let maxZndex = 0
let legoFilter = null;
import Draw from 'ol/interaction/Draw'
import ModifyFeature from "ol-ext/interaction/ModifyFeature";
import DrawRegular from 'ol-ext/interaction/DrawRegular'
import Transform from 'ol-ext/interaction/Transform'
import DragAndDrop from 'ol/interaction/DragAndDrop.js'
import PinchRotate from 'ol/interaction/PinchRotate'
import {GPX, GeoJSON, IGC, KML, TopoJSON} from 'ol/format.js'
import {Fill, Stroke, Style, Text, Circle as Circle0 } from "ol/style"
import * as turf from '@turf/turf';
import Select from 'ol/interaction/Select.js'
// import {click, pointerMove, altKeyOnly} from 'ol/events/condition.js';
import {Circle, LineString, Point, Polygon, MultiPolygon, MultiPoint} from "ol/geom"
import Feature from 'ol/Feature'
import {moveEnd} from "./permalink"
import Dialog from 'ol-ext/control/Dialog'
import Icon from 'ol/style/Icon'
import * as d3 from "d3"
import PrintDialog from 'ol-ext/control/PrintDialog.js'
import muni from './muni'
import UndoRedo from 'ol-ext/interaction/UndoRedo'
import {syochiiki2020MvtObj} from "@/js/layers-mvt"
import CopyPaste from 'ol-ext/interaction/CopyPaste'
import Swipe from 'ol-ext/control/Swipe'
import RegularShape from 'ol/style/RegularShape'
import Collection from 'ol/Collection'
import Tooltip from 'ol-ext/overlay/Tooltip'
import {parse} from 'csv-parse/lib/sync'
import {Heatmap} from 'ol/layer'
import DrawHole from 'ol-ext/interaction/DrawHole'
import ModifyTouch from 'ol-ext/interaction/ModifyTouch'
import Split from 'ol-ext/interaction/Split'
import Gauge from 'ol-ext/control/Gauge'
import GeolocationDraw from 'ol-ext/interaction/GeolocationDraw'
import VectorImage from 'ol/layer/VectorImage'
import FlowLine from 'ol-ext/style/FlowLine'
import Profile from 'ol-ext/control/Profile'
import CanvasTitle from 'ol-ext/control/CanvasTitle'

// ドロー関係-------------------------------------------------------------------------------
function  getZoom(resolution)  {
    let zoom = 0;
    let r = 156543.03390625; // resolution for zoom 0
    while (resolution < r) {
        r /= 2;
        zoom++;
        if (resolution > r) {
            return zoom;
        }
    }
    return zoom; // resolution was greater than 156543.03390625 so return 0
}
export  const danmenLayer = new VectorLayer({
    name: 'drawSource',
    source: new VectorSource({wrapX: false}),
    style: danmenStyleFunction()
})
function danmenStyleFunction() {
    return function (feature, resolution) {
        const styles = []
        const iconStyle = new Style({
            image: new Icon({
                src: require('@/assets/icon/whitecircle.png'),
                color: 'red'
            })
        })
        styles.push(iconStyle)
        return styles;
    }
}
const drawSource = new VectorSource({wrapX: false})
export const drawLayer = new VectorLayer({
    name: 'drawLayer',
    source: drawSource,
    style: drawLayerStylefunction(),
    // altitudeMode: 'clampToGround'
})
export const haatMapDrawLayer = new Heatmap({
    name: 'heatmap',
    source: drawSource,
    style: drawLayerStylefunction()
})
export const haatMapDrawLayer2 = new Heatmap({
    name: 'heatmap',
    source: drawSource,
    style: drawLayerStylefunction()
})
export const flowLineDrawLayer = new VectorImage({
    name: 'drawLayer',
    source: drawSource,
    style: styleFn
});
export const selectInteraction = new Select({
    layers: [drawLayer]
})
const profileDrawSource = new VectorSource({wrapX: false})
export const profileDrawLayer = new VectorLayer({
    name: 'profile',
    source: profileDrawSource,
    style: profileStylefunction()
})

function drawLayerStylefunction (){
    return function (feature, resolution) {
        const prop = feature.getProperties()
        const zoom = getZoom(resolution)
        const geoType = feature.getGeometry().getType()
        let text
        let color
        let fillColor
        let lineColor
        let lineWidth = 4
        let polygonStrokeWidth = 1
        let pointStrokeWidth = 1
        let polygonStrokeColor = 'black'
        let pointStrokeColor = 'black'

        if (prop._color) {
            color = prop._color
            lineColor = prop._color
        } else {
            if (geoType === 'Point') {
                color = 'rgba(0,0,255,1)'
            } else {
                color = 'rgba(0,0,255,0.5)'
                lineColor = 'rgba(0,0,255,0.5)'
            }
        }
        // console.log(color)
        if (feature === store.state.base.editFeature) {
            if (geoType === 'Point') {
                pointStrokeWidth = 4
            // } else {
            //     color = 'orange'
            }
        }
        if (prop._fillColor) {
            fillColor = prop._fillColor
        } else {
            fillColor = 'rgba(0,0,255,0.5)'
        }
        if (feature === store.state.base.editFeature) {
            // fillColor = 'rgba(255,165,0,0.5)'
            polygonStrokeWidth = 4
            polygonStrokeColor = 'blue'
            lineWidth = 6
        }
        if (store.state.base.drawMode === 'henkei') {
            polygonStrokeColor = 'rgb(255,255,0)'
            polygonStrokeWidth = 4
            pointStrokeColor = 'rgb(255,255,0)'
            pointStrokeWidth = 4
            lineColor = 'orange'
        }
        if (prop._voronoi) {
            polygonStrokeColor = 'black'
            polygonStrokeWidth = 2
        }
        const styles = []
        const pointStyle = new Style({
            // image: new Icon({
            //     src: require('@/assets/icon/whitecircle.png'),
            //     color: color,
            //     scale: 1.5
            // })
            image: new Circle0({
              radius: 8,
              fill: new Fill({
                color: color
              }),
              stroke: new Stroke({
                color: pointStrokeColor,
                width: pointStrokeWidth
              })
            }),
        })
        const polygonStyle = new Style({
            fill: new Fill({
                color: fillColor
            }),
            stroke: new Stroke({
                color: polygonStrokeColor,
                width: polygonStrokeWidth
            }),
            // zIndex: 0
        })
        const lineStyle = new Style({
            stroke: new Stroke({
                color: lineColor,
                width: lineWidth
            })
        })
        let target
        let perimeter = ''
        if (geoType === 'LineString' || geoType === 'Circle') {
            target = '_distance'
        } else if (geoType === 'Polygon'){
            target = '_area'
        }
        if (prop.name) {
            if (!prop[target] || !store.state.base.drawMeasure) {
                text = prop.name
            } else {
                if (geoType === 'LineString' || geoType === 'Circle') {
                    text = prop.name + '\n' + prop[target]
                } else if (geoType === 'Polygon'){
                    text = prop.name + '\n面積' + prop[target] + '\n周長' +prop._perimeter
                }
            }
        } else {
            if (!prop[target] || !store.state.base.drawMeasure) {
                text = prop.name
            } else {
                if (geoType === 'LineString' || geoType === 'Circle') {
                    text = prop[target]
                } else if (geoType === 'Polygon'){
                    text = '面積' + prop[target]+ '\n周長' +prop._perimeter
                }
            }
        }

        let textAlign = ''
        let offsetX = 0
        let offsetY = 0
        if (prop._align === 'top') {
            textAlign = ''
            offsetX = 0
            offsetY = -20
        } else if (prop._align === 'right') {
            textAlign = 'right'
            offsetX = -20
            offsetY = 0
        } else if (prop._align === 'bottom') {
            textAlign = ''
            offsetX = 0
            offsetY = 20
        } else {
            textAlign = 'left'
            offsetX = 20
            offsetY = 0
        }
        const textStyle = new Style({
            text: new Text({
                font: "16px sans-serif",
                text: text,
                textAlign: textAlign,
                offsetY: offsetY,
                offsetX: offsetX,
                fill:  new Fill({
                    color:"blue"
                }),
                stroke: new Stroke({
                    color: "white",
                    width: 3
                }),
                overflow: true,
            })
        })
        const textStyle2 = new Style({
            text: new Text ({
                text:'\uf047',
                font:"20px Fontawesome",
                fill: new Fill({ color:[255,255,255,0.8] }),
                stroke: new Stroke({ width:2, color:'red' })
            })
        })
        const firstLastPoint = new Style({
            image: new RegularShape({ radius: 4, points:4, fill: new Fill({ color: '#f00' }) }),
            geometry: new MultiPoint(
                [
                    feature.getGeometry().getFirstCoordinate(),
                    feature.getGeometry().getLastCoordinate()]
            )
        })
        const vertexPoint = new Style({
            image: new RegularShape({ radius: 4, points:4, fill: new Fill({ color: '#f00' }) }),
            geometry: function (feature) {
                let coordinates = []
                if (geoType === 'LineString') {
                    coordinates = feature.getGeometry().getCoordinates()
                    return new MultiPoint(coordinates)
                } else if (geoType === 'MultiLineString') {
                    feature.getGeometry().getCoordinates().forEach((coords) => {
                        coords.forEach((coord) => {
                            coordinates.push([coord[0],coord[1]])
                        })
                    })
                    return new MultiPoint(coordinates)
                } else if (geoType === 'Polygon') {
                    coordinates = feature.getGeometry().getCoordinates()[0]
                    return new MultiPoint(coordinates)
                } else if (geoType === 'MultiPolygon') {
                    feature.getGeometry().getCoordinates().forEach((coords) => {
                        coords.forEach((coord) => {
                            coord.forEach((c) => {
                                coordinates.push(c)
                            })
                        })
                    })
                    return new MultiPoint(coordinates)
                }
            },
        })
        styles.push(polygonStyle)
        if (geoType === 'Point') styles.push(pointStyle)
        if (geoType === 'LineString' || geoType === 'MultiLineString') styles.push(lineStyle)
        // if (zoom >= 12) styles.push(textStyle)
        styles.push(textStyle)
        if (geoType === 'LineString') styles.push(firstLastPoint)
        if (store.state.base.toggleVertex) styles.push(vertexPoint)
        // if (geoType === 'Circle') styles.push(textStyle2)
        return styles
    }
}
function profileStylefunction () {
    return function (feature, resolution) {
        const styles = []
        const pointStyle = new Style({
            image: new Circle0({
                radius: 8,
                fill: new Fill({
                    color: 'red'
                }),
                stroke: new Stroke({
                    color: 'black',
                    width: 1
                })
            }),
        })
        styles.push(pointStyle)
        return styles
    }
}

let min = 99999 , max = 0;
function getMinMax (feature) {
    let min0, max0;
    if (feature) {
        feature.getGeometry().getCoordinates()[0].forEach( function(p){
            if(p[2]) {
                max0 = Math.max(max0||-Infinity, p[2])
                min0 = Math.min(min0||Infinity, p[2])
            }
        })
        max0 = Math.round(max0/10+.4)*10
        min0 = Math.round(min0/10-.4)*10
        if (min>min0) min = min0
        if (max<max0) max = max0
    }
    console.log(min,max)
}

// Get the line color at dh
function getColor(dh) {
    if (dh<128) return [2*dh,160-dh,0];
    else return [ 255, (dh-128)*4, (dh-128)*1.5 ];
}
function styleFn(f) {
    // console.log(f.getGeometry().getType())
    if (f.getGeometry().getType() !== 'MultiLineString') return
    if (f.getGeometry().getCoordinates()[0][2]) {
        return new FlowLine({
            visible: false,
            lineCap: 'round',
            color: function(f, step){
                var seg = [];
                let line
                if (f.getGeometry().getType() === 'MultiLineString') {
                    line = f.getGeometry().getLineString(0)
                } else if (f.getGeometry().getType() === 'LineString'){
                    line = f.getGeometry()
                }
                line.getCoordinateAtSeg(step*line.getLength(), seg);
                var h = (seg[0][2]+seg[0][2])/2;
                var dh = 255*(h-min)/(max-min);
                return getColor(dh);
            },
            width: 5,
            geometry: function (f) {
                if (f.getGeometry().getType() === 'MultiLineString') {
                    return f.getGeometry().getLineString(0);
                } else {
                    return f.getGeometry();
                }
            }
        })
    }
}

export const danmenInteraction = new Draw({
    source: drawSource,
    type: 'LineString',
})
export const modifyTouchInteraction = new ModifyTouch({
    source: drawLayer.getSource()
})
export const pointInteraction = new Draw({
    source: drawSource,
    type: 'Point',
})
export const lineInteraction = new Draw({
    source: drawSource,
    type: 'LineString',
})
export const freeHandInteraction = new Draw({
    source: drawSource,
    type: 'LineString',
    freehand: true
})
export const polygonInteraction = new Draw({
    source: drawSource,
    type: 'Polygon',
})
export const circleInteraction = new Draw({
    source: drawSource,
    type: 'Circle',
})
export const modifyInteraction = new Modify ({
    source: drawSource,
})
export const undoInteraction = new UndoRedo()

export const snapnteraction = new Snap ({
    source: drawSource,
})
export const drawHoleInteraction = new DrawHole ({
    layers:  drawSource
})

export function measure (geoType,feature,coordAr) {
    if (geoType === 'Point') {
        feature.setProperties({distance: ''})
    } else if (geoType === 'LineString') {
        let tDistance = 0
        for (var i = 0; i < coordAr.length - 1; i++) {
            const fromCoord = turf.point(turf.toWgs84(coordAr[i]))
            const toCoord = turf.point(turf.toWgs84(coordAr[i + 1]))
            tDistance = tDistance + turf.distance(fromCoord, toCoord, {units: 'kilometers'})
        }
        let tDistance2 = tDistance
        if (tDistance > 10) {
            tDistance = tDistance.toFixed(2) + 'km'
        } else {
            tDistance = (tDistance * 1000).toFixed(2) + 'm'
        }
        feature.setProperties({_distance: tDistance})
        return {'tDistance':tDistance,'tDistance2':tDistance2}
    } else if (feature.getProperties()._buffer) {


    } else if (geoType === 'Polygon') {
        let tPolygon = turf.polygon(coordAr)
        tPolygon = turf.toWgs84(tPolygon)
        let tArea = turf.area(tPolygon)
        if (tArea < 100000) {
            tArea = tArea.toFixed(0) + "m2"
        } else {
            tArea = (tArea / 1000000).toFixed(2) + "km2"
        }
        feature.setProperties({_area: tArea})
        // ------------------------------------------
        const line = turf.polygonToLine(tPolygon)
        let length = turf.length(line)
        if (length > 10) {
            length = length.toFixed(2) + 'km'
        } else {
            length = (length * 1000).toFixed(2) + 'm'
        }
        console.log(length)
        feature.setProperties({_perimeter: length})
    } else if (geoType === 'Circle') {
        const extent = feature.getGeometry().getExtent()
        const fromCoord = turf.point(turf.toWgs84([extent[0],extent[1]]))
        const toCoord = turf.point(turf.toWgs84([extent[2],extent[1]]))
        let distance = turf.distance(fromCoord, toCoord, {units: 'kilometers'}) / 2
        if (distance > 10) {
            distance = '半径' + distance.toFixed(2) + 'km'
        } else {
            distance = '半径' + (distance * 1000).toFixed(2) + 'm'
        }
        feature.setProperties({_distance: distance})
    }
}

function danmen(feature) {
    const coordAr = feature.getGeometry().getCoordinates()
    const geoType = feature.getGeometry().getType()
    console.log(feature)
    console.log(coordAr)
    console.log(geoType)
    if (geoType !==  'LineString') return
    d3.select('#map01 .loadingImg').style("display","block")
    const tDistance = (measure (geoType,feature,coordAr).tDistance)
    const tDistance2 = (measure (geoType,feature,coordAr).tDistance2)
    const splitCount = 300;
    const split = tDistance2/splitCount;
    const coodARsprit = []
    const kyoriArr = []
    for(let i = 0; i < splitCount; i++) {
        const line = turf.toWgs84(turf.lineString(coordAr));
        const kyori = split * i;
        const along = turf.along(line, kyori);
        const coord = along["geometry"]["coordinates"];
        coodARsprit.push(coord)
        kyoriArr.push(kyori)
    }

    async function created() {
        const fetchData = coodARsprit.map((coord) => {
            return axios
                .get('https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php',{
                    params: {
                        dataType: "json",
                        lon: coord[0],
                        lat: coord[1],
                    }
                })
        })
        await Promise.all([
            ...fetchData
        ])
            .then((response) => {
                d3.select('#map01 .loadingImg').style("display","none")

                console.log(response)
                const dataSet = response.map((valu,index) => {
                    let kyori = kyoriArr[index]
                    let tani
                    let erev
                    if (tDistance2 > 10) {
                        tani = 'km'
                    } else {
                        kyori = kyori * 1000
                        tani = 'm'
                    }
                    const coord =coodARsprit[index]
                    erev = valu.data.elevation
                    if (erev === "-----") erev = 0

                    return {'erev':erev,'kyori':kyori,
                        'tDistance': tDistance,'tDistance2': tDistance2, 'tani':tani, 'coord':coord}
                })
                dialogOpen(dataSet)
            })
            .catch(function (response) {
            })
    }
    function dialogOpen(dataSet){
        store.commit('base/incrDialog2Id')
        store.commit('base/incrDialogMaxZindex')
        const diialog =
            {
                id: store.state.base.dialog2Id,
                name:'erev',
                style: {
                    display: 'block',
                    top: '60px',
                    width: '500px',
                    // left: '10px',
                    right:'10px',
                    'z-index':store.state.base.dialogMaxZindex
                }
            }
        store.state.base.erevArr = dataSet
        store.commit('base/pushDialogs2',{mapName: 'map01', dialog: diialog})
    }
    created()
}
danmenInteraction.on('drawend', function (event) {
    const feature = event.feature
    danmen(feature)
    history ('断面図')
})

modifyTouchInteraction.on('modifyend', function (event) {
    const feature = event.features.array_[0]
    const coordAr = event.features.array_[0].getGeometry().getCoordinates()
    const geoType = event.features.array_[0].getGeometry().getType()
    measure (geoType,feature,coordAr)
    moveEnd()
    if (geoType === 'LineString' || geoType === 'MultiLineString') {
        const sliceCoord = sliceCoodAr(coordAr)
        sliceCoord.forEach((coord,i) => {
            setTimeout(function() {
                hyoko(feature, coord, coordAr)
            },1000 * i)
        })
    }
})

drawLayer.getSource().on("change", function(e) {
    const elm = document.querySelector('#dialog-geojson')
    if (elm.style.display === 'block') {
        const tGeojson = new GeoJSON().writeFeatures(drawLayer.getSource().getFeatures(), {
            featureProjection: "EPSG:3857"
        })
        store.state.base.tGeojson = JSON.stringify(JSON.parse(tGeojson),null,2)
    }
    // const tGeojson = new GeoJSON().writeFeatures(drawLayer.getSource().getFeatures(), {
    //     featureProjection: "EPSG:3857"
    // })
    // store.state.base.tGeojson = JSON.stringify(JSON.parse(tGeojson),null,2)

    // const tKml = new KML().writeFeatures(drawLayer.getSource().getFeatures(), {
    //     featureProjection: "EPSG:3857"
    // })
    // store.state.base.tKml = tKml
    // console.log(tKml)
    history ('ドロー')
})
pointInteraction.on('drawend', function (event) {
    event.feature.setProperties({name:''})
    moveEnd()
})
lineInteraction.on('drawend', function (event) {
    const feature = event.feature;
    const coordAr = feature.getGeometry().getCoordinates()
    const geoType = feature.getGeometry().getType()
    measure (geoType,feature,coordAr)
    moveEnd()
    // ---------------------------------------------------------------------------
    const sliceCoord = sliceCoodAr(coordAr)
    sliceCoord.forEach((coord,i) => {
        setTimeout(function() {
            hyoko(feature, coord, coordAr)
        },1000 * i)
    })
})
export function sliceCoodAr(array){
    let slicedArr = []
    const len = Math.ceil(array.length/100)
    if (len > 0) {
        for (let i = 0; i < len; i++) {
            slicedArr.push(array.slice(100*i,100*(i+1)))
        }
    }
    return slicedArr
}
export async function hyoko(feature,coordAr,coordAr0) {
    d3.select('#map01 .loadingImg').style("display","block")
    let coordAr84
    if (coordAr.length > 1) {
        coordAr84 = turf.toWgs84(turf.lineString(coordAr)).geometry.coordinates
    } else {
        coordAr84 = turf.toWgs84(turf.point(coordAr[0],coordAr[1])).geometry.coordinates
        coordAr84 = [coordAr84]
    }
    const fetchData = coordAr84.map((coord) => {
        return axios
            .get('https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php',{
                params: {
                    dataType: "json",
                    lon: coord[0],
                    lat: coord[1],
                }
            })
    })
    await Promise.all([
        ...fetchData
    ])
        .then((response) => {
            d3.select('#map01 .loadingImg').style("display","none")
            coordAr.forEach((coord,index) => {
                coord[2] = response[index].data.elevation
            })
            feature.getGeometry().setCoordinates(coordAr0)
        })
        .catch(function (response) {
            console.log(response)
            hyoko(feature,coordAr)
        })
}
freeHandInteraction.on('drawend', function (event) {
    const feature = event.feature;
    const coordAr = feature.getGeometry().getCoordinates()
    const geoType = feature.getGeometry().getType()
    measure (geoType,feature,coordAr)
    const sliceCoord = sliceCoodAr(coordAr)
    sliceCoord.forEach((coord,i) => {
        setTimeout(function() {
        hyoko(feature, coord, coordAr)
        },1000*i)
    })
})
polygonInteraction.on('drawend', function (event) {
    const feature = event.feature;
    const coordAr = feature.getGeometry().getCoordinates()
    const geoType = feature.getGeometry().getType()
    measure (geoType,feature,coordAr)

})
circleInteraction.on('drawend', function (event) {
    const feature = event.feature;
    const coordAr = feature.getGeometry().getCoordinates()
    const geoType = feature.getGeometry().getType()
    measure (geoType,feature,coordAr)
})
export const transformInteraction = new Transform ({
    translateFeature: false,
    enableRotatedTransform: true,
    scale:true,
    rotate:true,
    keepRectangle: true,
    stretch:true,
})
transformInteraction.on('scaling', function (event) {
    const feature = event.feature;
    const coordAr = feature.getGeometry().getCoordinates()
    const geoType = feature.getGeometry().getType()
    measure (geoType,feature,coordAr)
})
export const regularInteraction = new DrawRegular ({
    source: drawSource,
    // condition: ol.events.condition.altKeyOnly,
    sides: 4 ,
    canRotate: true
})
regularInteraction.on('drawend', function (event) {
    const feature = event.feature;
    const coordAr = feature.getGeometry().getCoordinates()
    const geoType = feature.getGeometry().getType()
    measure (geoType,feature,coordAr)
})
export const daenInteraction = new DrawRegular ({
    source: drawSource,
    sides: 30 ,
    canRotate: true
})
daenInteraction.on('drawend', function (event) {
    const feature = event.feature;
    const coordAr = feature.getGeometry().getCoordinates()
    const geoType = feature.getGeometry().getType()
    measure (geoType,feature,coordAr)
})
drawHoleInteraction.on('drawend', function (event) {
    drawLayer.getSource().getFeatures().forEach((feature) => {
        const coordAr = feature.getGeometry().getCoordinates()
        const geoType = feature.getGeometry().getType()
        measure (geoType,feature,coordAr)
    })
    moveEnd()
})
undoInteraction.on('undo', function(e) {
    const features = drawLayer.getSource().getFeatures()
    features.forEach((feature) =>{
        const coordAr = feature.getGeometry().getCoordinates()
        const geoType = feature.getGeometry().getType()
        measure (geoType,feature,coordAr)
    })
    // store.state.base.editFeature = null
})
export let drawProp
undoInteraction.define(
    'drawProp',
    function (s) {
        drawProp = s.before
        Object.keys(s.before.beforeFeature.values_).forEach(function(key) {
            if (key !== 'geometry') {
                s.before.feature.values_[key] = s.before.beforeFeature.values_[key]
            }
        })
        store.state.base.editFeatureName = s.before.beforeFeature.values_.name
        store.state.base.editFeatureSetumei = s.before.beforeFeature.values_.description
        document.querySelector('#drawLayer2-name').innerHTML = s.before.beforeFeature.values_.name
        document.querySelector('#drawLayer2-setumei').innerHTML = s.before.beforeFeature.values_.description
        drawLayer.getSource().changed()
    },
    function(s) {
        drawProp = s.after
        Object.keys(s.after.afterFeature.values_).forEach(function(key) {
            if (key !== 'geometry') {
                s.after.feature.values_[key] = s.after.afterFeature.values_[key]
            }
        })
        store.state.base.editFeatureName = s.after.afterFeature.values_.name
        store.state.base.editFeatureSetumei = s.after.afterFeature.values_.description
        document.querySelector('#drawLayer2-name').innerHTML = s.after.afterFeature.values_.name
        document.querySelector('#drawLayer2-setumei').innerHTML = s.after.afterFeature.values_.description
        drawLayer.getSource().changed()
    }
)

export const splitInteraction = new Split ({
    sources: drawSource
})

splitInteraction.on('aftersplit', function(e) {
    const features = drawLayer.getSource().getFeatures()
    features.forEach((feature) =>{
        const coordAr = feature.getGeometry().getCoordinates()
        const geoType = feature.getGeometry().getType()
        measure (geoType,feature,coordAr)
    })
    moveEnd()
})

export const myCollection = new Collection()

export const copyInteraction = new CopyPaste({
    destination: drawLayer.getSource(),
    // features: transformInteraction.getFeatures()
    features: myCollection
});

copyInteraction.on('cut', function(e) {
    // transformInteraction.select();
});
copyInteraction.on('paste', function (e) {
    // console.log(transformInteraction.getFeatures())
    // // alert(1)
    // transformInteraction.select()
    // e.features.forEach (function(f) {
    //     console.log(f)
    //     transformInteraction.select(f, true);
    // });
});
export const scaleLine = new ScaleLine()
export const scaleLine2 = new ScaleLine()
export const swipeControl = new Swipe()
export const swipeControl2 = new Swipe()

export let synchronizeInteraction = null
export let synchronizeInteraction2 = null


export const gaugeControl = new Gauge({ title:'正確さ:', max:200 });
export const geolocationDrawInteraction = new GeolocationDraw({
    source: drawLayer.getSource(),
    zoom: 17,
    minAccuracy:10000
})

export const canvasTitleControl = new CanvasTitle({
    title: '利用は出典元の規約に従ってください。',
    visible: true,
    style: new Style({ text: new Text({ font: '20px "Lucida Grande",Verdana,Geneva,Lucida,Arial,Helvetica,sans-serif'}) })
})

export let dragAndDropInteraction

// ダイアログ
export const dialog = new Dialog({ fullscreen: true, zoom: true, closeBox: true });

export const dialogMap = new Dialog({ hideOnClick: false, className: 'center' });
// dialogMap.on('button', function(e) {
//     alert(e.button)
// });


window.addEventListener('beforeunload', (e) => {
    if (store.state.base.noSleepFlg === true) {
        const message = ''
        e.preventDefault()
        e.returnValue = message
        return message
    }
})
//
// window.addEventListener("pagehide", function(e) {
//     alert("test");
// }, false);
//
// window.addEventListener('visibilitychange', () => {
//     alert("test2")
// });
// window.addEventListener('unload', () => {
//     alert("test3")
// });


//-------------------------------------------------------------------------------------------
export const overlay = []
export function initMap (vm) {
    // -------------------------------------------------------------
    // #profile-divが存在している必要があるため、ここに書いている。
    let point
    let width = 340
    let height = 200
    store.state.base.dialogs.dialogProfile.style.height = '280px'
    if (window.innerWidth > 1000) {
        width = 600
        height = 300
        store.state.base.dialogs.dialogProfile.style.width = '650px'
        store.state.base.dialogs.dialogProfile.style.height = '380px'
    }
    const profileControl = new Profile({
        target: document.querySelector("#profile-div"),
        selectable: true,
        // zoomable: true,
        style: new Style({
            fill: new Fill({ color: '#ccc' })
        }),
        width: width,
        height: height
    })
    function drawPoint(e) {
        if (!point) return;
        if (e.type=="over"){
            point.setGeometry(new Point(e.coord));
            point.setStyle(null);
        } else {
            point.setStyle([]);
        }
    }
    profileControl.on(["over","out"], function(e) {
        if (e.type=="over") profileControl.popup(e.coord[2]+" m");
        drawPoint(e);
    })
    // -------------------------------------------------------------

    const map01 = document.getElementById('map01');
    map01.addEventListener('mouseleave', () => {
        moveEnd()
    })

    // マップ作製ループ用の配列を作成
    const maps = [
        {mapName: 'map01', map:store.state.base.map01},
        {mapName: 'map02', map:store.state.base.map02},
    ];
    // 現在使っていない。
    const view01 = new View({
        center: fromLonLat([140.097, 37.856]),
        zoom: 6,
    });
    for (let i in maps) {
        //ポップアップを作る。
        const container = document.getElementById(maps[i].mapName + '-popup');
        const content = document.getElementById(maps[i].mapName  + '-popup-content');
        const closer = document.getElementById(maps[i].mapName  + '-popup-closer');
        // const overlay = []
        overlay[i] = new Overlay({
            element: container,
            autoPan: {
                animation: {
                    duration: 250,
                },
            },
        })
        closer.onclick = () => {
            overlay[i].setPosition(undefined);
            closer.blur();
            document.querySelector('.center-target').style.zIndex = 1
            return false;
        }
        const markerElement = document.getElementById(maps[i].mapName + '-marker');
        const marker = []
        marker[i] = new Overlay({
            element: markerElement
        })
        markerElement.onclick = () => {
            marker[i].setPosition(undefined);
            return false;
        }
        const currentPositionElement = document.getElementById(maps[i].mapName + '-current-position');
        const currentPosition = []
        currentPosition[i] = new Overlay({
            element: currentPositionElement
        })

        // マップ作製
        const mapName = maps[i].mapName
        const map = new Map({
            interactions: defaultInteractions().extend([
                new DragRotateAndZoom()
            ]),
            // layers: [drawLayer],
            overlays: [overlay[i],marker[i],currentPosition[i]],
            target: mapName,
            // view: view01,
        });
        // マップをストアに登録
        store.commit('base/setMap', {mapName: maps[i].mapName, map});
        //デフォルトで設定されているインタラクション（PinchRotate）を使用不可に
        const interactions = map.getInteractions().getArray();
        const pinchRotateInteraction = interactions.filter(function(interaction) {
            return interaction instanceof PinchRotate;
        })[0];
        pinchRotateInteraction.setActive(false);
        function dist2d(p1, p2) {
            var dx = p1[0] - p2[0]
            var dy = p1[1] - p2[1]
            return Math.sqrt(dx * dx + dy * dy)
        }
        if (i==='0')  {
            // map.addControl(profileControl2)
            map.addControl(profileControl)

            LineString.prototype.getCoordinateAtSeg = function (r, seg) {
                var c, d;
                if (r < 1e-10) {
                    if (seg)  {
                        c = this.getCoordinates();
                        seg[0] = c[0];
                        seg[1] = c[1];
                    }
                    return this.getFirstCoordinate();
                }
                if (this.getLength()-r < 1e-10) {
                    if (seg) {
                        c = this.getCoordinates();
                        seg[0] = c[c.length-2];
                        seg[1] = c[c.length-1];
                    }
                    return this.getLastCoordinate();
                }
                if (!seg) seg=[];
                var s = 0;
                var coord = this.getCoordinates();
                for (var i=1; i<coord.length; i++) {
                    d = dist2d(coord[i-1], coord[i]);
                    if (s+d >= r) {
                        var p0 = seg[0] = coord[i-1];
                        var p1 = seg[1] = coord[i];
                        d = dist2d(p0,p1)
                        return [
                            p0[0] + (r-s) * (p1[0]-p0[0]) /d,
                            p0[1] + (r-s) * (p1[1]-p0[1]) /d
                        ];
                    }
                    s += d;
                }
            };

            map.addInteraction(undoInteraction)
            map.addInteraction(modifyInteraction)
            map.addInteraction(modifyTouchInteraction)
            map.addInteraction(transformInteraction)
            map.addInteraction(copyInteraction)
            map.addInteraction(splitInteraction)
            // map.addControl(gaugeControl)
            map.addInteraction(geolocationDrawInteraction)

            geolocationDrawInteraction.on("tracking", function(e) {
                // $("#accuracy").width((e.geolocation.getAccuracy()));
                // gaugeControl.val(e.geolocation.getAccuracy());
                // $("#heading").val(e.geolocation.getHeading());
                // $("#z").val(e.geolocation.getAltitude());
            })


            // const circle = new RegularShape({
            //     fill: new Fill({color:[255,255,255,0.01]}),
            //     stroke: new Stroke({width:1, color:[0,0,0,0.01]}),
            //     radius: 8,
            //     points: 10
            // });
            // transformInteraction.setStyle ('rotate',
            //     new Style({
            //         text: new Text ({
            //             text:'\uf0e2',
            //             font:"16px Fontawesome",
            //             textAlign: "left",
            //             fill:new Fill({color:'red'})
            //         }),
            //         image: circle
            //     }));
            // Center of rotation
            transformInteraction.setStyle ('rotate0',
                new Style({
                    text: new Text ({
                        text:'\uf0e2',
                        font:"20px Fontawesome",
                        fill: new Fill({ color:[255,255,255,0.8] }),
                        stroke: new Stroke({ width:2, color:'red' })
                    }),
                }));
            transformInteraction.setStyle('translate',
                new Style({
                    text: new Text ({
                        text:'\uf047',
                        font:"20px Fontawesome",
                        fill: new Fill({ color:[255,255,255,0.8] }),
                        stroke: new Stroke({ width:2, color:'red' })
                    })
                }));

            modifyInteraction.setActive(false)
            modifyTouchInteraction.setActive(false)
            transformInteraction.setActive(false)

            splitInteraction.setActive(false)

            const tooltipOverlay = new Tooltip()
            map.addOverlay(tooltipOverlay)
            lineInteraction.on('drawstart', tooltipOverlay.setFeature.bind(tooltipOverlay))
            lineInteraction.on(['change:active','drawend'], tooltipOverlay.removeFeature.bind(tooltipOverlay))
            polygonInteraction.on('drawstart', tooltipOverlay.setFeature.bind(tooltipOverlay))
            polygonInteraction.on(['change:active','drawend'], tooltipOverlay.removeFeature.bind(tooltipOverlay))
            freeHandInteraction.on('drawstart', tooltipOverlay.setFeature.bind(tooltipOverlay))
            freeHandInteraction.on(['change:active','drawend'], tooltipOverlay.removeFeature.bind(tooltipOverlay))
            regularInteraction.on('drawstart', tooltipOverlay.setFeature.bind(tooltipOverlay))
            regularInteraction.on(['change:active','drawend'], tooltipOverlay.removeFeature.bind(tooltipOverlay))
            daenInteraction.on('drawstart', tooltipOverlay.setFeature.bind(tooltipOverlay))
            daenInteraction.on(['change:active','drawend'], tooltipOverlay.removeFeature.bind(tooltipOverlay))

            const point = function () {
                store.state.base.togglePoint0 = true
            }
            const polygon = function () {
                store.state.base.toggleMenseki = true
            }
            const lineString = function () {
                store.state.base.toggleLine = true
            }
            const circle = function () {
                store.state.base.toggleCircle = true
            }
            const deleteFeature = function () {
                store.state.base.toggleText = true
                if (!store.state.base.editFeature) {
                    alert('選択されていません。')
                    store.state.base.toggleText = true
                }
                drawLayer.getSource().removeFeature(store.state.base.editFeature)
                const tFeatures = transformInteraction.getFeatures().array_
                tFeatures.forEach((feature) => {
                    drawLayer.getSource().removeFeature(feature)
                })
                overlay['0'].setPosition(undefined)
                moveEnd()
            }
            const undo = function () {
                undoInteraction.undo()
            }
            const sentakuMode = function () {
                store.state.base.drawMode = 'sentaku'
            }
            const henkeiMode = function () {
                store.state.base.drawMode = 'henkei'
            }
            const idoMode = function () {
                store.state.base.drawMode = 'ido'
            }
            const contextmenu = new ContextMenu({
                width: 170,
                defaultItems: false, // defaultItems are (for now) Zoom In/Zoom Out
                items: [
                    {
                        text: '点',
                        classname: 'some-style-class', // add some CSS rules
                        callback: point
                    },
                    {
                        text: 'ポリゴン',
                        classname: 'some-style-class', // you can add this icon with a CSS class
                        // instead of `icon` property (see next line)
                        // icon: 'img/marker.png', // this can be relative or absolute
                        callback: polygon
                    },
                    // '-', // this is a separator
                    {
                        text: '線',
                        callback: lineString
                    },
                    {
                        text: '円',
                        callback: circle
                    },
                    {
                        text: '削除',
                        callback: deleteFeature
                    },
                    {
                        text: '戻す',
                        callback: undo
                    },
                    {
                        text: 'モード変更',
                        items: [
                            {
                                text: '選択モード',
                                callback: sentakuMode,
                            },
                            {
                                text: '変形モード',
                                callback: henkeiMode,
                            },
                            {
                                text: '移動・拡大モード',
                                callback: idoMode,
                            },
                        ],
                    },
                ],
            });
            map.addControl(contextmenu)
            contextmenu.on('open', function (evt) {
                const feature = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature) {
                        return feature
                    })
                const layerNames = map.forEachFeatureAtPixel(evt.pixel,
                    function (feature,layer) {
                        if (layer) return  layer.get('name')
                    })
                if (layerNames) {
                    if (layerNames.indexOf('drawLayer') !== -1 ) {
                        // store.state.base.toggleIdo = false
                        if (store.state.base.toggleText) {
                            // store.state.base.toggleIdo = true
                            store.commit('base/incrDialogMaxZindex')
                            store.state.base.dialogs.measureDialog.style["z-index"] = this.s_dialogMaxZindex
                            store.state.base.dialogs.measureDialog.style.display = 'block'
                            if (!store.state.base.toggleIdo) {
                                store.state.base.editFeature = feature
                            } else {
                                store.state.base.editFeature = transformInteraction.getFeatures().array_[0]
                            }
                            drawLayer.getSource().changed()
                        } else {
                            // store.state.base.editFeature = null
                            // drawLayer.getSource().changed()
                        }
                    } else if (layerNames.indexOf('syochiki2020') !== -1) {
                        store.state.base.clickedFeature = feature.getProperties().KEY_CODE
                        syochiiki2020MvtObj['map01'].getSource().changed()
                        syochiiki2020MvtObj['map02'].getSource().changed()
                    } else {
                        store.state.base.editFeature = ''
                        drawLayer.getSource().changed()
                        store.state.base.clickedFeature = ''
                        syochiiki2020MvtObj['map01'].getSource().changed()
                        syochiiki2020MvtObj['map02'].getSource().changed()
                    }
                } else {
                    store.state.base.editFeature = ''
                    drawLayer.getSource().changed()
                    store.state.base.clickedFeature = ''
                    syochiiki2020MvtObj['map01'].getSource().changed()
                    syochiiki2020MvtObj['map02'].getSource().changed()
                }
            })
        }

        // ------------------------
        const drawEndFunction =  function (feature,interaction) {
            if (interaction !== 'point') store.state.base.drawMode = 'henkei'
            overlay[i].setPosition(undefined)
            const geoType = feature.getGeometry().getType()
            if (geoType === 'Polygon' || geoType === 'Circle') {
                if (store.state.base.editFeatureFillColor['map01']) {
                    const c = store.state.base.editFeatureFillColor['map01'].rgba
                    const rgba = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'
                    feature.setProperties({_fillColor: rgba})
                }
            } else {
                if (store.state.base.editFeatureColor['map01']) {
                    const c = store.state.base.editFeatureColor['map01'].rgba
                    const rgba = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')'
                    feature.setProperties({_color: rgba})
                }
            }
            moveEnd()
        }

        pointInteraction.on('drawend', function (event) {
            const feature = event.feature
            drawEndFunction(feature,'point')
            // store.state.base.toggleIdo = false
            store.state.base.drawEndFlg = true
            store.state.base.editFeature = feature
            store.state.base.togglePoint0 = false
        })
        lineInteraction.on('drawend', function (event) {
            const feature = event.feature
            store.state.base.editFeature = feature
            store.state.base.toggleLine = false
            drawEndFunction(feature)
        })
        freeHandInteraction.on('drawend', function (event) {
            const feature = event.feature
            store.state.base.editFeature = feature
            store.state.base.toggleFreeHand = false
            drawEndFunction(feature)
        })
        polygonInteraction.on('drawend', function (event) {
            const feature = event.feature
            store.state.base.editFeature = feature
            store.state.base.toggleMenseki = false
            drawEndFunction(feature)
        })
        regularInteraction.on('drawend', function (event) {
            const feature = event.feature
            store.state.base.editFeature = feature
            store.state.base.toggleShikaku = false
            drawEndFunction(feature)
        })
        circleInteraction.on('drawend', function (event) {
            const feature = event.feature
            store.state.base.editFeature = feature
            store.state.base.toggleCircle = false
            drawEndFunction(feature)
        })
        daenInteraction.on('drawend', function (event) {
            const feature = event.feature
            store.state.base.editFeature = feature
            store.state.base.toggleDaen = false
            drawEndFunction(feature)
        })
        drawHoleInteraction.on('drawend', function (event) {
            const feature = event.feature
            store.state.base.editFeature = feature
            store.state.base.toggleHole = false
            drawEndFunction(feature)
        })
        //-----------------------




        // コントロール追加---------------------------------------------------------------------------

        // Dialog.menuに移動！
        // map.addControl(canvasTitleControl)

        // Print control
        var printControl = new PrintDialog({
            // target: document.querySelector('.info'),
            // targetDialog: map.getTargetElement()
            // save: false,
            // copy: false,
            // pdf: false
        });
        printControl.setSize('A4');
        printControl.setOrientation('landscape')
        map.addControl(printControl);
        /* On print > save image file */
        printControl.on(['print', 'error'], function(e) {
            // Print success
            if (e.image) {
                if (e.pdf) {
                    // Export pdf using the print info
                    var pdf = new jsPDF({
                        orientation: e.print.orientation,
                        unit: e.print.unit,
                        format: e.print.size
                    });
                    pdf.addImage(e.image, 'JPEG', e.print.position[0], e.print.position[0], e.print.imageWidth, e.print.imageHeight);
                    pdf.save(e.print.legend ? 'legend.pdf' : 'map.pdf');
                } else  {
                    // Save image as file
                    e.canvas.toBlob(function(blob) {
                        var name = (e.print.legend ? 'legend.' : 'map.')+e.imageType.replace('image/','');
                        saveAs(blob, name);
                    }, e.imageType, e.quality);
                }
            } else {
                console.warn('No canvas to export');
            }
        });
        document.querySelectorAll('.ol-closebox .ol-closebox').forEach((element) => {
            element.addEventListener('click', function(event) {
                map.removeControl(canvasTitleControl)
            })
        })
        // ---------------------------------------------------------------------------------------------
        // const scaleLine = new ScaleLine()
        // console.log(localStorage.getItem('scaleFlg'))
        if (localStorage.getItem('scaleFlg') === 'true') {
            if (i==='0') map.addControl(scaleLine)
            if (i==='1') map.addControl(scaleLine2)
        }
        // ---------------------------------------------------------------------------------------------
        const notification = new Notification();
        map.addControl(notification);
        store.commit('base/setNotifications',{mapName:mapName, control: notification});


        // ----------------------------------------------------------------------------------------------
        // map.getViewport().addEventListener('drop', function(event) {
        //     event.preventDefault();
        //     const files = event.dataTransfer.files;
        //     for (let i = 0, ii = files.length; i < ii; ++i) {
        //         const file = files.item(i);
        //         loadshp({url: file, encoding: 'utf-8'}, function(geojson) {
        //             const features = new GeoJSON().readFeatures(
        //                 geojson,
        //                 { featureProjection: map.getView().getProjection() }
        //             );
        //             console.log(features)
        //             drawLayer.getSource().addFeatures(features)
        //         });
        //     }
        // });


        map.getViewport().addEventListener('drop', function(event) {
            console.log(event.dataTransfer.files)

            //既定の動作を行わない。
            event.preventDefault();
            //ドロップされたファイル
            const [file] = event.dataTransfer.files
            //FileReaderでテキスト読み込み。
            const reader = new FileReader();
            reader.onload = () => {
                //読み込み完了でファイル名と中身を表示。
                if (file.name.slice(-3) !== 'csv') return
                const records = parse(reader.result, { columns: true})
                let newFeature
                records.forEach((row) => {
                    if (row.geoType === 'Point') {
                        const coordinates = transform([row.経度, row.緯度], "EPSG:4326", "EPSG:3857")
                        const point = new Point(coordinates)
                        newFeature = new Feature(point)
                    } else if (row.geoType === 'LineString') {
                        let coordinates = []
                        JSON.parse(row.coords).forEach((coord) => {
                            coordinates.push(transform(coord, "EPSG:4326", "EPSG:3857"))
                        })
                        const lineString = new LineString(coordinates)
                        newFeature = new Feature(lineString)
                    } else if (row.geoType === 'Polygon') {
                        let coordinates = []
                        JSON.parse(row.coords).forEach((coords,i) => {
                            coordinates.push([])
                            coords.forEach((coord) => {
                                coordinates[i].push(transform(coord, "EPSG:4326", "EPSG:3857"))
                            })
                        })
                        const polygon = new Polygon(coordinates)
                        newFeature = new Feature(polygon)
                    } else if (row.geoType === 'MultiPolygon') {
                        let coordinates = []
                        JSON.parse(row.coords).forEach((coords,i) => {
                            coordinates.push([])
                            coords.forEach((coord,ii) => {
                                coordinates[i].push([])
                                coord.forEach((c) => {
                                    coordinates[i][ii].push(transform(c, "EPSG:4326", "EPSG:3857"))
                                })

                            })
                        })
                        const multiPolygon = new MultiPolygon(coordinates)
                        newFeature = new Feature(multiPolygon)
                    } else if (row.geoType === 'GeometryCollection') {
                        console.log(row.center, row.radius)
                        const circle = new Circle(JSON.parse(row.center), Number(row.radius))
                        newFeature = new Feature(circle)

                    }
                    newFeature.setProperties({
                            'name': row.名称,
                            'description': row.説明,
                            '_color': row.色,
                            '_fillColor': row.塗りつぶし色,
                            '_distance': row.距離,
                            '_area': row.面積,
                        }
                    )
                    drawLayer.getSource().addFeature(newFeature)
                })
                map.getView().fit(drawLayer.getSource().getExtent(),{padding: [100, 100, 100, 100]})
            };
            reader.readAsText(file);
        })

        if (i==1) {
            synchronizeInteraction = new Synchronize({ maps: [store.state.base.maps.map02]})
            synchronizeInteraction2 = new Synchronize({ maps: [store.state.base.maps.map01]})
            store.state.base.maps.map01.addInteraction(synchronizeInteraction);
            store.state.base.maps.map02.addInteraction(synchronizeInteraction2);
        }

        // let dragAndDropInteraction;
        // function setInteraction() {
        //     // const map = store.state.base.maps.map01;
        //     if (dragAndDropInteraction) {
        //         map.removeInteraction(dragAndDropInteraction);
        //     }
        //     dragAndDropInteraction = new DragAndDrop({
        //         formatConstructors: [
        //             GPX,
        //             GeoJSON,
        //             IGC,
        //             // use constructed format to set options
        //             new KML({extractStyles: false}),
        //             TopoJSON,
        //         ],
        //     })
        //     dragAndDropInteraction.on('addfeatures', function (event) {
        //         document.querySelector('#map01 .loadingImg').style.display = 'block'
        //         undoInteraction.blockStart()
        //         // event.features.forEach((feature) => {
        //         //     drawLayer.getSource().addFeature(feature)
        //         // })
        //
        //
        //
        //
        //
        //
        //
        //         drawLayer.getSource().addFeatures(event.features)
        //         drawLayer.getSource().getFeatures().forEach((feature) =>{
        //             if (feature.getGeometry()) {
        //                 if (feature.getGeometry().getType() === 'GeometryCollection') {
        //                     drawLayer.getSource().removeFeature(feature)
        //                     const circle = new Circle(feature.get('center'), feature.get('radius'));
        //                     const newFeature = new Feature(circle);
        //                     newFeature.setProperties({
        //                         name: feature.getProperties().name,
        //                         description: feature.getProperties().description,
        //                         _fillColor: feature.getProperties()._fillColor,
        //                         _distance: feature.getProperties()._distance,
        //                         _area: feature.getProperties()._area
        //                     })
        //                     drawLayer.getSource().addFeature(newFeature)
        //                     const coordAr = feature.getGeometry().getCoordinates()
        //                     const geoType = feature.getGeometry().getType()
        //                     measure (geoType,feature,coordAr)
        //                     //------------------------------------------------------
        //                     if (geoType === 'LineString' || geoType === 'MultiLineString') {
        //                         const sliceCoord = sliceCoodAr(coordAr)
        //                         sliceCoord.forEach((coord,i) => {
        //                             setTimeout(function() {
        //                                 hyoko(feature, coord, coordAr)
        //                             },1000 * i)
        //                         })
        //                     }
        //                 }
        //             }
        //             moveEnd()
        //             // -----------------------------------------------------
        //         })
        //         map.getView().fit(drawLayer.getSource().getExtent(),{padding: [100, 100, 100, 100]})
        //
        //         undoInteraction.blockEnd()
        //         document.querySelector('#map01 .loadingImg').style.display = 'none'
        //     })
        //     map.addInteraction(dragAndDropInteraction)
        // }
        // setInteraction()

        //現在地取得
        // const success = (pos) =>{
        //     const lon = pos.coords.longitude;
        //     const lat = pos.coords.latitude;
        //     // map.getView().setCenter(transform([lon,lat],"EPSG:4326","EPSG:3857"));
        //     const center = transform([lon,lat],"EPSG:4326","EPSG:3857")
        //     map.getView().animate({
        //         center: center,
        //         duration: 500
        //     });
        // }
        // const  fail = (error) =>{alert('位置情報の取得に失敗しました。エラーコード：' + error.code)}
        // let interval
        // const stop = () => {clearInterval(interval)}
        // const  currentPosition = new Toggle(
        //     {	html: '<i class="fa-solid fa-location-crosshairs"></i>',
        //         // {	html: '現',
        //         className: "current-position",
        //         active:true,
        //         onToggle: function(active)
        //         {
        //             if(!active) {
        //                 notification.show("現在地を取得します。<br>戻すときはもう一回クリック",5000)
        //                 interval = setInterval(function(){
        //                     navigator.geolocation.getCurrentPosition(success, fail);
        //                 },2000);
        //             } else {
        //                 stop()
        //             }
        //         }
        //     }
        // );
        // if (mapName === 'map01') map.addControl(currentPosition);
        // コントロール追加ここまで----------------------------------------------------------------------

        // イベント追加---------------------------------------------------------------
        // drawLayerのポイントのインタラクションの制御
        map.on("pointermove",function(evt){
            const pixel = (evt.map).getPixelFromCoordinate(evt.coordinate)
            const features = []
            const layers = []
            evt.map.forEachFeatureAtPixel(pixel,function(feature,layer){
                features.push(feature)
                layers.push(layer)
            })
            if (store.state.base.drawMode === 'henkei') {
                if (features.length > 0) {
                    try {
                        if (features[0].getGeometry().getType() === 'Point' && layers[0].get('name') === 'drawLayer') {
                            if (modifyTouchInteraction.getActive()) {
                                modifyTouchInteraction.setActive(false)
                                modifyInteraction.setActive(false)
                            }
                        } else {
                            if (!modifyTouchInteraction.getActive()) {
                                modifyTouchInteraction.setActive(true)
                                modifyInteraction.setActive(true)
                            }
                        }
                    } catch (e) {
                    }
                }
            }
            if (store.state.base.drawMode === 'ido') {
                if (features.length > 0) {
                    try {
                        if (features[0].getGeometry().getType() === 'Point' && layers[0].get('name') === 'drawLayer') {
                            if (transformInteraction.getActive()) {
                                modifyInteraction.setActive(true)
                            }
                        } else {
                            if (!transformInteraction.getActive()) {
                                transformInteraction.setActive(true)
                            }
                            modifyInteraction.setActive(false)
                        }
                    } catch (e) {
                        // modifyInteraction.setActive(false)
                    }
                }
            }
        })
        // フィーチャーにマウスがあたったとき
        map.on("pointermove",function(evt){

            // console.log(evt)



            //少しでも処理を早めるためにMw5レイヤーがあったら抜ける。-----------
            // const layers00 = evt.map.getLayers().getArray();
            // let mw5 = layers00.find(el => el.get('mw'));
            // if (mw5) return //ここで抜ける



            //ここを復活----------------------------------------------------------
            // document.querySelector('#' + mapName + ' .ol-viewport').style.cursor = "default"
            const map = evt.map;
            // const option = {
            //   layerFilter: function (layer) {
            //     return layer.get('name') === 'Mw5center' || layer.get('name') === 'Mw20center';
            //   }
            // };
            // const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            //     return feature;
            // })
            // if (feature) {
            //     document.querySelector('#' + mapName + ' .ol-viewport').style.cursor = "pointer"
            // }
            // // --------------------------------------------------------------------------------
            const layers = map.getLayers().getArray().filter((layer) => {
                return layer.getVisible()
            })
            const layerNames = layers.map((v) => {
                return v.get('name')
            })
            async function pointerCreate() {
                let fetchData = layerNames.map((layerName) => {
                    let server
                    let zoom
                    // console.log(layerName)
                    switch (layerName) {
                        case 'shinsuishin':
                            server = 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin/'
                            zoom = 17
                            break
                        case 'shinsuishinK':
                            server = 'https://disaportaldata.gsi.go.jp/raster/01_flood_l1_shinsuishin_newlegend_kuni_data/'
                            zoom = 17
                            break
                        case 'tunami':
                            server = 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/'
                            zoom = 17
                            break
                        case 'keizoku':
                            server = 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_keizoku_kuni_data/'
                            zoom = 17
                            break
                        case 'takasio':
                            server = 'https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/'
                            zoom = 17
                            break
                        case 'tameike':
                            server = 'https://disaportal.gsi.go.jp/data/raster/07_tameike/'
                            zoom = 17
                            break
                        case 'ekizyouka':
                            server = 'https://disaportal.gsi.go.jp/raster/08_03_ekijoka_zenkoku/'
                            zoom = 15
                            break
                        case 'dosya':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/'
                            zoom = 17
                            break
                        case 'doseki':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukikenkeiryu/'
                            zoom = 17
                            break
                        case 'kyuukeisya':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_kyukeisyachihoukai/'
                            zoom = 17
                            break
                        case 'zisuberi':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_jisuberikikenkasyo/'
                            zoom = 17
                            break
                        case 'nadare':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_nadarekikenkasyo/'
                            zoom = 17
                            break
                        case 'jisin':
                            server = 'https://maps.gsi.go.jp/xyz/jishindo_yosoku/'
                            zoom = 15
                            break
                        case 'morido':
                            server = 'https://disaportaldata.gsi.go.jp/raster/daikiboumoritsuzouseichi/'
                            zoom = 15
                            break
                        case 'dojyou':
                            server = 'https://soil-inventory.rad.naro.go.jp/tile/figure/'
                            zoom = 12
                            break
                        case 'sitti':
                            server = 'https://cyberjapandata.gsi.go.jp/xyz/swale/'
                            zoom = 16
                            break
                        case 'nantoraraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/nantoraraster2/'
                            zoom = 15
                            break
                        case 'nantorashindraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/nantorashindoraster/'
                            zoom = 13
                            break
                        case 'nantoraekijyokaraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/nantoraekijyokaraster/'
                            zoom = 13
                            break
                        case 'hyugatsunamiraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/hyuganadatsunamiraster/'
                            zoom = 15
                            break
                        case 'hyuganadashindraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/hyuganadashindoraster/'
                            zoom = 13
                            break
                        case 'hyuganadatsunamitotatsu':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/hyuganadatotatsuraster/'
                            zoom = 15
                            break
                        case 'ekizyouka17':
                            server = 'https://disaportal.gsi.go.jp/raster/08_03_ekijoka_pref/17_ishikawa/'
                            zoom = 15
                            break
                    }
                    if (server) return getRgb0(evt,server,zoom)
                })
                fetchData = fetchData.filter((v) =>{
                    return v
                })
                await Promise.all([
                    ...fetchData
                ])
                    .then((response) => {
                        let flg = false
                        response.forEach((v) =>{
                            if (v[3]) flg = true
                        })
                        if (flg) {
                            document.querySelector('#' + mapName + ' .ol-viewport').style.cursor = "pointer"
                        } else {
                            document.querySelector('#' + mapName + ' .ol-viewport').style.cursor = "default"
                            const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                                return feature;
                            })
                            if (feature) {
                                document.querySelector('#' + mapName + ' .ol-viewport').style.cursor = "pointer"
                            } else {
                                document.querySelector('#' + mapName + ' .ol-viewport').style.cursor = "default"
                            }
                        }
                        rgbaArr = []
                        funcArr = []
                    })
            }
            if (window.innerWidth > 1000) pointerCreate()
        });
        // シングルクリック------------------------------------------------------------------------------------

        // 洪水,津波,継続,普通のフィーチャー用-----------------------------------------------------------------

        map.on('singleclick', function (evt) {

            console.log(JSON.stringify(transform(evt.coordinate, "EPSG:3857", "EPSG:4326")))

            //-----------------------------------------------------
            // 後ろの方で利用している。
            const pixel = (evt.map).getPixelFromCoordinate(evt.coordinate);
            const features9 = [];
            const layers9 = [];
            evt.map.forEachFeatureAtPixel(pixel,function(feature,layer){
                features9.push(feature);
                layers9.push(layer);
            })
            //-----------------------------------------------------

            rgbaArr = []
            funcArr = []
            overlay[i].setPosition(undefined)
            d3.select('#' + mapName + ' .loadingImg').style("display","block")
            document.querySelector('#' + mapName + ' .ol-viewport').style.cursor = "wait"

            const layers = map.getLayers().getArray().filter((layer) => {
                return layer.getVisible()
            })
            console.log(layers)
            const layerNames = layers.map((layer) => {
                const zoom = map.getView().getZoom()
                if (layer.get('zoom')) {
                    if (layer.get('zoom') >= zoom - 1) {
                        return layer.get('name')
                    }
                } else {
                    return layer.get('name')
                }
            })
            // シームレス地質図-------------------------------------------------------------------------------
            function popupSeamless(evt) {
                return new Promise(resolve => {
                    const coordinate = evt.coordinate;
                    const coord4326 = transform(coordinate, "EPSG:3857", "EPSG:4326");
                    const point = coord4326[1] + "," + coord4326[0];
                    const url = 'https://gbank.gsj.jp/seamless/v2/api/1.2/legend.json'
                    axios.get(url, {
                        params: {
                            point:point
                        }
                    }) .then(function (response) {
                        // console.log(response.data.symbol)
                        if (response.data.symbol) {
                            const cont =
                                '<div style=width:300px>形成時代 = ' + response.data["formationAge_ja"] +
                                '<hr>グループ = ' + response.data["group_ja"] +
                                '<hr>岩相 = ' + response.data["lithology_ja"] + '</div>'
                            resolve(cont)
                        } else {
                            resolve('')
                        }
                    });
                })
            }
            // -------------------------------------------------------------------------------
            async function popupCreate() {
                const fetchData = layerNames.map((layerName) => {
                    let server
                    let zoom
                    let func
                    switch (layerName) {
                        case 'shinsuishin':
                            server = 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin/'
                            zoom = 17
                            func = PopUp.popUpShinsuishin
                            break
                        case 'shinsuishinK':
                            server = 'https://disaportaldata.gsi.go.jp/raster/01_flood_l1_shinsuishin_newlegend_kuni_data/'
                            zoom = 17
                            func = PopUp.popUpShinsuishin
                            break
                        case 'tunami':
                            server = 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/'
                            zoom = 17
                            func = PopUp.popUpTunami
                            break
                        case 'keizoku':
                            server = 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_keizoku_kuni_data/'
                            zoom = 17
                            func = PopUp.popUpKeizoku
                            break
                        case 'takasio':
                            server = 'https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/'
                            zoom = 17
                            func = PopUp.popUpTakasio
                            break
                        case 'tameike':
                            server = 'https://disaportal.gsi.go.jp/data/raster/07_tameike/'
                            zoom = 17
                            func = PopUp.popUpTameike
                            break
                        case 'ekizyouka':
                            server = 'https://disaportal.gsi.go.jp/raster/08_03_ekijoka_zenkoku/'
                            zoom = 15
                            func = PopUp.popUpEkizyouka
                            break
                        case 'dosya':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/'
                            zoom = 17
                            func = PopUp.popUpDosya
                            break
                        case 'doseki':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukikenkeiryu/'
                            zoom = 17
                            func = PopUp.popUpDoseki
                            break
                        case 'kyuukeisya':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_kyukeisyachihoukai/'
                            zoom = 17
                            func = PopUp.popUpKyuukeisya
                            break
                        case 'zisuberi':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_jisuberikikenkasyo/'
                            zoom = 17
                            func = PopUp.popUpZisuberi
                            break
                        case 'nadare':
                            server = 'https://disaportaldata.gsi.go.jp/raster/05_nadarekikenkasyo/'
                            zoom = 17
                            func = PopUp.popUpNadare
                            break
                        case 'jisin':
                            server = 'https://maps.gsi.go.jp/xyz/jishindo_yosoku/'
                            zoom = 15
                            func = PopUp.popUpJisin
                            break
                        case 'morido':
                            server = 'https://disaportaldata.gsi.go.jp/raster/daikiboumoritsuzouseichi/'
                            zoom = 15
                            func = PopUp.popUpMorido
                            break
                        case 'dojyou':
                            server = 'https://soil-inventory.rad.naro.go.jp/tile/figure/'
                            zoom = 12
                            func = PopUp.popUpDojyou
                            break
                        case 'sitti':
                            server = 'https://cyberjapandata.gsi.go.jp/xyz/swale/'
                            zoom = 16
                            func = PopUp.popUpTisitu
                            break
                        case 'nantoraraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/nantoraraster2/'
                            zoom = 15
                            func = PopUp.popUpNantora
                            break
                        case 'nantorashindraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/nantorashindoraster/'
                            zoom = 13
                            func = PopUp.popUpNantoraShindo
                            break
                        case 'nantoraekijyokaraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/nantoraekijyokaraster/'
                            zoom = 13
                            func = PopUp.popUpNantoraEkijyoka
                            break
                        case 'hyugatsunamiraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/hyuganadatsunamiraster/'
                            zoom = 15
                            func = PopUp.popUpHyugaTsunami
                            break
                        case 'hyuganadashindraster':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/hyuganadashindoraster/'
                            zoom = 13
                            func = PopUp.popUpHyugaShindo
                            break
                        case 'hyuganadatsunamitotatsu':
                            server = 'https://kenzkenz3.xsrv.jp/mvt/miyazaki/hyuganadatotatsuraster/'
                            zoom = 15
                            func = PopUp.popUpHyuganadaToutatsu
                            break
                        case 'ekizyouka17':
                            server = 'https://disaportal.gsi.go.jp/raster/08_03_ekijoka_pref/17_ishikawa/'
                            zoom = 15
                            func = PopUp.popUpEkijoka17
                            break
                    }
                    if (server) return getRgb0(evt,server,zoom,func)
                })
                // ----------------------------------------------------
                const layers0 = map.getLayers().getArray()
                const seamlessLayer = layers0.find(el => el.get('name') === 'seamless')
                if (seamlessLayer) {
                    if (seamlessLayer.getVisible()) fetchData.push(popupSeamless(evt))
                }
                // ------------------------------------------------------
                // console.log(fetchData)
                await Promise.all([
                    ...fetchData
                ])
                    .then((response) => {
                        let html = ''
                        const aaa = rgbaArr.map((rgba,i) =>{
                            return {'layerName':layerNames[i] ,'rgba':rgba,'func':funcArr[i]}
                        })
                        aaa.forEach((value) =>{
                            if (value.func(value.rgba)) html += value.func(value.rgba)
                        })
                        if (seamlessLayer) html += response[response.length-1]
                        if (html) html += '<hr>'
                        // console.log(html)
                        // const pixel = (evt.map).getPixelFromCoordinate(evt.coordinate);
                        // const features = [];
                        // const layers = [];
                        // evt.map.forEachFeatureAtPixel(pixel,function(feature,layer){
                        //     features.push(feature);
                        //     layers.push(layer);
                        // })
                        if(features9.length>0) {
                            if (layers9[0]) {
                                PopUp.popUp(evt.map, layers9, features9, overlay[i], evt, content, html)
                                rgbaArr = []
                                funcArr = []
                            }
                        } else {
                            PopUp.popUp(evt.map,null,null,overlay[i],evt,content, html)
                            rgbaArr = []
                            funcArr = []
                        }
                        d3.select('#' + mapName + ' .loadingImg').style("display","none")
                        document.querySelector('#' + mapName + ' .ol-viewport').style.cursor = "default"
                    })
            }
            popupCreate()
        })
        // // 大正古地図用-----------------------------------------------------------------
        // map.on('singleclick', function (evt) {
        //
        //     const feature = map.forEachFeatureAtPixel(evt.pixel,
        //         function(feature) {
        //             return feature;
        //         });
        //     if (feature) return;
        //
        //
        //     //少しでも処理を早めるために古地図レイヤーがなかったら抜ける。
        //     const layers = map.getLayers().getArray();
        //     let kotizuLayer = layers.find(el => el.get('dep'));
        //     if (!kotizuLayer) return //ここで抜ける
        //
        //     //  洪水浸水想定と重ねるときは動作させない
        //     const layers0 = map.getLayers().getArray();
        //     const hazardLayers = layers0.filter(el => el.get('pointer'));
        //     if (hazardLayers.length>0) return
        //     // ここまで
        //
        //     // ここから本番
        //     const pixel = (map).getPixelFromCoordinate(evt.coordinate);
        //     const clickedLayers = [];
        //     //クリックされた箇所のレイヤーを複数取得する
        //     (map).forEachLayerAtPixel(pixel,function(layer){
        //         clickedLayers.push(layer);
        //     });
        //
        //     const layers00 = map.getLayers().getArray().filter((layer) => {
        //         return layer.getVisible()
        //     })
        //     console.log(layers00)
        //     console.log(clickedLayers)
        //
        //     // クリックされたレイヤーのうちdepを持っているレイヤーだけ抽出する。
        //     kotizuLayer = clickedLayers.find(el => el.values_.dep);
        //     if (kotizuLayer) {
        //         const dep = kotizuLayer.values_.dep
        //         if (kotizuLayer.getFilters().length >0) {
        //             // 3回削除する必要がある。
        //             kotizuLayer.removeFilter()
        //             kotizuLayer.removeFilter()
        //             kotizuLayer.removeFilter()
        //             maxZndex++
        //             kotizuLayer.setZIndex(maxZndex)
        //         } else {
        //             Layers.mask(dep,kotizuLayer)
        //             kotizuLayer.setZIndex(undefined)
        //         }
        //     }
        //     drawLayer2.setZIndex(maxZndex)
        // })

        //--------------------------------------------------------------------------------
        // シームレス地質図ポップアップ用
        map.on('singleclick', function (evt) {
            // const layers0 = map.getLayers().getArray();
            // const seamlessLayer = layers0.find(el => el.get('name') === 'seamless');
            // if (seamlessLayer) PopUp.popupSeamless(overlay[i],evt,content)
        })
        //------------------------------------------------------------------------------------------------------
        // 米軍地形図用
        map.on('singleclick', function (evt) {

            const feature = map.forEachFeatureAtPixel(evt.pixel,
                function(feature) {
                    return feature;
                });
            if (feature) return;

            const layers = map.getLayers().getArray();
            //  洪水浸水想定と重ねるときは動作させない
            const hazardLayers = layers.filter(el => el.get('pointer'));
            if (hazardLayers.length>0) return

            const resultUsaAll = layers.find(el => el === Layers.usaall[mapName]);
            const resultUsatokyoall = layers.find(el => el === Layers.usatokyoall[mapName]);
            let gLayers;
            if (resultUsaAll || resultUsatokyoall) {
                if (resultUsaAll) gLayers = Layers.usaall[mapName].values_.layers.array_;
                if (resultUsatokyoall) gLayers = Layers.usatokyoall[mapName].values_.layers.array_;
                // console.log(gLayers.length)
                const lon = evt.coordinate[0], lat = evt.coordinate[1];
                for (let i in gLayers) {
                    const extent2 = gLayers[i].values_['extent2'];
                    if(extent2) {
                        const lonMin = extent2[0], lonMax = extent2[2], latMin = extent2[1], latMax = extent2[3];
                        if (lonMin < lon && lonMax > lon) {
                            if (latMin < lat && latMax > lat) {
                                maxZndex++
                                gLayers[i].setZIndex(maxZndex)

                            } else {
                                gLayers[i].setZIndex(undefined)
                            }
                        }
                    }
                }

                drawLayer.setZIndex(maxZndex)

            }
        })

        //------------------------------------------------------------------------------------------------------
        // 旧版地形図用
        map.on('singleclick', function (evt) {
            const map = evt.map;
            const option = {
                layerFilter: function (layer) {
                    return layer.get('name') === 'Mw5center'
                        || layer.get('name') === 'Mw20center';
                }
            };
            const feature = map.forEachFeatureAtPixel(evt.pixel,
                function(feature) {
                    return feature;
                },option);
            if (feature) {
                const prop = feature.getProperties();
                const uri = prop.uri
                const title = prop.title
                const mwId = prop.id
                if (uri) {
                    store.commit('base/updateDialogShow',true)
                    store.commit('base/updateSuUrl', uri)
                    store.commit('base/updateMwId', mwId)
                }
                return
            }
            //  洪水浸水想定と重ねるときは動作させない
            const layers0 = map.getLayers().getArray();
            const hazardLayers = layers0.filter(el => el.get('pointer'));
            if (hazardLayers.length>0) return

            const layers = map.getLayers().getArray();
            const result5 = layers.find(el => el === Layers.mw5Obj[mapName]);
            const result20 = layers.find(el => el === Layers.mw20Obj[mapName]);
            if(result5 && result20) {
                if(result5.myZindex > result20.myZindex) {
                    extentChange(5)
                } else {
                    extentChange(20)
                }
            } else if (result5) {
                extentChange(5)
            } else if (result20) {
                extentChange(20)
            }
            function extentChange (mw){
                let gLayers;
                let lonOutside; let latOutside;
                if(mw === 5) {
                    gLayers = Layers.mw5Obj[mapName].values_.layers.array_;
                    lonOutside = 5000; latOutside = 4000
                } else {
                    gLayers = Layers.mw20Obj[mapName].values_.layers.array_;
                    lonOutside = 24000; latOutside = 14000
                }
                const lon = evt.coordinate[0], lat = evt.coordinate[1];
                for (let i in gLayers) {
                    const extent2 = gLayers[i].values_['extent2'];
                    // console.log(extent2)
                    const lonMin = extent2[0], lonMax = extent2[2], latMin = extent2[1], latMax = extent2[3];
                    if (lonMin < lon && lonMax > lon) {
                        if (latMin < lat && latMax > lat) {
                            if (gLayers[i].getExtent()[0] === extent2[0]) {
                                maxZndex++;
                                gLayers[i].setExtent([lonMin - lonOutside, latMin - latOutside, lonMax + lonOutside, latMax + latOutside]);
                                gLayers[i].setZIndex(maxZndex)
                            } else {
                                gLayers[i].setExtent(extent2);
                                gLayers[i].setZIndex(undefined)
                            }
                            break;
                        }
                    }
                }

                drawLayer.setZIndex(maxZndex)

            }
        })

        const removeLastPoint = function(evt){
            // console.log(evt.keyCode)
            if(evt.key === 'Escape' || evt.key === 'Backspace' || evt.key === 'Delete'){
                if (document.querySelector('#dialog-edit').style.display === 'block' ||
                    document.querySelector('#dialog-geojson').style.display === 'block' ) {
                    return
                } else {
                    transformInteraction.select()
                    lineInteraction.removeLastPoint()
                    polygonInteraction.removeLastPoint()
                    circleInteraction.removeLastPoint()
                    modifyInteraction.removePoint()
                    modifyTouchInteraction.removePoint()
                }
            }
        }
        if (i === '0') {
            document.addEventListener('keydown', removeLastPoint, false)
        }
        if (i === '0') {
            addEventListener('keydown', function (event) {
                if ((event.key === 'z' && event.metaKey) && !event.shiftKey) {
                    lineInteraction.removeLastPoint()
                    polygonInteraction.removeLastPoint()
                    circleInteraction.removeLastPoint()
                    undoInteraction.undo()
                }
            })
            addEventListener('keydown', function (event) {
                if (event.key === 'z' && event.metaKey && event.shiftKey) {
                    undoInteraction.redo()
                }
            })
        }
        if (i === '0') {
            addEventListener('keydown', function (event) {
                console.log(event.key)
                if (event.key === 'Backspace' || event.key === 'Delete') {
                    if (document.querySelector('#dialog-edit').style.display === 'block' ||
                        document.querySelector('#dialog-geojson').style.display === 'block' ) {
                        return
                    }
                    drawLayer.getSource().removeFeature(store.state.base.editFeature)
                    const tFeatures = transformInteraction.getFeatures().array_
                    tFeatures.forEach((feature) => {
                        drawLayer.getSource().removeFeature(feature)
                    })
                    // modifyInteraction.removePoint()
                    overlay[i].setPosition(undefined)
                }
            })
        }
        // ------------------------------------------------------------
        map.on('singleclick', function (evt) {
            const feature = map.forEachFeatureAtPixel(evt.pixel,
                function (feature) {
                    return feature
                })
            console.log(feature)
            const layerNames = map.forEachFeatureAtPixel(evt.pixel,
                function (feature,layer) {
                    console.log(layer)
                    if (layer) return  layer.get('name')
                })
            if (layerNames) {
                if (layerNames.indexOf('drawLayer') !== -1 ) {
                    if (store.state.base.drawMode === 'sentaku') {
                        if (window.innerWidth > 1000) {
                            store.commit('base/incrDialogMaxZindex')
                            store.state.base.dialogs.measureDialog.style["z-index"] = this.s_dialogMaxZindex
                            store.state.base.dialogs.measureDialog.style.display = 'block'
                        }
                        store.state.base.editFeature = feature
                        if (feature.getGeometry().getType() === 'LineString' || feature.getGeometry().getType() === 'MultiLineString') {
                            if (feature.getGeometry().getCoordinates()[0][2]) {
                                profileControl.setGeometry(feature)
                                const dialog = store.state.base.dialogs.dialogProfile
                                store.commit('base/incrDialogMaxZindex');
                                dialog.style["z-index"] = this.s_dialogMaxZindex;
                                dialog.style.display = 'block'
                                point = new Feature(new Point([feature.getGeometry().getCoordinates()[0], feature.getGeometry().getCoordinates()[1]]));
                                point.setStyle([]);
                                profileDrawSource.addFeature(point)
                                if (feature.getProperties().name) {
                                    document.querySelector('#dialog-profile .drag-handle').innerHTML = feature.getProperties().name
                                }
                            }
                        }
                        drawLayer.getSource().changed()
                     } else {
                         // store.state.base.editFeature = null
                         // drawLayer.getSource().changed()
                     }
                } else if (layerNames.indexOf('syochiki2020') !== -1) {
                    console.log(feature.getProperties().KEY_CODE)
                    store.state.base.clickedFeature = feature.getProperties().KEY_CODE
                    syochiiki2020MvtObj['map01'].getSource().changed()
                    syochiiki2020MvtObj['map02'].getSource().changed()
                } else {
                    store.state.base.editFeature = ''
                    drawLayer.getSource().changed()
                    store.state.base.clickedFeature = ''
                    syochiiki2020MvtObj['map01'].getSource().changed()
                    syochiiki2020MvtObj['map02'].getSource().changed()
                }
            } else {
                store.state.base.editFeature = ''
                drawLayer.getSource().changed()
                store.state.base.clickedFeature = ''
                syochiiki2020MvtObj['map01'].getSource().changed()
                syochiiki2020MvtObj['map02'].getSource().changed()
            }
        })
        // シングルクリック終わり---------------------------------------------------------------------

        const popupElm =document.querySelector('#' + maps[i].mapName + ' .ol-overlaycontainer-stopevent')
        const cssText = popupElm.style.cssText
        popupElm.onclick = () => {
            store.commit('base/incrDialogMaxZindex')
            popupElm.style.cssText = cssText + 'z-index: ' + store.state.base.dialogMaxZindex + '!important;'
        }

        //----------------------------------------------------------------------------------------
        const getElevation = (event) =>{
            let z = Math.floor(map.getView().getZoom())
            if(z>9) z=9;
            // const coord = event.coordinate // こっちにするとマウスの標高を取得する。
            const coord =map.getView().getCenter()
            const R = 6378137;// 地球の半径(m);
            const x = ( 0.5 + coord[ 0 ] / ( 2 * R * Math.PI ) ) * Math.pow( 2, z );
            const y = ( 0.5 - coord[ 1 ] / ( 2 * R * Math.PI ) ) * Math.pow( 2, z );
            const e = event;
            const zoom = String(Math.floor(map.getView().getZoom() * 100) / 100)
            // vm.zoom[mapName] = 'zoom=' + zoom
            // vm.zoom[mapName] = ''
            getElev( x, y, z, function( h ) {
                // const zoom = String(Math.floor(map.getView().getZoom() * 100) / 100)
                if (h !=='e') {
                    // console.log(h)
                    store.state.base.hyokou = h
                    vm.zoom[mapName] = 'zoom=' + zoom + '  中心の標高' + h + 'm'
                } else {
                    // vm.zoom[mapName] = 'zoom=' + zoom
                    vm.zoom[mapName] = '標高取得できませんでした。'
                }
            })

            const lonLat = transform([coord[0], coord[1]], "EPSG:3857", "EPSG:4326")
            // axios
            //     .get('https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress', {
            //         params: {
            //             lon: lonLat[0],
            //             lat: lonLat[1]
            //         }
            //     })
            //     .then(function (response) {
            //         // console.log(response.data.results)
            //         const elAddress = document.querySelector( '#' + mapName + ' .address')
            //         if (response.data.results) {
            //             const splitMuni = muni[Number(response.data.results.muniCd)].split(',')
            //             if (elAddress.innerHTML !== response.data.results.lv01Nm) elAddress.innerHTML = splitMuni[1] + splitMuni[3] + response.data.results.lv01Nm
            //         } else {
            //             elAddress.innerHTML = ''
            //         }
            //     })
        }
        map.on('moveend', function (event) {
            // console.log(777)
            moveEnd()
            getElevation(event)
            // map.render();
        });
        map.on("pointermove",function(event){
            getElevation(event)
        });
        // ****************
        // 産総研さん作成の関数
        // getElev, タイル座標とズームレベルを指定して標高値を取得する関数
        //  rx, ry: タイル座標(実数表現）z: ズームレベル
        //	thenは終了時に呼ばれるコールバック関数
        //	成功時には標高(単位m)，無効値の場合は'e'を返す
        // ****************
        function getElev( rx, ry, z, then ) {
            // const elevServer = 'https://gsj-seamless.jp/labs/elev2/elev/' // 海あり
            const elevServer = 'https://tiles.gsj.jp/tiles/elev/mixed/'
            // const elevServer = 'https://tiles.gsj.jp/tiles/elev/land/' // 陸地のみ
            const x = Math.floor( rx )				// タイルX座標
            const y = Math.floor( ry )				// タイルY座標
            const i = ( rx - x ) * 256			// タイル内i座標
            const j = ( ry - y ) * 256			// タイル内j座標
            const img = new Image();
            // let  h = 'e'
            img.crossOrigin = 'anonymous';
            img.alt = "";
            img.onload = function(){
                const canvas = document.createElement( 'canvas' )
                const context = canvas.getContext( '2d' )
                let  h = 'e'
                canvas.width = 1;
                canvas.height = 1;
                context.drawImage( img, i, j, 1, 1, 0, 0, 1, 1 );
                const data = context.getImageData( 0, 0, 1, 1 ).data;
                if (data) {
                    if ( data[ 3 ] === 255 ) {
                        h = data[ 0 ] * 256 * 256 + data[ 1 ] * 256 + data[ 2 ];
                        h = ( h < 8323072 ) ? h : h - 16777216;
                        h /= 100;
                    }
                }
                then( h );
            }
            // console.log(elevServer + z + '/' + y + '/' + x + '.png?res=cm')
            img.src = elevServer + z + '/' + y + '/' + x + '.png?res=cm';
        }
    }
}
// -------------------------------------------------------------------------------------



// -------------------------------------------------------------------------------------
let rgbaArr = []
let funcArr = []
function getRgb( rx, ry, z, server) {
    return new Promise(resolve => {
        const x = Math.floor( rx )				// タイルX座標
        const y = Math.floor( ry )				// タイルY座標
        const i = ( rx - x ) * 256			// タイル内i座標
        const j = ( ry - y ) * 256			// タイル内j座標
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.alt = "";
        // ----------------------------------------
        // function load(_url){
        //     var xhr;
        //     xhr = new XMLHttpRequest();
        //     xhr.open("HEAD", _url,false);
        //     xhr.send(null);
        //     return xhr.status;
        // }
        // var url = server + z + '/' + x + '/' + y + '.png';
        // if(load(url) != 200){
        //     resolve('err')
        // }
        // ----------------------------------------
        img.onload = function(){
            const canvas = document.createElement( 'canvas' )
            const context = canvas.getContext( '2d' )
            canvas.width = 1;
            canvas.height = 1;
            context.drawImage( img, i, j, 1, 1, 0, 0, 1, 1 );
            const rgb = context.getImageData( 0, 0, 1, 1 ).data;
            resolve(rgb)
        }
        img.onerror = function(){
            resolve('err')
        }
        img.src = server + z + '/' + x + '/' + y + '.png';
    })
}
//-----------------------------------------------------------------------------------
async function getRgb0(event,server,zoom,func) {
    let z
    if (zoom) {
        z= zoom
    // } else {
    //     z = Math.floor(map.getView().getZoom());
    }
    const coord = event.coordinate
    const R = 6378137;// 地球の半径(m);
    const x = ( 0.5 + coord[ 0 ] / ( 2 * R * Math.PI ) ) * Math.pow( 2, z );
    const y = ( 0.5 - coord[ 1 ] / ( 2 * R * Math.PI ) ) * Math.pow( 2, z );
    const result = await getRgb( x, y, z, server);
    if (result) {
        // console.log(result)
        rgbaArr.push(result)
        funcArr.push(func)
        return result
    }
}

//現在地取得
let interval
export function currentPosition () {
    const bottomRightDivOlbtn = document.querySelector('.bottom-right-div .olbtn')

    const currentPosition1 = store.state.base.maps['map01'].overlays_.getArray()[2]
    const currentPosition2 = store.state.base.maps['map02'].overlays_.getArray()[2]

    store.commit('base/toggleCurrentPosition')
    const map = store.state.base.maps['map01'];
    const success = (pos) =>{
        const lon = pos.coords.longitude;
        const lat = pos.coords.latitude;
        // map.getView().setCenter(transform([lon,lat],"EPSG:4326","EPSG:3857"));
        const center = transform([lon,lat],"EPSG:4326","EPSG:3857")
        map.getView().animate({
            center: center,
            duration: 500
        });
        currentPosition1.setPosition(center)
        currentPosition2.setPosition(center)
    }
    const  fail = (error) =>{alert('位置情報の取得に失敗しました。エラーコード：' + error.code)}
    // let interval
    const stop = () => {clearInterval(interval)}
    if (store.state.base.currentPosition) {
        bottomRightDivOlbtn.style.backgroundColor = "red"
        interval = setInterval(function(){
            navigator.geolocation.getCurrentPosition(success, fail);
        },1000);
    } else {
        bottomRightDivOlbtn.style.backgroundColor = ""
        stop()
        currentPosition1.setPosition(undefined)
        currentPosition2.setPosition(undefined)
    }
}

export function synch (vm) {
    vm.synchFlg = !vm.synchFlg;
    let map01View = store.state.base.maps.map01.getView();
    console.log(map01View.getCenter())
    if (!vm.synchFlg) {
        const viewArr = [];
        for (let i = 0; i < 3; i++) {
            viewArr[i] = new View({
                center: map01View.getCenter(),
                zoom: map01View.getZoom()
            })
        }
        console.log(viewArr[0])
        store.state.base.maps.map02.setView(viewArr[0])
        store.state.base.maps.map01.removeInteraction(synchronizeInteraction)
        store.state.base.maps.map02.removeInteraction(synchronizeInteraction2)
    } else {
        store.state.base.maps.map02.setView(map01View)
        store.state.base.maps.map01.addInteraction(synchronizeInteraction)
        store.state.base.maps.map02.addInteraction(synchronizeInteraction2)
  }
}

export function resize () {
    store.state.base.maps.map01.updateSize();
    store.state.base.maps.map02.updateSize();
}

export function history (layer,url) {
    const ua = navigator.userAgent
    const width = window.screen.width;
    const height = window.screen.height;
    const referrer = document.referrer
    axios
        .get('https://kenzkenz.xsrv.jp/open-hinata/php/layer.php',{
            params: {
                layer: layer,
                screen: width + ' x ' + height,
                ua: ua,
                referrer:referrer,
                url: url
            }
        })
}

export function watchLayer (map, thisName, newLayerList,oldLayerList) {
    //まず最初に全てのレイヤー（old）を削除する。
    oldLayerList[0].forEach(value => {
        map.removeLayer(value.layer);
    })
    // 浸水キキクル-----------------------------------------------------------------
    const resultS = newLayerList[0].find((layer) => {
        return layer.title === '浸水キキクル'
    })
    if(resultS) {
        async function sCreated() {
            const response = await fetch("https://www.jma.go.jp/bosai/jmatile/data/risk/targetTimes.json")
            const targetTimes = await response.json()
            const basetime = targetTimes[0].basetime
            targetTimes.sort((a, b) =>
                a.basetime > b.basetime ? 1 : -1
            )
            store.state.info.shinsuikikikuruTimes = targetTimes
            store.state.info.timeS[map.values_.target] = time (basetime)
            const url = 'https://www.jma.go.jp/bosai/jmatile/data/risk/' + basetime + '/immed0/' + basetime + '/surf/inund/{z}/{x}/{y}.png'
            Layers.shinsuikikikuruObj.map01.getSource().setUrl(url)
            Layers.shinsuikikikuruObj.map02.getSource().setUrl(url)
        }
        sCreated()
    }
    // 洪水キキクル-----------------------------------------------------------------
    const resultK = newLayerList[0].find((layer) => {
        return layer.title === '洪水キキクル'
    })
    if(resultK) {
        async function kCreated() {
            const response = await fetch("https://www.jma.go.jp/bosai/jmatile/data/risk/targetTimes.json")
            const targetTimes = await response.json()
            const basetime = targetTimes[0].basetime
            targetTimes.sort((a, b) =>
                a.basetime > b.basetime ? 1 : -1
            )
            store.state.info.kozuikikikuruTimes = targetTimes
            store.state.info.timeK[map.values_.target] = time (basetime)
            const url = 'https://www.jma.go.jp/bosai/jmatile/data/risk/' + basetime + '/immed0/' + basetime + '/surf/flood/{z}/{x}/{y}.pbf'
            Layers.kozuikikikuruObj.map01.getSource().setUrl(url)
            Layers.kozuikikikuruObj.map02.getSource().setUrl(url)
        }
        kCreated()
    }
    // 土砂キキクル-----------------------------------------------------------------
    const resultD = newLayerList[0].find((layer) => {
        return layer.title === '土砂キキクル'
    })
    if(resultD) {
        async function dCreated() {
            const response = await fetch("https://www.jma.go.jp/bosai/jmatile/data/risk/targetTimes.json")
            const targetTimes = await response.json()
            const basetime = targetTimes[0].basetime
            targetTimes.sort((a, b) =>
                a.basetime > b.basetime ? 1 : -1
            )
            store.state.info.dosyakikikuruTimes = targetTimes
            store.state.info.timeD[map.values_.target] = time (basetime)
            const url = 'https://www.jma.go.jp/bosai/jmatile/data/risk/' + basetime + '/immed0/' + basetime + '/surf/land/{z}/{x}/{y}.png'
            Layers.dosyakikikuruObj.map01.getSource().setUrl(url)
            Layers.dosyakikikuruObj.map02.getSource().setUrl(url)
        }
        dCreated()
    }
    // 台風作成-----------------------------------------------------------------
    const resultT = newLayerList[0].find((layer) => {
        return layer.title === '台風'
    })
    if(resultT) {
        LayersMvt.typhoonObj.map01.getSource().clear()
        LayersMvt.typhoonObj.map02.getSource().clear()
        async function tCreated() {
            // 台風-----------------------------------------------------------------------
            const Typhoon_List_URL = "https://www.jma.go.jp/bosai/typhoon/data/targetTc.json"
            const response = await fetch(Typhoon_List_URL)
            const TyphoonList = await response.json()
            let TyphoonData
            if (TyphoonList.length > 0) {
                for (const typhoon of TyphoonList) {
                    const TC_ID = typhoon.tropicalCyclone
                    const Typhoon_Data_URL = "https://www.jma.go.jp/bosai/typhoon/data/" + TC_ID + "/forecast.json"
                    const response = await fetch(Typhoon_Data_URL)
                    TyphoonData = await response.json()
                    let Typhoon_No
                    let Typhoon_Name = ''
                    if (TyphoonData[0].name) {
                        Typhoon_No = "台風" + TyphoonData[0].typhoonNumber.slice(-2) + "号"
                        Typhoon_Name = TyphoonData[0].name.jp
                    } else {
                        Typhoon_No = '熱帯低気圧 ' + TyphoonData[0].typhoonNumber
                    }
                    TyphoonData.forEach((t, i) => {
                        // console.log(i,t)
                        if (i > 0) {
                            const lon = t.center[1]
                            const lat = t.center[0]
                            const jstDate = new Date(t.validtime.JST)
                            const coordinates = turf.toMercator(turf.point([lon, lat])).geometry.coordinates
                            const point = new Point(coordinates)
                            const newFeature = new Feature(point)
                            newFeature.setProperties({
                                '号': Typhoon_No,
                                '名前': Typhoon_Name,
                                '経度、緯度': lon + ',' + lat,
                                '日': jstDate.toLocaleDateString().slice(5).split('/')[1] + '日',
                                '時': jstDate.toLocaleTimeString().slice(0, -3).split(':')[0] + '時',
                                '_i':i
                            })
                            LayersMvt.typhoonObj.map01.getSource().addFeature(newFeature)
                            LayersMvt.typhoonObj.map02.getSource().addFeature(newFeature)
                            if (i > 1) {
                                const lon0 = TyphoonData[i - 1].center[1]
                                const lat0 = TyphoonData[i - 1].center[0]
                                const lon = t.center[1]
                                const lat = t.center[0]
                                const coordinates = turf.toMercator(turf.lineString([[lon0, lat0], [lon, lat]])).geometry.coordinates
                                const line = new LineString(coordinates)
                                const newFeature = new Feature(line)
                                LayersMvt.typhoonObj.map01.getSource().addFeature(newFeature)
                                LayersMvt.typhoonObj.map02.getSource().addFeature(newFeature)
                                //------------------------------------------------------------
                                const radius = t.probabilityCircle.radius / 1000
                                const options = {steps: 60}
                                const circleCoordinates = turf.toMercator(turf.circle([lon, lat], radius, options)).geometry.coordinates
                                const polygon = new Polygon(circleCoordinates)
                                const newFeaturePolygon = new Feature(polygon)
                                newFeaturePolygon.setProperties({
                                    '予想円半径': radius + 'km',
                                })
                                LayersMvt.typhoonObj.map01.getSource().addFeature(newFeaturePolygon)
                                LayersMvt.typhoonObj.map02.getSource().addFeature(newFeaturePolygon)
                                // -----------------------------------------------------------
                            }
                            if (i > 1) {
                                if (t.probabilityCircle.tangent) {
                                    const tangent = t.probabilityCircle.tangent
                                    let coordinates = turf.toMercator(turf.lineString([[tangent[0][1][1], tangent[0][1][0]], [tangent[0][0][1], tangent[0][0][0]]])).geometry.coordinates
                                    let line = new LineString(coordinates)
                                    let newFeature = new Feature(line)
                                    newFeature.setProperties({
                                        '_tangent': true,
                                    })
                                    LayersMvt.typhoonObj.map01.getSource().addFeature(newFeature)
                                    LayersMvt.typhoonObj.map02.getSource().addFeature(newFeature)
                                    coordinates = turf.toMercator(turf.lineString([[tangent[1][1][1], tangent[1][1][0]], [tangent[1][0][1], tangent[1][0][0]]])).geometry.coordinates
                                    line = new LineString(coordinates)
                                    newFeature = new Feature(line)
                                    newFeature.setProperties({
                                        '_tangent': true,
                                    })
                                    LayersMvt.typhoonObj.map01.getSource().addFeature(newFeature)
                                    LayersMvt.typhoonObj.map02.getSource().addFeature(newFeature)
                                }
                            }
                            if (i === 1) {
                                if(t.galeWarningArea) {
                                    const radius = t.galeWarningArea.radius / 1000
                                    const options = {steps: 60}
                                    const circleCoordinates = turf.toMercator(turf.circle([t.galeWarningArea.center[1], t.galeWarningArea.center[0]], radius, options)).geometry.coordinates
                                    const polygon = new Polygon(circleCoordinates)
                                    const newFeaturePolygon = new Feature(polygon)
                                    newFeaturePolygon.setProperties({
                                        '強風警報エリア': '半径' + radius + 'km',
                                    })
                                    LayersMvt.typhoonObj.map01.getSource().addFeature(newFeaturePolygon)
                                    LayersMvt.typhoonObj.map02.getSource().addFeature(newFeaturePolygon)
                                }
                            }
                            if (i === 1) {
                                if(t.track) {
                                    // console.log(t.track)
                                    if (t.track.preTyphoon.length > 1) {
                                        const coord = t.track.preTyphoon.map((p) => {
                                            return [p[1],p[0]]
                                        })
                                        const coordinates = turf.toMercator(turf.lineString(coord)).geometry.coordinates
                                        const line = new LineString(coordinates)
                                        const newFeature = new Feature(line)
                                        newFeature.setProperties({
                                            '_preTyphoon': true,
                                        })
                                        LayersMvt.typhoonObj.map01.getSource().addFeature(newFeature)
                                        LayersMvt.typhoonObj.map02.getSource().addFeature(newFeature)
                                    }
                                    if (t.track.typhoon.length > 1) {
                                        const coord = t.track.typhoon.map((p) => {
                                            return [p[1],p[0]]
                                        })
                                        const coordinates = turf.toMercator(turf.lineString(coord)).geometry.coordinates
                                        const line = new LineString(coordinates)
                                        const newFeature = new Feature(line)
                                        newFeature.setProperties({
                                            '_typhoon': true,
                                        })
                                        LayersMvt.typhoonObj.map01.getSource().addFeature(newFeature)
                                        LayersMvt.typhoonObj.map02.getSource().addFeature(newFeature)
                                    }
                                }
                            }
                        }
                    })
                }
            }
        }
        tCreated()
    }
    // 台風作成終わり------------------------------------------------------------------------

    function time (basetime) {
        const t = basetime
        const nen = t.slice(0,4)
        const tuki = t.slice(4,6) - 1
        const hi = t.slice(6,8)
        let ji = Number(t.slice(8,10))
        const fun = t.slice(10,12)
        const date = new Date(nen,tuki,hi,ji,fun,0)
        date.setHours(date.getHours() + 9)
        const tukihi = date.toLocaleDateString()
        const time = date.toLocaleTimeString()
        const nen2 = tukihi.split('/')[0] + '年'
        const tuki2 = tukihi.split('/')[1] + '月'
        const hi2 = tukihi.split('/')[2] + '日'
        const ji2 = time.split(':')[0] + '時'
        const fun2 = time.split(':')[1] + '分'
        return nen2 + tuki2 + hi2 + ' ' + ji2 + fun2
    }

    const result = newLayerList[0].find((layer) => {
        return layer.title === '雨雲の動き' || layer.title === '雨雲の動きモノクロ' || layer.title === 'ひまわり'
    })
    if(result) {
        const urls = ['https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json',
            'https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N2.json',
            'https://www.jma.go.jp/bosai/himawari/data/satimg/targetTimes_fd.json' ]
        async function created() {
            const fetchData = urls.map((url) => {
                return axios
                    .get(url,{})
            })
            await Promise.all([
                ...fetchData
            ])
                .then((response) => {
                    response[0].data.sort((a, b) =>
                        a.validtime > b.validtime ? 1 : -1
                    )
                    response[1].data.sort((a, b) =>
                        a.validtime > b.validtime ? 1 : -1
                    )
                    store.state.info.amagumoTimes = response[0].data.concat(response[1].data)
                    store.state.info.himawariTimes = response[2].data
                    const basetime = response[1].data.slice(-1)[0].basetime
                    const basetimeHimawari = response[2].data.slice(-1)[0].basetime
                    // -----------------------------------------------------------
                    store.state.info.time[map.values_.target] = time (basetime)
                    store.state.info.timeH[map.values_.target] = time (basetimeHimawari)
                    // -----------------------------------------------------------
                    aaa(basetime,basetime,basetimeHimawari)
                })
                // .catch(function (response) {
                //     alert('エラーです。')
                // })
        }
        created()
    } else {
        aaa()
    }
    //[0]はレイヤーリスト。[1]はlength
    // 逆ループ
    function aaa (basetime,validtime,basetimeHimawari) {
        let myZindex = 0
        for (let i = newLayerList[0].length - 1; i >= 0; i--) {
            // リストクリックによる追加したレイヤーで リストの先頭で リストの増加があったとき
            const layer = newLayerList[0][i].layer
            const title = newLayerList[0][i].title
            // グループレイヤーで個別にzindexを触っているときがあるのでリセット。重くなるようならここを再検討。
            if (layer.values_.layers) {
                const gLayers = layer.values_.layers.array_;
                for (let i in gLayers) {
                    gLayers[i].setZIndex(undefined);
                    // mw5,mw20のためのコード。気にしすぎ、なくてもいい。
                    const extent2 = gLayers[i].values_['extent2'];
                    if(extent2) gLayers[i].setExtent(extent2);
                    // 古地図のためのコード。気にしすぎ、なくてもいい。
                    const dep = gLayers[i].values_['dep'];
                    if (dep) Layers.mask(dep,gLayers[i])
                }
            }
            // ---------------------------------------------------------------------------------------------------------
            if (title === '雨雲の動き') {
                const url = 'https://www.jma.go.jp/bosai/jmatile/data/nowc/' + basetime + '/none/' + validtime + '/surf/hrpns/{z}/{x}/{y}.png'
                Layers.nowCastObj.map01.getSource().setUrl(url)
                Layers.nowCastObj.map02.getSource().setUrl(url)
            }
            // ---------------------------------------------------------------------------------------------------------
            if (title === '雨雲の動きモノクロ') {
                const url = 'https://www.jma.go.jp/bosai/jmatile/data/nowc/' + basetime + '/none/' + validtime + '/surf/hrpns/{z}/{x}/{y}.png'
                Layers.nowCastMonoObj.map01.getSource().setUrl(url)
                Layers.nowCastMonoObj.map02.getSource().setUrl(url)
            }
            // ---------------------------------------------------------------------------------------------------------
            if (title === 'ひまわり') {
                const tiiki = 'fd' // jpにすると日本
                const url = 'https://www.jma.go.jp/bosai/himawari/data/satimg/' + basetimeHimawari + '/' + tiiki + '/' + basetimeHimawari + '/B13/TBB/{z}/{x}/{y}.jpg'
                // https://www.jma.go.jp/bosai/himawari/data/satimg/20240929043000/fd/20240929043000/B03/ALBD/5/27/12.jpg
                Layers.himawari0Obj.map01.getSource().setUrl(url)
                Layers.himawari0Obj.map02.getSource().setUrl(url)
                Layers.himawariSatObj.map01.setZIndex(9999999)
                Layers.himawariSatObj.map02.setZIndex(9999999)
            }
            // ---------------------------------------------------------------------------------------------------------
            // グループレイヤーのときzindexは効かないようだ。しかしz順が必要になるときがあるので項目を作っている。
            layer['myZindex'] = myZindex++

            map.addLayer(layer);
            if (newLayerList[0][i].check === undefined) {
                newLayerList[0][i].check = true
                layer.setVisible(true)
            } else {
                layer.setVisible(newLayerList[0][i].check)
            }

            if (layer.values_.layers) {
                const gLayers = layer.values_.layers.array_;
                for (let j in gLayers) {
                    if (newLayerList[0][i].multipli===false) {
                        gLayers[j].on("prerender", function (evt) {
                            evt.context.globalCompositeOperation = 'source-over';
                        });
                        gLayers[j].on("postrender", function (evt) {
                            evt.context.globalCompositeOperation = '';
                        });
                    } else if (newLayerList[0][i].multipli===undefined) {
                        if (layer.get('multiply')) {
                            newLayerList[0][i].multipli = true
                            gLayers[j].on("prerender", function (evt) {
                                evt.context.globalCompositeOperation = 'multiply';
                            });
                            gLayers[j].on("postrender", function (evt) {
                                evt.context.globalCompositeOperation = 'source-over';
                            })
                        } else {
                            gLayers[j].on("prerender", function (evt) {
                                evt.context.globalCompositeOperation = 'source-over';
                            });
                            gLayers[j].on("postrender", function (evt) {
                                evt.context.globalCompositeOperation = '';
                            })
                        }
                    } else {
                        gLayers[j].on("prerender", function(evt){
                            evt.context.globalCompositeOperation = 'multiply';
                        });
                        gLayers[j].on("postrender", function(evt){
                            evt.context.globalCompositeOperation = 'source-over';
                        });
                    }
                }
            }
            if (newLayerList[0][i].multipli===false) {
                layer.on("prerender", function (evt) {
                    evt.context.globalCompositeOperation = 'source-over';
                });
                layer.on("postrender", function (evt) {
                    evt.context.globalCompositeOperation = '';
                })
            } else if(newLayerList[0][i].multipli===undefined) {
                if (layer.get('multiply')) {
                    newLayerList[0][i].multipli = true
                    layer.on("prerender", function (evt) {
                        evt.context.globalCompositeOperation = 'multiply';
                    });
                    layer.on("postrender", function (evt) {
                        evt.context.globalCompositeOperation = 'source-over';
                    })
                } else {
                    layer.on("prerender", function (evt) {
                        evt.context.globalCompositeOperation = 'source-over';
                    });
                    layer.on("postrender", function (evt) {
                        evt.context.globalCompositeOperation = '';
                    })
                }
            } else {
                layer.on("prerender", function(evt){
                    evt.context.globalCompositeOperation = 'multiply';
                });
                layer.on("postrender", function(evt){
                    evt.context.globalCompositeOperation = 'source-over';
                });
            }

            // グループレイヤーのとき
            if (layer.values_.layers) {
                layer.values_.layers.getArray(0).forEach(object =>{
                    object.setOpacity(newLayerList[0][i].opacity)
                })
            }
            layer.setOpacity(newLayerList[0][i].opacity)
            // 新規追加したレイヤーだけにズームとセンターを設定する。
            if(!store.state.base.firstFlg) {
                if (store.state.base.jumpFlg) {
                    if (newLayerList[0][0].zoom) {
                        map.getView().setZoom(newLayerList[0][0].zoom)
                    }
                    if (newLayerList[0][0].center) {
                        map.getView().setCenter(transform(newLayerList[0][0].center, "EPSG:4326", "EPSG:3857"));
                    }
                }
            }
        }
        store.commit('base/updateFirstFlg',false)
        map.removeLayer(drawLayer)
        map.addLayer(drawLayer)
        map.removeLayer(danmenLayer)
        map.addLayer(danmenLayer)
        // map.removeLayer(flowLineDrawLayer)
        // map.addLayer(flowLineDrawLayer)
        map.removeLayer(profileDrawLayer)
        map.addLayer(profileDrawLayer)
        // スワイプ設定-------
        try {
            if (map.values_.target === 'map01') {
                if (newLayerList[0][0].layer.values_.layers) {
                    newLayerList[0][0].layer.values_.layers.getArray().forEach((layer) => {
                        swipeControl.removeLayer(layer)
                    })
                } else {
                    swipeControl.removeLayer(newLayerList[0][0].layer)
                }
                if (newLayerList[0][1].layer.values_.layers) {
                    newLayerList[0][1].layer.values_.layers.getArray().forEach((layer) => {
                        swipeControl.removeLayer(layer)
                    })
                } else {
                    swipeControl.removeLayer(newLayerList[0][1].layer)
                }
                //---------------------------------------------------
                if (newLayerList[0][0].layer.values_.layers) {
                    newLayerList[0][0].layer.values_.layers.getArray().forEach((layer) => {
                        swipeControl.addLayer(layer)
                    })
                } else {
                    swipeControl.addLayer(newLayerList[0][0].layer)
                }
                if (newLayerList[0][1].layer.values_.layers) {
                    newLayerList[0][1].layer.values_.layers.getArray().forEach((layer) => {
                        swipeControl.addLayer(layer,true)
                    })
                } else {
                    swipeControl.addLayer(newLayerList[0][1].layer,true)
                }
            } else {
                if (newLayerList[0][0].layer.values_.layers) {
                    newLayerList[0][0].layer.values_.layers.getArray().forEach((layer) => {
                        swipeControl2.removeLayer(layer)
                    })
                } else {
                    swipeControl2.removeLayer(newLayerList[0][0].layer)
                }
                if (newLayerList[0][1].layer.values_.layers) {
                    newLayerList[0][1].layer.values_.layers.getArray().forEach((layer) => {
                        swipeControl2.removeLayer(layer)
                    })
                } else {
                    swipeControl2.removeLayer(newLayerList[0][1].layer)
                }
                //---------------------------------------------------
                if (newLayerList[0][0].layer.values_.layers) {
                    newLayerList[0][0].layer.values_.layers.getArray().forEach((layer) => {
                        swipeControl2.addLayer(layer)
                    })
                } else {
                    swipeControl2.addLayer(newLayerList[0][0].layer)
                }
                if (newLayerList[0][1].layer.values_.layers) {
                    newLayerList[0][1].layer.values_.layers.getArray().forEach((layer) => {
                        swipeControl2.addLayer(layer,true)
                    })
                } else {
                    swipeControl2.addLayer(newLayerList[0][1].layer,true)
                }
            }
        } catch (e){
        }
        // スワイプ設定ここまで-------
    }
}

export function opacityChange (item) {
    // グループレイヤーのとき
    if (item.layer.values_.layers) {
        item.layer.values_.layers.getArray(0).forEach(object =>{
            object.setOpacity(item.opacity)
        })
    }
    item.layer.setOpacity(item.opacity);
}

export function checkLayer (item, layerList, name) {
    store.commit('base/updateList', {value: layerList, mapName: name});
    try {
        if (item.check===false) {
            item.layer.setVisible(false)
        }else{
            item.layer.setVisible(true)
        }
    } catch( e ) {
    }
}
export function multipliLayer (item, layerList, name) {
    store.commit('base/updateList', {value: layerList, mapName: name});
    const map = store.state.base.maps[name];
    // console.log(item.multipli)
    // console.log(item.layer)
    if (item.layer.values_.layers) {
        const gLayers = item.layer.values_.layers.array_;
        for (let i in gLayers) {
            if (item.multipli===false) {
                gLayers[i].on("prerender", function(evt){
                    evt.context.globalCompositeOperation = 'source-over';
                });
                gLayers[i].on("postrender", function(evt){
                    evt.context.globalCompositeOperation = '';
                });
            }else{
                gLayers[i].on("prerender", function(evt){
                    evt.context.globalCompositeOperation = 'multiply';
                });
                gLayers[i].on("postrender", function(evt){
                    evt.context.globalCompositeOperation = 'source-over';
                });
            }
        }
    }

    if (item.multipli===false) {
        item.layer.on("prerender", function(evt){
            evt.context.globalCompositeOperation = 'source-over';
        });
        item.layer.on("postrender", function(evt){
            evt.context.globalCompositeOperation = '';
        });
    } else {
        console.log(item.layer)
        // item.layer.className = 'hoge'
        item.layer.on("prerender", function(evt){
            evt.context.globalCompositeOperation = 'multiply';
        });
        item.layer.on("postrender", function(evt){
            evt.context.globalCompositeOperation = 'source-over';
        });
    }
    map.render();
}

export function removeLayer (item, layerList, name) {
    const result = layerList.filter((el) => el.id !== item.id);
    store.commit('base/updateList', {value: result, mapName: name});
    // 削除するレイヤーの透過度を１に戻す。再度追加するときのために
    item.layer.setOpacity(1);
    const map = store.state.base.maps[name];
    map.removeLayer(item.layer)
}

export function lego (name, selected) {
    const map = store.state.base.maps[name];
    try{map.removeFilter(legoFilter);}catch(e){}
    legoFilter = new Lego({ brickSize:selected, img:'brick' });
    map.addFilter(legoFilter);
}

export function legoRemove (name) {
    const map = store.state.base.maps[name];
    try{map.removeFilter(legoFilter);}catch(e){}
}
export function addressSerch (name,address) {
    const map = store.state.base.maps[name];
    const marker1 = store.state.base.maps['map01'].overlays_.getArray()[1]
    const marker2 = store.state.base.maps['map02'].overlays_.getArray()[1]
    // const marker3 = store.state.base.maps['map03'].overlays_.getArray()[1]
    // const marker4 = store.state.base.maps['map04'].overlays_.getArray()[1]
    console.log(address)
    // 140.097, 37.856のように座標をいれた時の処理
    const splitAddress = address.split(',')
    let lonLat
    if (Number(splitAddress[0]) > Number(splitAddress[1])) {
        lonLat = [splitAddress[0],splitAddress[1]]
    } else {
        lonLat = [splitAddress[1],splitAddress[0]]
    }
    lonLat = transform(lonLat, "EPSG:4326", "EPSG:3857")
    if (lonLat[0] && lonLat[1]) {
        map.getView().setCenter(lonLat);
        map.getView().setZoom(14)
        marker1.setPosition(lonLat)
        return
    }
    // 通常の住所をいれた時の処理
    if (address === '') {
        marker1.setPosition(undefined);
        marker2.setPosition(undefined);
        // marker3.setPosition(undefined);
        // marker4.setPosition(undefined);
    } else {
        axios
            .get('https://msearch.gsi.go.jp/address-search/AddressSearch?q=' + address)
            .then(function (response) {
                const lonLat = response.data[0].geometry.coordinates
                map.getView().setCenter(transform(lonLat, "EPSG:4326", "EPSG:3857"));
                map.getView().setZoom(14)
                marker1.setPosition(transform(lonLat, "EPSG:4326", "EPSG:3857"));
                marker2.setPosition(transform(lonLat, "EPSG:4326", "EPSG:3857"));
            //     marker3.setPosition(transform(lonLat, "EPSG:4326", "EPSG:3857"));
            //     marker4.setPosition(transform(lonLat, "EPSG:4326", "EPSG:3857"));
            })
            .catch(function (error) {
            })
            .finally(function () {
            });
    }
}
export function ChangeFilter (item, layerList,name,presetName){
    if(presetName==='') {
        const layer = layerList.find((el) => el.id === item.id).layer;
        layer.removeFilter()
    } else {
        const layer = layerList.find((el) => el.id === item.id).layer;
        // const map = store.state.base.maps[name];
        // const layers = map.getLayers().getArray();
        console.log(presetName)
        const filter = new Colorize();
        layer.removeFilter()
        layer.addFilter(filter);
        filter.setFilter(presetName)
    }
}




