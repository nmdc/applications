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
