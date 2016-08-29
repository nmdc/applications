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
    L.Control.NmdcNavBar = L.Control.extend({
        options: {
            position: 'topleft',
            fastForwardTitle: 'Go to last map view',
            forwardTitle: 'Go forward in map view history',
            backTitle: 'Go back in map view history',
            homeTitle: 'Go to first map view'
        },

        onAdd: function (map) {
            // Set options
            if (!this.options.center) {
                this.options.center = map.getCenter();
            }
            if (!this.options.zoom) {
                this.options.zoom = map.getZoom();
            }
            options = this.options;

            // Create toolbar
            var controlName = 'leaflet-control-navbar',
                container = L.DomUtil.create('div', controlName + ' leaflet-bar');

            // Add toolbar buttons
            this._homeButton = this._createButton(options.homeTitle, controlName + '-fastBack', 'fa-step-backward', container, this._goHome);
            this._backButton = this._createButton(options.backTitle, controlName + '-back', 'fa-caret-left fa-larger', container, this._goBack);
            this._fwdButton = this._createButton(options.forwardTitle, controlName + '-fwd', 'fa-caret-right fa-larger', container, this._goFwd);
            this._fastfwdButton = this._createButton(options.fastForwardTitle, controlName + '-fastFwd', 'fa-step-forward', container, this._goFastFwd);

            this._history = {index: -1, list: [], isChanging: false};
            this._updateDisabled();

            map.on('moveend', this._updateHistory, this);
            // Set intial view to home
            map.setView(options.center, options.zoom);

            return container;
        },

        onRemove: function (map) {
            map.off('moveend', this._updateHistory, this);
        },

        _goHome: function () {
            this._goToHistoryIndex(0);
        },

        _goBack: function () {
            this._goToHistoryIndex(Math.max(0, this._history.index - 1));
        },

        _goFwd: function () {
            this._goToHistoryIndex(Math.min(this._history.list.length - 1, this._history.index + 1));
        },

        _goFastFwd: function() {
            this._goToHistoryIndex(this._history.list.length - 1);
        },

        _createButton: function (title, className, icon, container, fn) {
            // Modified from Leaflet zoom control

            var extraClasses = icon.lastIndexOf('fa', 0) === 0 ? ' fa fa-lg' : ' glyphicon';
            var link = L.DomUtil.create('a', className, container);
            L.DomUtil.create('i', icon + extraClasses, link);
            link.href = '#';
            link.title = title;

            L.DomEvent
                .on(link, 'mousedown dblclick', L.DomEvent.stopPropagation)
                .on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', fn, this)
                .on(link, 'click', this._refocusOnMap, this);

            return link;
        },

        _updateHistory: function () {
            if (this._history.isChanging) {
                this._history.isChanging = false;
                return;
            }
            var newIndex = this._history.index + 1;
            this._history.list.splice(newIndex);
            this._history.list.push({center: this._map.getCenter(), zoom: this._map.getZoom()});
            this._history.index = newIndex;
            //console.log("_updateHistory, length:" + this._history.list.length + ", idx: " + this._history.index);
            this._updateDisabled();
        },

        _setFwdEnabled: function (enabled) {
            var leafletDisabled = 'leaflet-disabled';
            var fwdDisabled = 'leaflet-control-navbar-fwd-disabled';
            if (enabled === true) {
                L.DomUtil.removeClass(this._fastfwdButton, fwdDisabled);
                L.DomUtil.removeClass(this._fastfwdButton, leafletDisabled);
                L.DomUtil.removeClass(this._fwdButton, fwdDisabled);
                L.DomUtil.removeClass(this._fwdButton, leafletDisabled);
            } else {
                L.DomUtil.addClass(this._fastfwdButton, fwdDisabled);
                L.DomUtil.addClass(this._fastfwdButton, leafletDisabled);
                L.DomUtil.addClass(this._fwdButton, fwdDisabled);
                L.DomUtil.addClass(this._fwdButton, leafletDisabled);
            }
        },

        _setBackEnabled: function (enabled) {
            var leafletDisabled = 'leaflet-disabled';
            var backDisabled = 'leaflet-control-navbar-back-disabled';
            if (enabled === true) {
                L.DomUtil.removeClass(this._homeButton, backDisabled);
                L.DomUtil.removeClass(this._homeButton, leafletDisabled);
                L.DomUtil.removeClass(this._backButton, backDisabled);
                L.DomUtil.removeClass(this._backButton, leafletDisabled);
            } else {
                L.DomUtil.addClass(this._homeButton, backDisabled);
                L.DomUtil.addClass(this._homeButton, leafletDisabled);
                L.DomUtil.addClass(this._backButton, backDisabled);
                L.DomUtil.addClass(this._backButton, leafletDisabled);
            }
        },

        _updateDisabled: function () {
            return;       // todo disabling does not prevent the button click

            if (this._history.index >= (this._history.list.length - 1)) {
                this._setFwdEnabled(false);
            } else {
                this._setFwdEnabled(true);
            }

            if (this._history.index <= 0) {
                this._setBackEnabled(false);
            } else {
                this._setBackEnabled(true);
            }
        },

        _goToHistoryIndex: function (newIndex) {
            this._history.index = newIndex;
            this._history.isChanging = true;
            this._map.setView(this._history.list[this._history.index].center, this._history.list[this._history.index].zoom);
            //console.log("new: " + newIndex + ", is: " + this._history.index + ", length: " + this._history.list.length);
            this._updateDisabled();
        }
    });

    L.control.nmdcNavbar = function (options) {
        return new L.Control.NmdcNavBar(options);
    };

})();
