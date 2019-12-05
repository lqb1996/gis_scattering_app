require(["esri/map", "esri/InfoTemplate", "esri/layers/FeatureLayer",
    "esri/dijit/HistogramTimeSlider", "dojo/parser", "dojo/dom-construct",
    "dijit/layout/BorderContainer", "dijit/layout/ContentPane",
    "dojo/domReady!"],
    function (Map, InfoTemplate, FeatureLayer, HistogramTimeSlider,
        parser, domConstruct) {
        parser.parse();

        var map = new Map("mapDiv", {
            basemap: "gray",
            center: [0, 0],
            zoom: 3
        });

        // featureCollecttionObject是由featureSet和layerDefinition构成
        // FeatureLayer中的featureSet
        var dz = {
            //数据的基本属性
            "displayFieldName": "",
            "fieldAliases": {
                "FID": "FID",
                "UserID": "UserID",
                "NAME": "NAME",
                "TYPE_USER": "TYPE_USER",
                "CODE": "CODE",
                "ADDRESS": "ADDRESS",
                "TELEPHONE": "TELEPHONE"
            },
            "geometryType": "esriGeometryPoint",
            "spatialReference": {
                "wkid": 4490,
                "latestWkid": 4490
            },
            //所含有的字段信息
            "fields": [
                {
                    "name": "FID",
                    "type": "esriFieldTypeOID",
                    "alias": "FID"
                },
                {
                    "name": "UserID",
                    "type": "esriFieldTypeInteger",
                    "alias": "UserID"
                },
                {
                    "name": "NAME",
                    "type": "esriFieldTypeString",
                    "alias": "NAME",
                    "length": 100
                },
                {
                    "name": "TYPE_USER",
                    "type": "esriFieldTypeString",
                    "alias": "TYPE_USER",
                    "length": 10
                },
                {
                    "name": "CODE",
                    "type": "esriFieldTypeString",
                    "alias": "CODE",
                    "length": 20
                },
                {
                    "name": "ADDRESS",
                    "type": "esriFieldTypeString",
                    "alias": "ADDRESS",
                    "length": 100
                },
                {
                    "name": "TELEPHONE",
                    "type": "esriFieldTypeString",
                    "alias": "TELEPHONE",
                    "length": 60
                }
            ],
            //所含有的集合要素集
            "features": [
                {
                    "attributes": {
                        "FID": 0,
                        "UserID": 0,
                        "NAME": "湖滨商业街２６２号写字楼",
                        "TYPE_USER": "120201",
                        "CODE": "320211",
                        "ADDRESS": "湖滨街２６２",
                        "TELEPHONE": " "
                    },
                    "geometry": {
                        "x": 120.277378,
                        "y": 31.534747999999997
                    }
                },
                {
                    "attributes": {
                        "FID": 1,
                        "UserID": 0,
                        "NAME": "东方银座（西南门）",
                        "TYPE_USER": "120201",
                        "CODE": "320211",
                        "ADDRESS": "新区长江路旁",
                        "TELEPHONE": " "
                    },
                    "geometry": {
                        "x": 120.359826,
                        "y": 31.540464
                    }
                },
                {
                    "attributes": {
                        "FID": 2,
                        "UserID": 0,
                        "NAME": "东方银座",
                        "TYPE_USER": "120201",
                        "CODE": "320211",
                        "ADDRESS": "新区长江路旁",
                        "TELEPHONE": " "
                    },
                    "geometry": {
                        "x": 120.36029500000001,
                        "y": 31.540967
                    }
                }]}

        var layerDefinition = {
            "geometryType": "esriGeometryPoint",
            "fields":[
                {
                    "name": "FID",
                    "type": "esriFieldTypeOID",
                    "alias": "FID"
                },
                {
                    "name": "UserID",
                    "type": "esriFieldTypeInteger",
                    "alias": "UserID"
                },
                {
                    "name": "NAME",
                    "type": "esriFieldTypeString",
                    "alias": "NAME",
                    "length": 100
                },
                {
                    "name": "TYPE_USER",
                    "type": "esriFieldTypeString",
                    "alias": "TYPE_USER",
                    "length": 10
                },
                {
                    "name": "CODE",
                    "type": "esriFieldTypeString",
                    "alias": "CODE",
                    "length": 20
                },
                {
                    "name": "ADDRESS",
                    "type": "esriFieldTypeString",
                    "alias": "ADDRESS",
                    "length": 100
                },
                {
                    "name": "TELEPHONE",
                    "type": "esriFieldTypeString",
                    "alias": "TELEPHONE",
                    "length": 60
                }
            ]
        };

        var featureSet = new esri.tasks.FeatureSet(dz);
        var featureCollection = {
            layerDefinition: layerDefinition,
            featureSet: featureSet
        };
        var layer = new FeatureLayer(featureCollection, {
            id: "cicadas",
            infoTemplate: new InfoTemplate(
                "CVN-76",
                // "<strong>${date}</strong><br><hr><em>${tweet}<em>"
                "<strong>里根号</strong><br><hr><em>xxxx<em>"
            ),
            mode: FeatureLayer.MODE_SNAPSHOT,
            outFields: ["*"]
        });
        // var featuresUrl = "http://services.arcgis.com/nzS0F0zdNLvs7nc8/arcgis/rest/services/cicadas/FeatureServer/0";
        // var featuresUrl = "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer";
        // var myTiledMapServiceLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer");

        // var layer = new FeatureLayer(featuresUrl, {
        //     id: "cicadas",
        //     infoTemplate: new InfoTemplate(
        //       "蝉",
        //       "<strong>${date}</strong><br><hr><em>${tweet}<em>"
        //     ),
        //     mode: FeatureLayer.MODE_SNAPSHOT,
        //     outFields: ["*"]
        // });

        var layerUpdateEnd = layer.on("update-end", initDijit);
        map.addLayer(layer);

        function initDijit() {
            layerUpdateEnd.remove();

            var sliderElem = domConstruct.create("div", {
                id: "timeSlider_" + map.id,
                style: "margin-bottom:10px; bottom:33px"
            }, "bottomDiv");

            // 时间滑块的参数
            var sliderParams = {
                dateFormat: "DateFormat(selector: 'date', fullYear: true)",
                layers: [layer],
                mode: "show_all",
                timeInterval: "esriTimeUnitsHours"
            };
            var slider = new HistogramTimeSlider(sliderParams, sliderElem);
            map.setTimeSlider(slider);
        }
});