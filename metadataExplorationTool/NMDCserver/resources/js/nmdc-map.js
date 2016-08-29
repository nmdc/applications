/* Copyright (c) 2015, Christian Michelsen Research AS
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
(function(aWindow){
    var appState = {
        window: aWindow || window,
        featureMap: {},
        layerMap: {},
        areaInsideFraction: 1.0,
        markers: [],
        viewDetails: viewDetails,
        closePopup: closePopup,
        openDetails: openDetails
    };
    aWindow.nmdcApp = appState;

    var current_view_map = [];  //map[data_id -> body] elements added from current_viewDetails
    var geoJsonLayer;         //COVERAGE map subset     <-  from all_geoJsonCoverageData
    var map;

    var normalStyle = {
        color: '#7777ff',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.05,
        fillColor: '#7777ee'
    };

    var highlightStyle = {
        color: '#ff7777',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.4,
        fillColor: '#ee7777'
    };

    function init() {
        addPageBehaviour();
        initMap();
        initData();
    }

    function addPageBehaviour() {
        $("#id_details").dialog({ autoOpen: false, modal: false, width: 500 });
        $("#id_settings").dialog({ autoOpen: false, modal: true, width: 500 });
        $("#id_content_tabs").tabs({
            active: 0,
            activate: function (event, ui) {
                var listDiv = ui.newPanel[0];
                    var selected = $(".ui-selected", listDiv);
                    if (selected && selected.length > 0) {
                        scrollToItem($(listDiv), selected);
                    }
                }
        });
        $( appState.window ).resize(function() {
            $(".listDiv").height(appState.window.innerHeight - 150);
        });
        $(".listDiv").height(appState.window.innerHeight - 150);
        //see http://www.sitepoint.com/controlling-lists-with-jquery/
        $(".listContent").selectable({
            selected: function (event, ui) {
                onFeatureClick(ui.selected.value);
            }
        });

        $("#add_selection_button").on( "click", function() {
            current_view_list_addSelected();
        });
        $("#clear_selection_button").on( "click", function() {
            current_view_list_clear();
        });
        $("#zoom_to_selected_button").on( "click", function() {
            var selectedId = getSelectedId();
            if (selectedId) {
                setMapSelection(selectedId, true);
            }
        });
        var dateOptions = {
            changeMonth: true,
            changeYear: true,
            yearRange: "c-20:c+20",
            dateFormat: 'yymmdd',
            onSelect: function (dateText) {
                getAndDisplayData();
            }
        };
        var datepickerFrom = $("#datepickerFrom");
        datepickerFrom.datepicker(dateOptions);
        datepickerFrom.on("change", function () {
            getAndDisplayData();
        });
        $("#datepickerFromClear").on("click", function() {
            datepickerFrom.val('');
        });
        var datepickerTo = $("#datepickerTo");
        datepickerTo.datepicker(dateOptions);
        datepickerTo.on("change", function () {
            getAndDisplayData();
        });
        $("#datepickerToClear").on("click", function() {
            datepickerTo.val('');
        });
    }

    function initMap() {
        var startPosition = L.latLng(60.39, 5.32); // Bergen
        map = L.map('id_map', {maxBounds: new L.LatLngBounds([-90, -180], [90, 180]), worldCopyJump: true}).setView(startPosition, 6);
        L.control.mousePosition({emptyString:''}).addTo(map);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

/*
        // cloudmade gives error: Forbidden, wrong apikey
        L.tileLayer('http://{s}.tile.cloudmade.com/BC9A493B41014CAABB98F0471D759707/997/256/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> ' +
                'contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' +
                ', Imagery © <a href="http://cloudmade.com">CloudMade</a>'
        }).addTo(map);
*/

        map.on('moveend', function (e) {
            getAndDisplayData();
        });

        // Mini Map
        var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var osmAttrib='Map data &copy; OpenStreetMap contributors';
        var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib});
        new L.Control.MiniMap(osm2).addTo(map);

        // Area inside control
        var areaSliderControl = L.control.areaInsideSliderControl({position: "topright", callback: function(fraction){
            appState.areaInsideFraction = fraction;
            getAndDisplayData();
        }});
        map.addControl(areaSliderControl);
        areaSliderControl.startSlider();

        // Settings Control
        var settingsControl = L.easyButton('fa-cog', function (){
                $('#id_settings').dialog("open");
            }, 'Settings', map
        );

        // Sidebar
        var sidebar = L.control.sidebar('id_content_tabs', {
            position: 'left',
            autoPan:false
        });
        map.addControl(sidebar);

        var sidebarOpenControl = L.easyButton('fa-bars', function (){
                sidebar.show();
            }, 'List Sidebar', map
        );

        L.control.nmdcNavbar().addTo(map);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(location) {
//                console.log("geo response: " + location);
                if (location && location.coords && location.coords.latitude && location.coords.longitude) {
                    startPosition = L.latLng(location.coords.latitude, location.coords.longitude);
                    map.setView(startPosition, 6);
                }
            }, function() {
                console.log("geolocation declined");
//                map.restoreView();
            });
        }
    }

    function onClick(e) {
        geoJsonLayer.setStyle(normalStyle);
        e.layer.setStyle(highlightStyle);
        var geoJSONFeature = e.layer.feature;
        setListSelection(geoJSONFeature.id);
        viewDetails(geoJSONFeature.id, geoJSONFeature.properties.description);
        /* e.layer.feature is from a single geoJSON feature (array element):

         all_geoJsonCoverageData: Object
         features: Array[21]
         0: Object
         |    geometry: Object
         |        coordinates: Array[1]
         |          0: Array[5]
         |                0: Array[2]
         |                1: Array[2]
         |                2: Array[2]
         |                3: Array[2]
         |                4: Array[2]
         |                length: 5
         |    id: 32
         |    properties: Object
         |    type: "Feature"

         e.layer.feature
         feature: Object               //geoJSONFeature
         |    geometry: Object
         |    id: 32
         |    properties: Object
         |    type: "Feature"
         */
    }

    function setMapSelection(id, zoomToSelected) {
        for (var layerID in geoJsonLayer._layers) {
            var layer = geoJsonLayer._layers[layerID];
            layer.setStyle(id === layer.feature.id ? highlightStyle : normalStyle);
            if (zoomToSelected && id === layer.feature.id){
                map.fitBounds(layer.getBounds(), {maxZoom: 8});
            }
        }
    }

    function addToMapIfMissing(feature) {
        if (!feature) return false;
        var layer = findGeoJsonLayer(feature.id);
        if (!layer) {
            geoJsonLayer.addData(feature);
        }
        return (!layer);
    }

    function findGeoJsonLayer(id) {
        for (var layerId in geoJsonLayer._layers) {
            var layer = geoJsonLayer._layers[layerId];
            if (id === layer.feature.id) return layer;
        }
        return null;
    }

    /* Selection list:
     current_viewDetails
     -> current_view_map
     -> #id_content_select
     */
    function current_view_list_addSelected() {
//    console.log("current_view_list_addSelected: ");
        var jqElem = $('#id_content');
        jqElem.find(".ui-selected").each(function (ix, elem) {
            var data_id = elem.value;
            var body = elem.innerHTML;
//        console.log(" " + body);
            current_view_map[data_id] = body;
        });
        current_view_2html();
    }

    function current_view_list_clear() {
        current_view_map = [];
        current_view_2html();
    }

    function current_view_2html() {
        var line = "";
        var bool_row_even = false;
        for (var key in current_view_map) {
            var value = current_view_map[key];
            bool_row_even = !bool_row_even;
            var listClass = bool_row_even ? "cl_row_even" : "cl_row_odd";
            line += getListItemHtml(listClass, key, value);
        }
        var jqElem = $('#id_content_select');
        jqElem.empty();
        jqElem.append(line);
    }

    function closePopup(layer) {
        if (!layer || !layer.closePopup) return;
        layer.closePopup();
        layer.unbindPopup();
    }

    function openPopup (layer, featureId, title) {
        if (!layer) return;
        var popupHtml = getPopupHtml(featureId, title);
        layer.bindPopup(popupHtml);
        layer.openPopup();
    }

    function viewDetails(data_id, title) {
        var requestString = 'getData?Request=DETAIL&Format=JSON&ID=' + data_id;
        $.getJSON(requestString,function (data) {
//        console.log("viewDetails(): " + data);
            var detailsDiv = $('#id_details');
            detailsDiv.html(jsonToTable(data, title, "detailsTable", "detailsTable"));
            detailsDiv.dialog("option", "title", title);
            var height = detailsDiv.dialog( "option", "height" );
            if (isNaN(height)){
                detailsDiv.dialog("option", "height", appState.window.innerHeight);
            }
            var width = detailsDiv.dialog( "option", "width" );
            if (isNaN(width) || width > appState.window.innerWidth){
                detailsDiv.dialog("option", "width", Math.min(appState.window.innerWidth, 800));
            }
            detailsDiv.dialog("open");
        }).error(function () {
            $('#id_details').text("Details:\n" + title + "\n...");
            console.log('error loading details!');
        });
    }

    function jsonToTable (json, title, tableId, tableClass) {
        var keys = [];
        for (var key in json) {
            if (json.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        keys = keys.sort();

        var html = '<table id = "' + tableId + '" class="' + tableClass + '"';
        for (var i = 0; i < keys.length; i++) {
            var tr = '<tr>';
            tr += "<td>" + toTitleCase(keys[i]) + "</td>";
            tr += "<td>" + json[keys[i]] + "</td>";
            tr += "</tr>";
            html += tr;
        }
        html += '</table>';
        return html;
    }

    function toTitleCase(str) {
        str = str.replace(/_/g, " ");
        return str.replace(/(?:^|\s)\w/g, function(match) {
            return match.toUpperCase();
        });
    }

    function scrollToItem(scroll, select) {
        var number = scroll.scrollTop() + select.position().top - scroll.height() / 2 + select.height() / 2;
        scroll.scrollTop(number);
    }

    function setActiveTabFromSelection(data_id) {
// select content tab if selected item is not in current tab list
        var tabSelector = $("#id_content_tabs");
        var activeIndex = tabSelector.tabs("option", "active");
        var element = tabSelector.find( ".ui-tabs-panel" )[activeIndex];
        var alreadySelected = $('.ui-selected[value="' + data_id + '"]', $(element));
        if (alreadySelected.length == 0) {
            tabSelector.tabs("option", "active", 0);
        }
    }

    function setListSelection(data_id) {
        $(".listContent").each(function( index ) {
            var alreadySelected = $('.ui-selected[value="' + data_id +'"]', this);
            if (alreadySelected.length == 0) {
                $(".ui-selected", this).removeClass("ui-selected");
                var select = $('[value="' + data_id +'"]', this);
                if (select && select.length > 0) {
                    select.addClass("ui-selected");
                    var scroll = $(this).closest("div");
                    scrollToItem(scroll, select);
                }
            }
        });
    }

    function setSelectedFeature(layer, feature, zoomToSelected, showPopup) {
        closePopup(appState.lastSelectedLayer);
        appState.lastSelectedLayer = layer;
        setMapSelection(feature.id, zoomToSelected);
        setListSelection(feature.id);
        if (layer && showPopup) {
            openPopup(layer, feature.id, feature.properties.description);
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

    function data_to_geoJsonLayer(data, selected) {
//    console.log(data); //for debugging: JSON ok?
        if (geoJsonLayer == null) {
            geoJsonLayer = L.geoJson(data, {
                pointToLayer: function (feature, latlng) {
                    return new L.CircleMarker(latlng, {radius: 10, fillOpacity: 0.8});
                },
                onEachFeature: function (feature, layer) {
                    appState.layerMap[feature.id] = layer;
                    layer.on('click', function (e) {
                        var selectedFeature = getSmallestFeature(e.latlng, feature);
                        onFeatureClick(selectedFeature.id);
                    });
//                    layer.on('dblclick', function(e) {
//                        var selectedFeature = getSmallestFeature(e.latlng, feature);
//                        openDetails(selectedFeature.id);
//                    })
                }});
            geoJsonLayer.addTo(map);
        }
        else {
            geoJsonLayer.clearLayers();
            geoJsonLayer.addData(data);
        }
        addMarkers(data, selected);
        var len = data.features.length;
        normalStyle.fillOpacity = 0.8 / (2 + len / 5);
        geoJsonLayer.setStyle(normalStyle);

        if (selected){
            setMapSelection(selected);
        }
    }

    function openDetails(id) {
        clearTimeout(appState.clickTimeout);
        appState.clickTimeout = null;
        var feature = appState.featureMap[id];
        var added = addToMapIfMissing(feature);
        setSelectedFeature(appState.layerMap[id], feature, added, false);
        viewDetails(id, feature.properties.description);
        return false;
    }

    function onFeatureClick(id) {
//        if (!appState.clickTimeout) {
//            appState.clickTimeout = setTimeout(function() {
                var added = addToMapIfMissing(appState.featureMap[id]);
                setSelectedFeature(appState.layerMap[id], appState.featureMap[id], added, true);
//                clearTimeout(appState.clickTimeout);
//                appState.clickTimeout = null;
//            }, 300);
//        }
    }

    function getPopupHtml(featureId, title) {
        return "<b>" + title + '</b><br/><a href="#" onclick="nmdcApp.openDetails(' + "'" + featureId + "'" + ')">More..</a>';
    }

    function addMarkers(data, selected) {
        for (var i = 0; i < appState.markers.length; i++) {
            map.removeLayer(appState.markers[i]);
        }
        appState.markers = [];
        var features = data.features;
        for (var j = 0; j < features.length; ++j) {
            var feature = features[j];
            var geometries = feature.geometry.type == 'GeometryCollection' ? feature.geometry.geometries : [feature.geometry];
            for (var k = 0; k < geometries.length; k++) {
                if (geometries[k].type == 'Point') {
                    var marker = new L.Marker([geometries[k].coordinates[1], geometries[k].coordinates[0]]);
                    marker.featureId = feature.id;
                    appState.markers.push(marker);
                    marker.on('click', function(e) {
                        var targetFeature = appState.featureMap[e.target.featureId];
                        if (targetFeature) {
                            onFeatureClick(targetFeature.id);
                        }
                    });
//                    marker.on('dblclick', function(e) {
//                        var targetFeature = appState.featureMap[e.target.featureId];
//                        if (targetFeature) {
//                            openDetails(targetFeature.id);
//                        }
//                    });
                    map.addLayer(marker);
                }
            }
        }
    }

    function getSelectedId() {
        var selectedId = undefined;
        var selectedContains = $('#id_content_related').find(".ui-selected");
        var selected = $('#id_content').find(".ui-selected");
        if (selected && selected[0]) {
            selectedId = selected[0].value;
        }
        else if (selectedContains && selectedContains[0]) {
            selectedId = selectedContains[0].value;
        }
        return selectedId;
    }

    function getDataQueryPart() {
        var portal = $("input:radio[name='portal']:checked").val() || window.localStorage['nmdcPortal'];
        var bbox = map.getBounds().toBBoxString();
        var from = $('#datepickerFrom')[0].value;
        var to = $('#datepickerTo')[0].value;
        var query = '?bbox=' + bbox + "&from=" + from + "&to=" + to + "&fraction=" + appState.areaInsideFraction +"&portalId=" + portal;
        return query;
    }

    function getAndDisplayData() {
        $.getJSON('getDataInside' + getDataQueryPart(), function (data) {
            var selectedId = getSelectedId();
            updateContentElement(data, '#id_content', selectedId, true);
            data_to_geoJsonLayer(data, selectedId);
        });
        getAndDisplayDataRelated();
    }

    function getAndDisplayDataRelated() {
        $.getJSON('getDataRelated' + getDataQueryPart(), function (data) {
            updateContentElement(data, '#id_content_related', getSelectedId(), false);
        });
    }

    function initData() {
        $.getJSON('getDataGroups', function (data) {
            var html = '';
            for(var i = 0; i < data.length; i++) {
                html += '<input type="radio" name="portal" value="' + data[i].portal_id + '">' + data[i].name + '<br/>';
            }
            $('#portalsId').html(html);
            $("input:radio[name='portal']").click(function(){
                window.localStorage['nmdcPortal'] = $("input:radio[name='portal']:checked").val();
                getAndDisplayData();
            });
            var selectedPortal = window.localStorage['nmdcPortal'] || data[0].portal_id;
            if (selectedPortal){
                $("input:radio[name='portal'][value='" + selectedPortal + "']").attr('checked', 'checked');
            }
            getAndDisplayData();
        });
    }

    function getListItemHtml(className, id, value) {
//        return '<li class="' + className + '" value="' + id + '" ondblclick="nmdcApp.openDetails(' + "'" + id + "'" + ')">' + value + '</li>';
        return '<li class="' + className + '" value="' + id + '">' + value + '</li>';
    }
    function updateContentElement(data, selector, selected, selectable) {
        var jqElem = $(selector);
        jqElem.empty();
        var bool_row_even = false;
        var features = data.features;
        var html = '';
        for (var i = 0; i < features.length; ++i) {
            var feature = features[i];
            feature.selectable = selectable;
            feature.area = bboxArea(feature.bbox);
            appState.featureMap[feature.id] = feature;
            bool_row_even = !bool_row_even;
            var listClass = bool_row_even ? "cl_row_even" : "cl_row_odd";
            html += getListItemHtml(listClass, feature.id, feature.properties.description);
        }
        jqElem.append(html);
        if (selected){
            setListSelection(selected);
            setActiveTabFromSelection(selected);
        }
    }
    function bboxArea(bbox){
        if (!bbox) return 0;
        return (bbox[2] - bbox[0]) * (bbox[3] - bbox[1]);
    }

    function getSmallestInside(latLngPoint, selectedFeature) {
        var minId = selectedFeature.id;
        var minArea = selectedFeature.area;
        for (var featureId in appState.featureMap) {
            if (appState.featureMap.hasOwnProperty(featureId)) {
                feature = appState.featureMap[featureId];
                if (feature.selectable && pointInside(latLngPoint, feature) && feature.area < minArea) {
                    minId = feature.id;
                    minArea = feature.area;
                }
            }
        }
        return minId;
    }

    function pointInside (latLngPoint, feature) {
        if (feature.bbox) {
            return latLngPoint.lng > feature.bbox[0] && latLngPoint.lng < feature.bbox[2] && latLngPoint.lat > feature.bbox[1] && latLngPoint.lat < feature.bbox[3];
        }
        var pixelMouse = map.project(latLngPoint);
        var pixelFeature = map.project(L.latLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]));
        var diffX = Math.abs(pixelFeature.x - pixelMouse.x);
        var diffY = Math.abs(pixelFeature.y - pixelMouse.y);
        return diffX < 6 && diffY < 6;
    }

    init();
})(window);
