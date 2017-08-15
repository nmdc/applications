<!--
 Copyright (c) 2015, Christian Michelsen Research AS
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
-->

L.Control.AreaInsideSliderControl = L.Control.extend({
    options: {
        position: 'topright',
        areaInsideFraction: 1.0
    },

    initialize: function (options) {
        L.Util.setOptions(this, options);
    },

    setPosition: function (position) {
        var map = this._map;

        if (map) {
            map.removeControl(this);
        }

        this.options.position = position;

        if (map) {
            map.addControl(this);
        }
        this.startSlider();
        return this;
    },

    onAdd: function (map) {
        this.options.map = map;
        // Create a control sliderContainer with a jquery ui slider
        var sliderContainer = L.DomUtil.create('div', 'slider', this._container);
        $(sliderContainer).append('<div id="leaflet-area-inside-slider" style="width:200px" title="Amount of Area inside"></div>');
        $(sliderContainer).mousedown(function () {
            map.dragging.disable();
        });
        $(document).mouseup(function () {
            map.dragging.enable();
            //Only show the slider timestamp while using the slider
            $('#areaSliderTooltip').html('');
        });
        return sliderContainer;
    },

    onRemove: function (map) {
        $('#leaflet-area-inside-slider').remove();
    },

    startSlider: function () {
        var _options = this.options;
        var sliderSelector = $("#leaflet-area-inside-slider");
        var sliderHandle;
        sliderSelector.slider(
            { min: 0,
                max: 10,
                value: _options.areaInsideFraction * 10,
                slide: function (event, ui) {
//                    $('.ui-slider-handle').prop('title', ui.value / 10);
                },
                stop: function (event, ui) {
                    _options.areaInsideFraction = ui.value / 10;
                    _options.callback(_options.areaInsideFraction);
                }
            });
        sliderSelector.tooltip();
        sliderHandle = $('.ui-slider-handle');
//        sliderHandle.prop('title', _options.areaInsideFraction);
    }
});

L.control.areaInsideSliderControl = function (options) {
    return new L.Control.AreaInsideSliderControl(options);
};