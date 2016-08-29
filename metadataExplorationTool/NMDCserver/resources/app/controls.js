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
    L.Control.EasyButtons = L.Control.extend({
        options: {
            position: 'topleft',
            title: '',
            intentedIcon: 'fa-circle-o'
        },

        onAdd: function () {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

            this.link = L.DomUtil.create('a', 'leaflet-bar-part', container);
            L.DomUtil.create('i', 'fa fa-lg ' + this.options.intentedIcon , this.link);
            this.link.href = '#';

            L.DomEvent.on(this.link, 'click', this._click, this);
            this.link.title = this.options.title;

            return container;
        },

        intendedFunction: function(){ alert('no function selected');},

        _click: function (e) {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);
            this.intendedFunction(e);
        }
    });

    L.easyButton = function( btnIcon , btnFunction , btnTitle , btnMap ) {
        var newControl = new L.Control.EasyButtons;
        if (btnIcon) newControl.options.intentedIcon = btnIcon;

        if ( typeof btnFunction === 'function'){
            newControl.intendedFunction = btnFunction;
        }

        if (btnTitle) newControl.options.title = btnTitle;

//      if ( btnMap ){
//         newControl.addTo(btnMap);
//      } else {
//         newControl.addTo(map);
//      }
        return newControl;
    };
})();
