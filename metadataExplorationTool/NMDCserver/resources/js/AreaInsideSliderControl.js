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
