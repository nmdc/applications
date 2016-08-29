/* Copyright (c) 2016, Christian Michelsen Research AS
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright
 notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution.
 * Neither the name of the Christian Michelsen Research AS nor the
 names of its contributors may be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 DISCLAIMED. IN NO EVENT SHALL Christian Michelsen Research AS BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

(function () {
    'use strict';

    angular.module('nmdcApp.map', [])
        .controller('MapController', ['$rootScope', '$scope', '$modal', 'toaster', 'utils', 'appState', 'dataService', MapController])
        .controller('DetailModalInstanceCtrl', DetailModalInstanceController)
        .controller('SettingsModalInstanceCtrl', ['$scope', '$modalInstance', 'appState', SettingsModalInstanceCtrl])
        .directive('nmdcMap', ['$window', '$rootScope', '$compile', 'layerStyle', mapDirective])
        .directive('nmdcDetailList', ['$window', '$timeout', 'utils', detailList])
        .directive('nmdcFeatureList', ['$rootScope', '$timeout', featureList])
        .directive('nmdcWmsList', ['$rootScope', wmsList])
        .directive('nmdcDatePicker', ['$filter', '$window', datePicker])
        .factory('layerStyle', [layerStyle]);

    function MapController($rootScope, $scope, $modal, toaster, utils, appState, dataService) {
        var ctrl = this;
        $scope.ctrl = ctrl;
        ctrl.appState = appState;
        ctrl.sidebar = {visible: false};
        ctrl.list = ctrl.appState.completeList;
        ctrl.tabs = [
            // { title:'Content', list: ctrl.appState.content.features, id: 'content', icon: 'fa fa-lg fa-square'},
            {
                title: 'Content inside',
                list: ctrl.appState.content.features,
                id: 'content',
                icon: 'fa fa-lg content-tab-icon'
            },
            // { title:'Content', list: ctrl.appState.content.features, id: 'content', icon: 'fa fa-lg content-icon list-icon'},
            // { title:'Related', list: ctrl.appState.related.features, id: 'related', icon: 'fa fa-lg related-icon list-icon'},
            // { title:'Related', list: ctrl.appState.related.features, id: 'related', icon: 'fa fa-lg fa-square-o'},
            {
                title: 'Related content',
                list: ctrl.appState.related.features,
                id: 'related',
                icon: 'fa fa-lg related-tab-icon'
            },
            {
                title: 'Selected items',
                list: ctrl.appState.selectedList,
                disabled: true,
                id: 'selection',
                icon: 'fa fa-lg fa-shopping-cart'
            },
            {title: 'WMS items', list: ctrl.appState.wmsList, disabled: true, id: 'wms', icon: 'fa fa-lg  fa-map'}
        ];
        ctrl.tabMap = getIdMap(ctrl.tabs);
        ctrl.addToSelectedList = addToSelectedList;
        ctrl.setLists = setLists;
        ctrl.maybeAddWms = maybeAddWms;
        ctrl.deleteSelectedItem = deleteSelectedItem;
        ctrl.zoomToSelection = zoomToSelection;
        ctrl.setSidebarMode = setSidebarMode;
        ctrl.showDetails = showDetails;
        ctrl.mailTo = mailTo;

        $rootScope.$on('$routeChangeSuccess', appState.setRouteParams());
        $rootScope.$on('wms-item-selected', function (e, wmsItem) {
            setCurrentWms(wmsItem);
            $scope.$emit('feature-selected', {featureId: wmsItem.featureId});
        });
        $scope.$on('overlay-change', function (event, layerState) {
            if (ctrl.appState.selectedWms) {
                ctrl.appState.selectedWms.state = ctrl.appState.selectedWms.state || {};
                ctrl.appState.selectedWms.state[layerState.name] = layerState;
            }
        });
        $scope.$on("$routeChangeStart", function () {
            ctrl.sidebar.visible = false;
        });
        $scope.$watch('ctrl.appState.completeList', function (newValue) {
            if (newValue) {
                setLists();
                // $scope.$emit("list-changed", {featureId: ctrl.appState.selectedFeature ? ctrl.appState.selectedFeature.id : null});
            }
        });
        $scope.$watch('ctrl.appState.timeScope.from', function (newValue) {
            dataService.getDataOnQueryChange(true);
        });
        $scope.$watch('ctrl.appState.timeScope.to', function (newValue) {
            dataService.getDataOnQueryChange(true);
        });

        $scope.formatAreaInside = function (value) {
            var number = parseFloat(value);
            if (isNaN(number)) return "";
            return number.toFixed(1);
        };
        $scope.onSliderStop = function (event, value) {
            dataService.getData(true);
        };

        $scope.$on("map-change", function (event, changeObj) {
            ctrl.appState.bbox = changeObj.bbox;
            ctrl.appState.zoom = changeObj.zoom;
            dataService.getData(true);
        });
        $scope.$on("map-feature-list", function (event, changeObj) {
            $scope.$apply(ctrl.setSidebarMode('list'));
        });
        $scope.$on("map-feature-selected", function (event, changeObj) {
            $scope.$apply(function () {
                ctrl.appState.selectedFeature = ctrl.appState.featureMap[changeObj.featureId];
                ctrl.appState.selectedDataset = ctrl.appState.selectedFeature;
            });
        });
        $scope.$on("feature-selected", function (event, changeObj) {
            ctrl.appState.selectedFeature = ctrl.appState.featureMap[changeObj.featureId];
            ctrl.appState.selectedDataset = changeObj.datasetId ? changeObj : ctrl.appState.selectedFeature;
        });
        $scope.$on("map-feature-details", function (event, changeObj) {
            ctrl.showDetails(changeObj.featureId);
        });
        $scope.$on("map-settings", function (event, changeObj) {
            $scope.$apply(ctrl.setSidebarMode('settings'));
            //openSettingsModal();
        });

        function getIdMap(arr) {
            var map = {};
            for (var i = 0; i < arr.length; i++) {
                map[arr[i].id] = arr[i];
            }
            return map;
        }

        function setLists() {
            ctrl.tabMap.content.list = ctrl.appState.content.features;
            ctrl.tabMap.related.list = ctrl.appState.related.features;
        }

        function addToSelectedList() {
            if (!ctrl.appState.selectedFeature) return;
            var feature = ctrl.appState.selectedFeature;
            if (ctrl.sidebar.mode === 'details' && ctrl.detailFeature && ctrl.detailFeature.mode == 'itemDetails') {
                var dataset = ctrl.detailFeature.data.datasetDetails[ctrl.detailFeature.selectedIndex];
                feature = {
                    id: feature.id,
                    datasetId: dataset.Entry_ID,
                    data: dataset,
                    properties: {description: dataset.Entry_Title}
                };
            }
            var found = false;
            ctrl.appState.selectedList.forEach(function (item) {
                if (item.id === feature.id) {
                    if (item.datasetId === feature.datasetId) {
                        found = true;
                    }
                }
            });
            if (!found) {
                ctrl.appState.selectedList.push(feature);
            }
        }

        function deleteSelectedItem() {
            if (!ctrl.appState.selectedDataset) return;
            for (var i = 0; i < ctrl.appState.selectedList.length; i++) {
                if (ctrl.appState.selectedList[i].id === ctrl.appState.selectedDataset.id
                    && ctrl.appState.selectedList[i].datasetId === ctrl.appState.selectedDataset.datasetId) {
                    ctrl.appState.selectedList.splice(i, 1);
                }
            }
            ctrl.appState.selectedDataset = null;
        }

        function zoomToSelection() {
            $rootScope.$emit("zoom-to-selection", {featureId: ctrl.appState.selectedFeature.id});
        }

        function setSidebarMode(mode) {
            ctrl.sidebar.visible = true;
            ctrl.sidebar.mode = mode;
        }

        function showDetails(featureId) {
            ctrl.setSidebarMode('details');
            dataService.getDetails(featureId, null, function (data) {
                ctrl.detailFeature = {
                    featureId: featureId,
                    data: data,
                    selectedIndex: 0,
                    title: ctrl.appState.featureMap[featureId].properties.description,
                    viewModel: utils.getFeatureDetailViewModel(data.datasetDetails[0])
                };
                //openDetailsModal(changeObj, data);
            });
        }

        function mailTo(mode) {
            var ids;
            if (mode === 'list') {
                ids = getIds(ctrl.appState.selectedList);
            }
            else {
                ids = ctrl.appState.selectedFeature.id;
            }
            var body = utils.host + "/getDownloadPage?ID=" + ids;
            window.location.href = encodeURI("mailTo:?subject=NMDC data selection download links&body=") + encodeURIComponent(body);
        }

        function maybeAddWms() {
            if (ctrl.detailFeature.viewModel.wms) {
                dataService.getWmsParameters(ctrl.detailFeature.viewModel.wms, function (data) {
                    if (data && data.wmsParams && data.wmsParams.length > 0) {
                        var wmsItems = addToWmsList(data, ctrl.detailFeature);
                        setCurrentWms(wmsItems[0]);
                    }
                    else {
                        console.log("No wmsParams", data.error);
                    }
                });
            }
        }

        function setCurrentWms(item) {
            ctrl.appState.selectedWms = item;
            if (item && item.data) {
                $rootScope.$emit("maybe-add-wms-layer", {wmsParameters: item.data, state: item.state});
            }
        }

        function addToWmsList(data, detailFeature) {
            if (!data || !data.wmsParams || data.wmsParams.length == 0) return;
            var urlMap = getWmsUrlMap(data);
            var wmsArr = [];
            for (var key in urlMap) {
                var wmsParams = urlMap[key];
                if (wmsParams.error) {
                    toaster.pop('error', "Sorry", wmsParams.error);
                }
                else {
                    var desc = wmsParams.url;
                    var id = desc.replace(/http:\/\//g, "");

                    var datasetId = detailFeature.data.datasetDetails[detailFeature.selectedIndex]["Entry_ID"];
                    var wms = {
                        id: id,
                        description: desc,
                        data: data,
                        featureId: detailFeature.featureId,
                        datasetId: datasetId
                    };
                    var existingWms = null;
                    ctrl.appState.wmsList.forEach(function (item) {
                        if (item.id === wms.id) {
                            existingWms = item;
                        }
                    });
                    if (existingWms == null) {
                        ctrl.appState.wmsList.push(wms);
                        wmsArr.push(wms);
                        toaster.pop('success', "Added to wms list", desc);
                    }
                    else {
                        wmsArr.push(existingWms);
                        toaster.pop('success', "Already in wms list", desc);
                    }
                }
            }
            return wmsArr;
        }

        function getWmsUrlMap(data) {
            var result = {};
            for (var i = 0; i < data.wmsParams.length; i++) {
                var key = data.wmsParams[i].url;
                if (!result[key]) {
                    result[key] = data.wmsParams[i];
                }
            }
            return result;
        }

        function getIds(arr) {
            var idArr = [];
            for (var i = 0; i < arr.length; i++) {
                var id = arr[i].datasetId || arr[i].id;
                id = id.split(",");
                for (var j = 0; j < id.length; j++) {
                    if (idArr.indexOf(id[j]) == -1) {
                        idArr.push(id[j]);
                    }
                }
            }
            return idArr.join(",");
        }

        function openSettingsModal() {
            $modal.open({
                templateUrl: 'modal-settings.html',
                controller: 'SettingsModalInstanceCtrl'
            });
        }

        function openDetailsModal(changeObj, data) {
            $modal.open({
                templateUrl: 'modal-feature-details.html',
                controller: 'DetailModalInstanceCtrl',
                resolve: {
                    data: function () {
                        return {
                            feature: {
                                title: ctrl.appState.featureMap[changeObj.featureId].properties.description,
                                details: data
                            }, utils: utils
                        };
                    }
                }
            });
        }
    }

    function SettingsModalInstanceCtrl($scope, $modalInstance, appState) {
        var ctrl = this;
        $scope.ctrl = ctrl;
        ctrl.appState = appState;
        ctrl.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    function DetailModalInstanceController($scope, $modalInstance, data) {
        $scope.utils = data.utils;
        $scope.feature = data.feature;
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }

    function mapDirective($window, $rootScope, $compile, layerStyle) {
        return {
            restrict: 'A',
            scope: {appState: '='},
            link: function (scope, element, attributes) {
                var appState = scope.appState;
                var geoJsonLayer = L.geoJson(null, getGeoJsonOptions()), layerMap = {}, regularMarkersCluster = new L.MarkerClusterGroup({
                    polygonOptions: {
                        color: '#333333',
                        weight: 3,
                        opacity: 0.8,
                        fillOpacity: 0.5,
                        fillColor: '#333333'
                    }, disableClusteringAtZoom: 7
                });
                var convertedMarkersCluster = new L.MarkerClusterGroup({
                        iconCreateFunction: function (cluster) {
                            var markers = cluster.getAllChildMarkers();
                            var marker_html = '<div class="converted-cluster">' + markers.length + '</div>';
                            return L.divIcon({
                                html: marker_html,
                                className: 'converted-cluster',
                                iconSize: L.point(32, 32)
                            });
                        }, maxClusterRadius: 1, zoomToBoundsOnClick: false
                    }),
                    lastSelectedLayer = null, hasPopup = false;
                var startPosition = scope.appState.center;

                convertedMarkersCluster.on('clusterclick', function (a) {
                    // a.layer is actually a cluster
                    a.layer.spiderfy();
                });

                var nmdcIcon = L.icon({
                        iconUrl: '/static/NMDC-logo-notext-nb.png',
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                        popupAnchor: [20, 20]
                    }
                );

                scope.$watch('appState.content', function (newValue) {
                    if (newValue) {
                        data_to_geoJsonLayer(newValue, appState.selectedFeature, hasPopup);
                    }
                });
                $rootScope.$on("feature-selected", function (event, selection) {
                    onFeatureSelected(selection.featureId);
                });
                $rootScope.$on("zoom-to-selection", function (event, selection) {
                    var feature = appState.featureMap[selection.featureId];
                    var latLng = getClosestToMapCenter(feature.geoInfo);
                    setSelectedFeature(layerMap[selection.featureId], feature, true, true, latLng);
                    if ($window.matchMedia && $window.matchMedia("only screen and (max-width : 767px)").matches) {
                        sidebar.hide();
                    }
                });

                $rootScope.$on("maybe-add-wms-layer", function (event, eventObj) {
                    tryAddWMS(eventObj.wmsParameters, eventObj.state);
                });

                $rootScope.$on("show-data-layers", function (event) {
                    showDataLayers();
                });

                var defaultBaseLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                });

                var mapQuestOpen_Aerial = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
                    type: 'sat',
                    ext: 'jpg',
                    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
                    subdomains: '1234'
                });

                var openMapSurfer_Roads = L.tileLayer('http://korona.geog.uni-heidelberg.de/tiles/roads/x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                });

                var kartverketMatrikkelBakgrunn = L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=matrikkel_bakgrunn&zoom={z}&x={x}&y={y}', {
                    maxZoom: 20,
                    attribution: '&copy; <a href="http://kartverket.no">Kartverket</a>'
                });

                var kartverketSjokart2 = L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=sjo_hovedkart2&zoom={z}&x={x}&y={y}', {
                    maxZoom: 20,
                    attribution: '&copy; <a href="http://kartverket.no">Kartverket</a>'
                });

                var bathymetryLayer = L.tileLayer.wms("http://ows.emodnet-bathymetry.eu/wms", {
                    layers: 'emodnet:mean_atlas_land',
                    format: 'image/png',
                    transparent: true,
                    attribution: "EMODnet Bathymetry",
                    opacity: 1
                });
                var coastlinesLayer = L.tileLayer.wms("http://ows.emodnet-bathymetry.eu/wms", {
                    layers: 'coastlines',
                    format: 'image/png',
                    transparent: true,
                    attribution: "EMODnet Bathymetry",
                    opacity: 1
                });

                var addedLayers = [];

                var bathymetryGroupLayer = L.layerGroup([bathymetryLayer, coastlinesLayer]);
                var dataLayerGroup = L.layerGroup([convertedMarkersCluster, regularMarkersCluster, geoJsonLayer]);
                var overlays = {"Data set overlay": dataLayerGroup};

                var crsArray = {
                    'EPSG:3395': L.CRS.EPSG3395,
                    'EPSG:3857': L.CRS.EPSG3857,
                    'EPSG:4326': L.CRS.EPSG4326,
                    'EPSG:900913': L.CRS.EPSG900913,
                    '': L.CRS.EPSG3857 // if no info, we take our chance with the standard projection
                };


                var baseLayers = {
                    "Open Street map": defaultBaseLayer,
                    "Map quest": mapQuestOpen_Aerial,
                    "Open Map Surfer": openMapSurfer_Roads,
                    "Kartverket": kartverketMatrikkelBakgrunn,
                    "Kartverket (Sjøkart)": kartverketSjokart2,
                    "EMODnet Bathymetry": bathymetryGroupLayer
                };

                var map = L.map(element[0], {
                    maxBounds: new L.LatLngBounds([-90, -180], [90, 180]),
                    worldCopyJump: true,
                    minZoom: 1,
                    maxZoom: 12,
                    layers: [defaultBaseLayer, dataLayerGroup]
                }).setView(startPosition, scope.appState.zoom);
                L.control.mousePosition({emptyString: ''}).addTo(map);

                var layerCtrl = L.control.layers(baseLayers, overlays, {position: "bottomleft"});
                layerCtrl.addTo(map);

                // Mini Map
                var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                var osmAttrib = 'Map data &copy; OpenStreetMap contributors';
                var osm2 = new L.TileLayer(osmUrl, {minZoom: 2, maxZoom: 13, attribution: osmAttrib});
                new L.Control.MiniMap(osm2, {autoToggleDisplay: true, zoomLevelFixed: 2}).addTo(map);

                // Sidebar
                var sidebar = L.control.sidebar('id_content_tabs', {
                    closeButton: true,
                    position: 'left',
                    autoPan: false
                });
                map.addControl(sidebar);

                var sidebarOpenControl = L.easyButton('fa-bars', function () {
                        scope.$emit("map-feature-list", {});
                        sidebar.show();
                    }, 'List Sidebar', map
                );

                // Settings Control
                var settingsControl = L.easyButton('fa-cog', function () {
                        scope.$emit("map-settings", {});
                        sidebar.show();
                    }, 'Settings', map
                );

                //bbox history navbar
                var nmdcNavbar = L.control.nmdcNavbar();
                nmdcNavbar.addTo(map);

                map.on('moveend', function (e) {
                    mapChanged();
                });

                map.on('popupclose', function (e) {
                    hasPopup = false;
                });

                map.on('overlayadd', overlayStateChanged);
                map.on('overlayremove', overlayStateChanged);

                mapChanged();

                function overlayStateChanged(e) {
                    scope.$emit("overlay-change", {
                        leafletId: e.layer._leaflet_id,
                        name: e.name,
                        checked: (e.type === 'overlayadd')
                    });
                }

                function mapChanged() {
                    scope.$emit("map-change", {bbox: map.getBounds().toBBoxString(), zoom: map.getZoom()});
                }

                function getGeoJsonOptions() {
                    return {
                        pointToLayer: function (feature, latlng) {
                            return new L.CircleMarker(latlng, {radius: 0, fillOpacity: 0.0});
                        },
                        onEachFeature: function (feature, layer) {
                            layer.on('click', function (e) {
                                var selectedFeature = getSmallestFeature(e.latlng, feature);
                                onFeatureClick(selectedFeature.id, e.latlng);
                            });
                        },
                        filter: function (feature, layer) {
                            return feature.geometry.coordinates.length == 2 ? true : (!shouldBeMarker(feature.geometry.coordinates[0] || feature.properties.converted));
                        },
                        style: function (feature) {
                            if (feature.properties.converted) {
                                return layerStyle.cluster;
                            }
                            else return layerStyle.normal;
                        }
                    }
                }

                function data_to_geoJsonLayer(data, selected, showPopup) {
                    geoJsonLayer.clearLayers();
                    geoJsonLayer.addData(data);
                    layerMap = getFeatureLayerMap(data);

                    addMarkers(data, selected);
                    var len = data.features.length;
                    layerStyle.normal.fillOpacity = 0.8 / (2 + len / 5);

                    if (selected) {
                        var feature = appState.featureMap[selected.id];
                        var latLng;
                        if (showPopup) {
                            latLng = getClosestToMapCenter(feature.geoInfo);
                        }
                        setSelectedFeature(layerMap[selected.id], feature, false, showPopup, latLng);
                    }
                    else {
                        setMapSelection(undefined, false);
                    }
                }

                function getFeatureLayerMap(data) {
                    var map = {};
                    var layers = geoJsonLayer.getLayers();
                    layers.forEach(function (layer) {
                        if (layer.feature) {
                            map[layer.feature.id] = layer;
                        }
                    });
                    return map;
                }

                function shouldBeMarker(coordinates) {
                    var lngMin = Number.MAX_VALUE, lngMax = Number.MIN_VALUE;
                    var lngSum = 0;
                    var latSum = 0;

                    var latMin = Number.MAX_VALUE, latMax = Number.MIN_VALUE;

                    coordinates.forEach(function (xy) {
                        var lng = xy[0];
                        lngSum += lng;
                        var lat = xy[1];
                        latSum += lat;

                        lngMin = Math.min(lng, lngMin);
                        latMin = Math.min(lat, latMin);
                        lngMax = Math.max(lng, lngMax);
                        latMax = Math.max(lat, latMax);
                    });
                    var mapBounds = map.getBounds();
                    return (lngMax - lngMin) < 0.05 * (mapBounds.getEast() - mapBounds.getWest()) &&
                        (latMax - latMin) < 0.05 * (mapBounds.getNorth() - mapBounds.getSouth());
                }

                function calculateMarkerPosition(coordinates) {
                    // use corner furthest from map centre as new position
                    var mapCentre = map.getCenter();
                    var maxDist = -1;
                    var lng = 0;
                    var lat = 0;
                    coordinates.forEach(function (xy) {
                        var currentDist = Math.sqrt(Math.pow(mapCentre.lng - xy[0], 2) + Math.pow(mapCentre.lat - xy[1], 2));
                        if (currentDist > maxDist) {
                            maxDist = currentDist;
                            lng = xy[0];
                            lat = xy[1];
                        }

                    });
                    return L.latLng(lat, lng);
                }

                function addMarkers(data, selected) {
                    if (regularMarkersCluster !== null) {
                        regularMarkersCluster.clearLayers();
                    }
                    if (convertedMarkersCluster !== null) {
                        convertedMarkersCluster.clearLayers();
                    }

                    var regularMarkers = [];
                    var convertedMarkers = [];
                    var features = data.features;
                    for (var j = 0; j < features.length; ++j) {
                        var feature = features[j];
                        var geometries = feature.geometry.type == 'GeometryCollection' ? feature.geometry.geometries : [feature.geometry];
                        for (var k = 0; k < geometries.length; k++) {
                            if (geometries[k].type == 'Point') {
                                if (feature.properties.converted) {
                                    var marker = new L.Marker([geometries[k].coordinates[1], geometries[k].coordinates[0]], {icon: nmdcIcon});
                                    marker.featureId = feature.id;
                                    marker.on('click', function (e) {
                                        var targetFeature = appState.featureMap[e.target.featureId];
                                        if (targetFeature) {
                                            onFeatureClick(targetFeature.id, e.latlng);
                                        }
                                    });
                                    convertedMarkers.push(marker)
                                }
                                else {
                                    var marker = new L.Marker([geometries[k].coordinates[1], geometries[k].coordinates[0]], {icon: nmdcIcon});
                                    marker.featureId = feature.id;
                                    marker.on('click', function (e) {
                                        var targetFeature = appState.featureMap[e.target.featureId];
                                        if (targetFeature) {
                                            onFeatureClick(targetFeature.id, e.latlng);
                                        }
                                    });
                                    regularMarkers.push(marker);
                                }
                                //map.addLayer(marker);
                            }
                            else {
                                if (shouldBeMarker(geometries[k].coordinates[0])) {
                                    var marker = new L.Marker(calculateMarkerPosition(geometries[k].coordinates[0]), {icon: nmdcIcon});
                                    marker.featureId = feature.id;
                                    regularMarkers.push(marker);
                                    marker.on('click', function (e) {
                                        var targetFeature = appState.featureMap[e.target.featureId];
                                        if (targetFeature) {
                                            onFeatureClick(targetFeature.id, e.latlng);
                                        }
                                    });
                                    layerMap[feature.id] = marker;
                                    //map.addLayer(marker);
                                }
                            }
                        }
                        convertedMarkersCluster.addLayers(convertedMarkers);
                        regularMarkersCluster.addLayers(regularMarkers);

                    }
                }

                function setMapSelection(id, zoomToSelected) {
                    for (var layerID in geoJsonLayer._layers) {
                        var layer = geoJsonLayer._layers[layerID];
                        layer.setStyle(id === layer.feature.id ? layerStyle.highlight : layer.feature.properties.converted ? layerStyle.cluster : layerStyle.normal);
                        if (zoomToSelected && id === layer.feature.id) {
                            map.fitBounds(layer.getBounds(), {maxZoom: 8});
                        }
                    }
                }

                function getSmallestFeature(point, feature) {
                    var smallestFeature = null;
                    if (feature.geometry.type != "Point") {
                        var id = getSmallestInside(point, feature);
                        if (id) {
                            smallestFeature = appState.featureMap[id];
                        }
                    }
                    return (smallestFeature || feature);
                }

                function getSmallestInside(latLngPoint, selectedFeature) {
                    var minId = selectedFeature.id;
                    var minArea = Number.MAX_VALUE;
                    var feature;
                    for (var featureId in appState.featureMap) {
                        if (appState.featureMap.hasOwnProperty(featureId)) {
                            feature = appState.featureMap[featureId];
                            var info = pointInside(latLngPoint, feature);
                            if (feature.selectable && info) {
                                //console.log(feature.id, angular.toJson(info));
                                if (info.area < minArea) {
                                    minId = feature.id;
                                    minArea = info.area;
                                }
                            }
                        }
                    }
                    return minId;
                }

                function onFeatureClick(id, latLng) {
                    scope.$emit("map-feature-selected", {featureId: id});
                    setSelectedFeature(layerMap[id], appState.featureMap[id], false, true, latLng);
                }

                function onFeatureSelected(id) {
                    var feature = appState.featureMap[id];
                    var added = addToMapIfMissing(feature);
                    var latLng = getClosestToMapCenter(feature.geoInfo);
                    setSelectedFeature(layerMap[id], feature, added, true, latLng);
                }

                function getClosestToMapCenter(geoInfo) {
                    if (!geoInfo) return null;
                    var c = map.getCenter();
                    var minDist = Number.MAX_VALUE;
                    var selected;
                    try {
                        geoInfo.forEach(function (info) {
                            info.popupPoints.forEach(function (p) {
                                var dist = c.distanceTo(p);
                                if (dist < minDist) {
                                    minDist = dist;
                                    selected = p;
                                }
                            });
                        })
                    }
                    catch (err) {
                        console.log(err);
                    }
                    return selected;
                }

                function addToMapIfMissing(feature) {
                    if (!feature || !geoJsonLayer) return false;
                    var layer = layerMap[feature.id];
                    if (!layer) {
                        geoJsonLayer.addData(feature);
                    }
                    return (!layer);
                }

                function pointInside(latLngPoint, feature) {
                    var found;
                    feature.geoInfo.forEach(function (info) {
                        if (info.bbox) {
                            if (latLngPoint.lng > info.bbox[0] && latLngPoint.lng < info.bbox[2] && latLngPoint.lat > info.bbox[1] && latLngPoint.lat < info.bbox[3]) {
                                found = info;
                                return;
                            }
                        }
                        else {
                            var pixelMouse = map.project(latLngPoint);
                            var pixelFeature = map.project(info.popupPoints[0]);
                            var diffX = Math.abs(pixelFeature.x - pixelMouse.x);
                            var diffY = Math.abs(pixelFeature.y - pixelMouse.y);
                            var close = diffX < 6 && diffY < 6;
                            if (close) {
                                found = info;
                                return;
                            }
                        }
                    });
                    return found;
                }

                function setSelectedFeature(layer, feature, zoomToSelected, showPopup, latLng) {
                    //console.log("setSelectedFeature: " + feature.id + ", " + (latLng ? latLng.lat + "," + latLng.lng : ""), feature.bbox);
                    closePopup(lastSelectedLayer);
                    lastSelectedLayer = layer;
                    setMapSelection(feature.id, zoomToSelected);
                    if (layer && showPopup) {
                        openPopup(layer, feature.id, feature.properties.description, latLng);
                    }
                }

                function getPopupHtml(featureId, title) {
                    return '<div class="nmdc-map-popup">' +
                        '<h4>' + title + '</h4>' +
                            /**/       '<button class="btn btn-primary" type="submit" ng-click="openDetails(' + "'" + featureId + "', '" + featureId + "'" + ')"><i class="fa fa-info fa-fw"></i></button>' +
                            ///**/       '<a href="" ng-click="openDetails(' + "'" + featureId + "'" + ')">Show details</a>' +
                            /**/   '</div>';
                }

                scope.openDetails = function (featureId) {
                    scope.$emit("map-feature-details", {featureId: featureId});
                    closePopup(lastSelectedLayer);
                    sidebar.show();
                };
                function openPopup(layer, featureId, title, latLng) {
                    try {
                        if (!layer) return;
                        var popupHtml = getPopupHtml(featureId, title);
                        var maxWidth = Math.min(map.getSize().x * 0.7, 300);
                        layer.bindPopup($compile(angular.element(popupHtml))(scope)[0], {
                            autoPan: false,
                            maxWidth: maxWidth
                        });
                        layer.openPopup(latLng);
                        hasPopup = true;
                    }
                    catch (err) {
                        console.log(err);
                    }
                }

                function closePopup(layer) {
                    hasPopup = false;
                    if (!layer || !layer.closePopup) return;
                    layer.closePopup();
                    layer.unbindPopup();
                }

                function removeFromMap(control) {
                    try {
                        control.removeFrom(map);
                    }
                    catch (err) {
                    }
                }

                scope.$on('$destroy', function () {
                    try {
                        removeFromMap(sidebar);
                        removeFromMap(nmdcNavbar);
                        map.remove();
                        geoJsonLayer = null;
                    }
                    catch (err) {
                        console.log(err);
                    }
                });

                function showDataLayers() {
                    clearAndRemove(addedLayers);
                    if (!map.hasLayer(dataLayerGroup)) {
                        map.addLayer(dataLayerGroup);
                    }
                }

                function clearAndRemove(layers) {
                    layers.forEach(function (l) {
                        map.removeLayer(l);
                        layerCtrl.removeLayer(l);
                    });

                    layers.length = 0;
                }

                function tryAddWMS(data, state) {
                    clearAndRemove(addedLayers);

                    data.wmsParams.forEach(function (wmslayer) {
                        if (wmslayer.epsg in crsArray) {
                            var l = L.tileLayer.wms(wmslayer.url, {
                                    layers: wmslayer.name,
                                    srs: wmslayer.epsg,
                                    crs: crsArray[wmslayer.epsg],
                                    version: wmslayer.version,
                                    format: wmslayer.format,
                                    transparent: true,
                                    attribution: wmslayer.attribution,
                                    opacity: 0.8,
                                    reuseTiles: true
                                }
                            );
                            addedLayers.push(l);
                        }
                    });

                    addedLayers.forEach(function (l) {
                        layerCtrl.addOverlay(l, l.options.layers);
                        if (state && state[l.options.layers] && state[l.options.layers].checked) {
                            map.addLayer(l);
                        }
                    });
                }
            }
        }
    }

    function datePicker($filter, $window) {
        return {
            restrict: 'E',
            templateUrl: 'datePicker.html',
            scope: {ngModel: '=', format: '@'},
            link: function (scope, element, attributes) {
                var ctrl = {};
                var inputField = element.find("input")[0];
                scope.ctrl = ctrl;
                ctrl.opened = false;
                scope.ngModel = $filter('date')(scope.ngModel, scope.format);

                ctrl.open = function ($event) {
                    $event.preventDefault();
                    $event.stopPropagation();
                    ctrl.opened = true;
                };
                ctrl.clear = function () {
                    scope.ngModel = null;
                };
                ctrl.maybeBlur = function ($event) {
                    if ($window.matchMedia && $window.matchMedia("only screen and (max-width : 767px)").matches) {
                        inputField.blur();
                        ctrl.open($event);
                    }
                }
            }
        }
    }

    function featureList($rootScope, $timeout) {
        return {
            restrict: 'E',
            scope: {list: '=', selected: '='},
            template: '<div class="list-group">' +
            '<a href="" id="{{prefix + feature.id}}" class="list-group-item" ng-repeat="feature in list | orderBy:\'properties.description\'"' +
            ' value="feature.id" ng-class="{selected:feature.id == selected.id && feature.datasetId == selected.datasetId}" ng-click="selectFeature(feature)">{{feature.properties.description}}</a>' +
            '</div>',
            link: function (scope, element, attributes) {
                var timeoutFn;
                scope.prefix = (attributes['id'] || 'featureList') + "_";
                scope.selectFeature = function (feature) {
                    scope.$emit("feature-selected", {
                        featureId: feature.id,
                        id: feature.id,
                        datasetId: feature.datasetId
                    });
                };
                $rootScope.$on("map-feature-selected", function (event, changeObj) {
                    scrollToItem(changeObj.featureId ? changeObj.featureId : changeObj.id);
                });
                scope.$watch("list", function (newValue) {
                    if (!scope.selected) return;
                    if (timeoutFn) $timeout.cancel(timeoutFn);
                    timeoutFn = $timeout(function () {
                        scrollToItem(scope.selected.id)
                    }, 100);
                });

                function scrollToItem(id) {
                    if (!id) return;

                    var el = angular.element('#' + scope.prefix + id);
                    if (el && el[0] && el[0].offsetParent) {
                        el = el[0];
                        var parent = el.offsetParent;
                        var parentBottom = parent.scrollTop + parent.clientHeight;
                        var elemBottom = el.offsetTop + el.clientHeight;

                        var inView = ((elemBottom <= parentBottom) && (el.offsetTop >= parent.scrollTop));
                        if (!inView) {
                            parent.scrollTop = Math.max(el.offsetTop - parent.clientHeight + el.clientHeight * 1.5, 0);
                            //console.log("scrolltop:", parent.scrollTop, " el.offsetTop: ", el.offsetTop, "parent height:", parent.clientHeight , "list size:", scope.list.length);
                        }
                    }
                }
            }
        }
    }

    function wmsList($rootScope) {
        return {
            restrict: 'E',
            scope: {list: '=', selected: '='},
            template: '<div class="list-group">' +
            '<a href="" class="list-group-item wms-list" ng-repeat="item in list | orderBy:\'item.description\'" value="item.id" ng-class="{selected:item.id == selected.id}" ng-click="selectItem(item)">{{item.description}}</a>' +
            '</div>',
            link: function (scope, element, attributes) {
                scope.selectItem = function (item) {
                    scope.$emit("wms-item-selected", item);
                };
            }
        }
    }

    function detailList($window, $timeout, utils) {
        return {
            restrict: "E",
            scope: {feature: '='},
            templateUrl: 'nmdc-detail-list.html',
            link: function (scope, element, attributes) {
                var timeoutFn;
                var parent = element[0].offsetParent;
                var header = angular.element(element).find('h3')[0];
                var margin = (getMargin() || 50) + parent.offsetTop;
                scope.title = '';

                scope.$watch("feature", function (newValue) {
                    if (newValue) {
                        if (newValue.data.datasetDetails && newValue.data.datasetDetails.length > 1) {
                            scope.feature.mode = 'cluster';
                        }
                        else {
                            scope.feature.mode = 'details';
                        }
                    }
                    setHeader();
                });
                scope.selectItem = function (index) {
                    scope.feature.viewModel = utils.getFeatureDetailViewModel(scope.feature.data.datasetDetails[index]);
                    scope.feature.mode = 'itemDetails';
                    scope.feature.selectedIndex = index;
                    setHeader();
                };
                scope.$watch("feature.mode", function () {
                    setHeader();
                });

                angular.element($window).bind('resize', headerChangeTimeout);

                function headerChangeTimeout() {
                    if (timeoutFn) $timeout.cancel(timeoutFn);
                    timeoutFn = $timeout(function () {
                        setHeaderHeight()
                    }, 100);
                }

                function setHeader() {
                    if (!scope.feature) return;
                    scope.title = scope.feature.mode == 'cluster' || !scope.feature.viewModel ? scope.feature.title : scope.feature.viewModel.title;
                    headerChangeTimeout();
                }

                function setHeaderHeight() {
                    scope.detailHeaderHeight = Math.max(header.clientHeight + margin, 25 + margin);
                    //console.log("detailHeaderHeight: " + scope.detailHeaderHeight, " parent.offsetTop: ", parent.offsetTop, "header height:" + header.clientHeight, "margin:" + margin);
                }

                function getMargin() {
                    try {
                        var top = parseInt(angular.element(header).css('margin-top'));
                        var bottom = parseInt(angular.element(header).css('margin-bottom'));
                        return top + bottom;
                    }
                    catch (err) {
                    }
                }
            }
        }
    }

    function layerStyle() {
        return {
            normal: {
                //color: '#7777ff',
                //color:'#2981CA',
                color: '#1F8AA5',
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.05,
                //fillColor: '#7777ee'
                //fillColor: '#2981CA'
                fillColor: '#1F8AA5'
            },
            highlight: {
                color: '#ff7777',
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.4,
                fillColor: '#ee7777'
            },
            cluster: {
                color: '#333333',
                weight: 3,
                opacity: 0.8,
                fillOpacity: 0.05,
                fillColor: '#333333'
            }
        };
    }
})();