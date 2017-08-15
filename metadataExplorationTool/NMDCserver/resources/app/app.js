/* Copyright (c) 2016 Norwegian Marine Data Centre

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

(function () {
    'use strict';
    angular.module('nmdcApp', ['ngRoute', 'ngResource', 'ngAnimate', 'ngSanitize', 'ngTouch', 'ui.bootstrap', 'ui.bootstrap-slider', 'toaster', 'nmdcApp.map'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/', {templateUrl: 'static/app/map.html'});
            $routeProvider.otherwise({redirectTo: '/'});
        }])
        .factory('appState', ['$window', '$routeParams', 'utils', 'geoLocation', appState])
        .factory('dataService', ['$http', 'toaster', 'utils', 'appState', dataService])
        .factory('utils', ['$filter', '$location', utils])
        .factory('geoLocation', [geoLocation])
        .filter('titleCase', titleCase)
        .filter('urlFile', urlFile)
        .filter('citationYear', ['utils', citationYear]);

    function appState($window, $routeParams, utils, geoLocation) {
        var service = {
            init: function () {
                this.center = geoLocation.center || {lat: 60.39, lng: 5.32}; //default Bergen
                var storedValues = $window.localStorage['nmdcApp'];
                if (storedValues) {
                    try {
                        var jsonObj = angular.fromJson(storedValues);
                        this.areaInsideFraction = (!isNaN(jsonObj.areaInsideFraction) ? parseFloat(jsonObj.areaInsideFraction) : 1.0);
                        this.timeScope.from = jsonObj.from;
                        this.timeScope.to = jsonObj.to;
                        this.zoom = jsonObj.zoom || 6;
                    }
                    catch (err) {
                    }
                }
                service.setRouteParams();
            },
            setRouteParams: function () {
                //console.log(angular.toJson($routeParams));
                // routeParams overrides localStorage values
                try {
                    if ($routeParams.from) {
                        this.timeScope.from = utils.getFormattedDateValue($routeParams.from);
                    }
                    if ($routeParams.to) {
                        this.timeScope.to = utils.getFormattedDateValue($routeParams.to);
                    }
                    if ($routeParams.zoom && !isNaN($routeParams.zoom)) {
                        this.zoom = parseInt($routeParams.zoom);
                    }
                    if ($routeParams.center) {
                        this.center = utils.parseCenter($routeParams.center, this.center);
                    }
                    if ($routeParams.areaInsideFraction && !isNaN($routeParams.areaInsideFraction)) {
                        this.areaInsideFraction = parseFloat($routeParams.areaInsideFraction);
                    }
                }
                catch (err) {
                }
            },
            store: function () {
                var storeValue = angular.toJson({
                    areaInsideFraction: this.areaInsideFraction,
                    from: this.timeScope.from,
                    to: this.timeScope.to,
                    zoom: this.zoom
                });
                $window.localStorage['nmdcApp'] = storeValue;
                //console.log(storeValue);
            },
            zoom: 6,
            portals: [],
            featureMap: {},
            content: {features: []},
            related: {features: []},
            completeList: [],
            selectedList: [],
            wmsList: [],
            bbox: null,
            areaInsideFraction: 1.0,
            timeScope: {from: '', to: ''},
            dateFormat: 'yyyy-MM-dd'
        };
        service.init();
        return service;
    }

    function dataService($http, toaster, utils, appState) {

        function updateFeatureMap(data, selectable) {
            var features = data.features;
            for (var i = 0; i < features.length; ++i) {
                var feature = features[i];
                feature.selectable = selectable;
                feature.geoInfo = utils.getGeoInfo(feature);
                appState.featureMap[feature.id] = feature;
            }
        }

        function getDataQueryPart(format) {
            var to = utils.getFormattedDateValue(appState.timeScope.to, format);
            var from = utils.getFormattedDateValue(appState.timeScope.from, format);
            return '?bbox=' + appState.bbox + "&from=" + from + "&to=" + to + "&fraction=" + appState.areaInsideFraction.toFixed(1);
        }

        function errorFn(data, status, headers, config) {
            toaster.pop({
                type: 'error',
                title: "Sorry",
                body: (data.error ? data.error : data),
                bodyOutputType: 'trustedHtml'
            });
            console.log(status, data);
        }

        var service = {
            queryDateFormat: 'yyyyMMdd',
            lastQuery: '',
            getDataOnQueryChange: function () {
                var newQuery = getDataQueryPart(service.queryDateFormat);
                if (newQuery != service.lastQuery) {
                    service.getData(true);
                }
            },
            getData: function (store) {
                service.lastQuery = getDataQueryPart(service.queryDateFormat);
                $http.get('getDataInside' + service.lastQuery)
                    .then(function (response) {
                        updateFeatureMap(response.data, true);
                        appState.content = response.data;
                        appState.completeList = appState.content.features.concat(appState.related.features);
                        if (store) appState.store();
                    }, errorFn);
                $http.get('getDataRelated' + service.lastQuery)
                    .then(function (response) {
                        updateFeatureMap(response.data, false);
                        appState.related = response.data;
                        appState.completeList = appState.content.features.concat(appState.related.features);
                    }, errorFn);
            },
            getDetails: function (id, attributes, callback) {
                $http.get('getDetails?ID=' + id + (attributes ? "&ATTRIBUTES=" + attributes : ""))
                    .then(function (response) {
                        callback(response.data);
                    }, errorFn);
            },

            getWmsParameters: function (urls, callback) {
                $http.get('getWmsParameters?URL=' + urls.map(encodeURIComponent).join("&URL="))
                    .then(function (response) {
                        callback(response.data);
                    }, errorFn);
            }
        };
        return service;
    }

    function utils($filter, $location) {
        var host = getHost();
        var validCrsList = {
            'EPSG:3857': L.CRS.EPSG3857,
            'EPSG:4326': L.CRS.EPSG4326,
            'EPSG:900913': L.CRS.EPSG900913,
            'EPSG:3395': L.CRS.EPSG3395,
            '': L.CRS.EPSG3857 // if no info, we take our chance with the standard projection
        };
        var validProjections = '';
        for (var crs in validCrsList) {
            if (crs !== '') {
                if (validProjections.length > 0) {
                    validProjections += ', ';
                }
                validProjections += crs;
            }
        }

        var service = {
            host: host,
            validProjections: validProjections,
            bboxArea: getArea,
            isValidDate: function (d) {
                if (!angular.isDate(d))
                    return false;
                return !isNaN(d.getTime());
            },
            getFormattedDateValue: function (val, format) {
                var dateFormat = format || "yyyy-MM-dd";
                try {
                    if (!val) return '';
                    var date = angular.isString(val) ? new Date(Date.parse(val)) : val;
                    if (service.isValidDate(date)) {
                        return $filter('date')(date, dateFormat);
                    }
                    return '';
                }
                catch (err) {
                    return '';
                }
            },
            getGeoInfo: function (feature) {
                return getGeoInfo(feature.geometry);
            },
            parseCenter: function (str, defaultValue) {
                if (!str) return defaultValue;
                try {
                    var parts = str.split(',');
                    if (!parts.length || parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
                        return defaultValue;
                    }
                    return {lat: parts[1], lng: parts[0]}
                }
                catch (err) {
                    return defaultValue;
                }
            },
            getFeatureDetailViewModel: function (data) {
                var dataItem = data['meta']['nmdc-metadata']['DIF'];
                var meta = data['meta'];
                var title = dataItem["Entry_Title"];
                return {
                    title: title,
                    landingPage: data['landingpage'],
                    meta: meta,
                    details: dataItem,
                    wms: getWmsUrlOrNull(dataItem, "Related_URL")
                }
            },
            getMailBody: function (data) {
                return getMailBody(getDetailModel(data));
            },
            getValidCrs: function(crsList) {
                if (!crsList || crsList.length === 0) return null;
                for (var crs in validCrsList) {
                    if (crsList.indexOf(crs) > -1) {
                        return validCrsList[crs];
                    }
                }
                return null;
            }
        };
        return service;

        function getHost() {
            var host = $location.protocol() + "://" + $location.host();
            var port = $location.port();
            if (port != 80) {
                host += ":" + port;
            }
            return host;
        }

        function getGeoInfo(geometry) {
            var geoInfo = [];
            switch (geometry.type) {
                case 'Point':
                    geoInfo.push({
                        area: 0,
                        popupPoints: [{lat: geometry.coordinates[1], lng: geometry.coordinates[0]}]
                    });
                    break;
                case 'MultiPoint':
                    geometry.coordinates.forEach(function (coords) {
                        geoInfo.push({area: 0, popupPoints: [{lat: coords[1], lng: coords[0]}]});
                    });
                    break;
                case 'Polygon':
                    geoInfo.push(getBoundsInfo(geometry.coordinates[0]));
                    break;
                case 'GeometryCollection':
                    geometry.geometries.forEach(function (geo) {
                        geoInfo = geoInfo.concat(getGeoInfo(geo));
                    });
                    break;
            }
            return geoInfo;
        }

        function getBoundsInfo(coordinates) {
            var minX = 180, maxX = -180, minY = 90, maxY = -90;
            coordinates.forEach(function (xy) {
                minX = Math.min(minX, xy[0]);
                maxX = Math.max(maxX, xy[0]);
                minY = Math.min(minY, xy[1]);
                maxY = Math.max(maxY, xy[1]);
            });
            var points = [];
            var yDiff = (maxY - minY);
            var xDiff = (maxX - minX);
            points.push({lat: minY + (yDiff) / 2, lng: minX + xDiff / 2});
            points.push({lat: minY + (yDiff) / 4, lng: minX + xDiff / 2});
            points.push({lat: maxY - (yDiff) / 4, lng: minX + xDiff / 2});

            points.push({lat: minY + (yDiff) / 2, lng: minX + xDiff / 2});
            points.push({lat: minY + (yDiff) / 2, lng: minX + xDiff / 4});
            points.push({lat: minY + (yDiff) / 2, lng: maxX - xDiff / 4});
            var bbox = [minX, minY, maxX, maxY];
            return {bbox: bbox, area: getArea(bbox), popupPoints: points};
        }

        function getArea(bbox) {
            if (!bbox) return 0;
            return (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]);
        }

        function getDetailModel(data) {
            var result = angular.copy(data);
            for (var key in result) {
                if (result.hasOwnProperty(key)) {
                    var tmp = result[key];
                    try {
                        tmp = decodeURIComponent(result[key]);
                    }
                    catch (err) {
                        console.log(err);
                    }
                    result[key] = getValueArray(key, tmp);
                }
            }
            result = combineAttributes(result, ["PersonLastName", "PersonFirstName"], "Person Name", ", ");
            //console.log(angular.toJson(result, true));
            return result;
        }

        function combineAttributes(result, attributes, key, separator) {
            if (!result[attributes[0]]) return result;
            var size = result[attributes[0]].length;
            var textStr = [];
            var newValue = [];
            var i, index;
            for (index = 0; index < size; index++) {
                var str = "";
                for (i = 0; i < attributes.length; i++) {
                    var attributeValue = result[attributes[i]];
                    if (attributeValue && attributeValue.length > index) {
                        str += (i > 0 ? separator : "") + attributeValue[index].text;
                    }
                }
                if (textStr.indexOf(str) == -1) {
                    textStr.push(str);
                    newValue.push(handleValueItem(key, str));
                }
            }
            result[key] = newValue;

            for (i = 0; i < attributes.length; i++) {
                //console.log(attributes[i], result[attributes[i]]);
                delete result[attributes[i]];
            }
            //console.log(key, angular.toJson(result[key]));
            return result;
        }

        function getValueArray(key, value) {
            value = value.replace(/\s*>\s*/g, " > ");
            if (value && value.charAt(0) === "[" && value.charAt(value.length - 1) === "]") {
                value = value.substring(1, value.length - 1);
                if (value.indexOf("://") > -1) {
                    // an url may contain comma to separate parameter values
                    value = splitAndReduceUrls(key, value);
                }
                else {
                    value = value.trim().split(/\s*,\s*/).map(function (item) {
                        return handleValueItem(key, item)
                    });
                }
            }
            else {
                value = [handleValueItem(key, value)];
            }
            return value;
        }

        function splitUrls(value) {
            if (value === undefined || value === null) return [];
            var arr = [];
            var decodedValue = decodeURIComponent(value).replace(/[\[\]']+/g, ''); // decode and remove brackets
            var parts = decodedValue.split("://");
            if (parts.length < 2) return [value];

            var protocol = parts[0];
            for (var i = 1; i < parts.length; i++) {
                var end = i < parts.length - 1 ? parts[i].lastIndexOf(",") : parts[i].length;
                var urlPart = parts[i].substring(0, end);
                var valueItem = protocol + "://" + urlPart;
                if (arr.indexOf(valueItem) == -1) {
                    arr.push(valueItem);
                }
                if (end < parts[i].length) {
                    protocol = parts[i].substring(end + 1).trim();
                }
            }
            return arr;
        }

        function splitAndReduceUrls(key, value) {
            var arr = [];
            var parts = value.split("://");
            if (parts.length < 2) return [value];

            var protocol = parts[0];
            for (var i = 1; i < parts.length; i++) {
                var end = i < parts.length - 1 ? parts[i].lastIndexOf(",") : parts[i].length;
                var urlPart = parts[i].substring(0, end);
                var valueItem = handleValueItem(key, protocol + "://" + urlPart);
                if (arr.indexOf(valueItem) == -1) {
                    arr.push(valueItem);
                }
                if (end < parts[i].length) {
                    protocol = parts[i].substring(end + 1).trim();
                }
            }
            //console.log(angular.toJson(arr, true));
            return arr;
        }

        function handleValueItem(key, value) {
            if (key.toLowerCase() === "data_url" && value.indexOf("://") > -1) {
                value = {url: value, text: getLinkText(value), type: 'url'}
            }
            else if (key.toLowerCase() === "scientific_keyword" && value.indexOf(">") > -1) {
                var tmp = value.split(">");
                value = {fullText: value, text: tmp[tmp.length - 1].trim(), type: 'expand'};
            }
            else value = {text: value, type: "text"};
            return value;
        }

        function getLinkText(value) {
            var text = value;
            var protocol = "";
            try {
                var parts = value.split("://");
                if (parts.length > 1) {
                    protocol = parts[0].toLowerCase();
                    var idx = 0;
                    if (protocol == "ftp") {
                        idx = parts[1].lastIndexOf(".");
                        text = idx > -1 ? parts[1].substring(idx + 1) : "";
                    }
                    else if (protocol == "http") {
                        idx = parts[1].indexOf("/");
                        text = idx > -1 ? parts[1].substring(0, idx) : parts[1];
                    }
                    else {
                        text = "";
                    }
                    text = protocol + " " + text;
                }
            }
            catch (err) {
            }
            return text;
        }

        function getMailTo(title, data) {
            var body = getMailBody(data);
            return encodeURI("mailTo:?subject=" + title + "&body=") + encodeURIComponent(body);
        }

        function getMailLines(data, property) {
            if (!data[property]) return "";
            var str = "";
            for (var i = 0; i < data[property].length; i++) {
                str += (data[property][i].url ? data[property][i].url : data[property][i].text) + "\n";
            }
            return str;
        }

        function getMailBody(data) {
            var body = "Download page for data set '" + getMailLines(data, "Entry_Title") + "'\n";
            body += "http://localhost:8008/getDownloadPage?ID=" + getMailLines(data, 'Entry_ID');
            return body;
        }

        function getWmsUrlOrNull(data, urlKey) {
            var value = getUrls(data[urlKey]);
            var reduced = value.filter(function (e) {
                return e.toLowerCase && e.toLowerCase().indexOf("wms") > -1;
            });
            if (reduced.length === 0) {
                return null;
            }
            else {
                return reduced;
            }
        }
    }

    function getUrls(relatedUrls) {
        if (!relatedUrls) return [];
        var arr = [];
        relatedUrls.forEach(function(item) {
            if (item['URL'] && arr.indexOf(item['URL']) === -1) {
                arr.push(item['URL']);
            }
        });
        return arr;
    }

    function geoLocation() {
        var service = {
            center: null,
            getLocation: function () {
                var that = this;
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (location) {
                        //console.log("geo response: " + location);
                        if (location && location.coords && location.coords.latitude && location.coords.longitude) {
                            that.center = {lat: location.coords.latitude, lng: location.coords.longitude};
                        }
                    }, function () {
                        console.log("geolocation declined");
                    });
                }
            }
        };
        service.getLocation();
        return service;
    }

    function titleCase() {
        return function (str) {
            str = str.replace(/_/g, " ");
            return str.replace(/(?:^|\s)\w/g, function (match) {
                return match.toUpperCase();
            });
        }
    }

    function urlFile() {
        return function(input){
            if(!angular.isString(input) || input === '') return '';
            var items = input.split('/');

            var result = '';
            var protocolEndIdx = items[0].lastIndexOf(':');
            if (protocolEndIdx > -1) {
                result += items[0].substr(0, protocolEndIdx) + '://...';
            }
            result += items[items.length-1];
            return result;
        }
    }

    function citationYear(utils) {
        return function(input){
            if(!angular.isString(input) || input === '') return '';
            var dateStr = input.replace(/T(\d\d):(\d\d):(\d\d):/, 'T$1:$2:$3.');
            return '(' + utils.getFormattedDateValue(dateStr, 'yyyy') + ')';
        }
    }
})();
