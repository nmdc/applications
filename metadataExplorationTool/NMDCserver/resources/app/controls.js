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