/*
 Leaflet, a JavaScript library for mobile-friendly interactive maps. http://leafletjs.com
 (c) 2010-2013, Vladimir Agafonkin, CloudMade
 */
(function (t, e, i) {
    var n, o;
    typeof exports != i + "" ? n = exports : (o = t.L, n = {}, n.noConflict = function () {
        return t.L = o, this
    }, t.L = n), n.version = "0.5.1", n.Util = {extend: function (t) {
        var e, i, n, o, s = Array.prototype.slice.call(arguments, 1);
        for (i = 0, n = s.length; n > i; i++) {
            o = s[i] || {};
            for (e in o)o.hasOwnProperty(e) && (t[e] = o[e])
        }
        return t
    }, bind: function (t, e) {
        var i = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : null;
        return function () {
            return t.apply(e, i || arguments)
        }
    }, stamp: function () {
        var t = 0, e = "_leaflet_id";
        return function (i) {
            return i[e] = i[e] || ++t, i[e]
        }
    }(), limitExecByInterval: function (t, e, n) {
        var o, s;
        return function a() {
            var r = arguments;
            return o ? (s = !0, i) : (o = !0, setTimeout(function () {
                o = !1, s && (a.apply(n, r), s = !1)
            }, e), t.apply(n, r), i)
        }
    }, falseFn: function () {
        return!1
    }, formatNum: function (t, e) {
        var i = Math.pow(10, e || 5);
        return Math.round(t * i) / i
    }, splitWords: function (t) {
        return t.replace(/^\s+|\s+$/g, "").split(/\s+/)
    }, setOptions: function (t, e) {
        return t.options = n.extend({}, t.options, e), t.options
    }, getParamString: function (t, e) {
        var i = [];
        for (var n in t)t.hasOwnProperty(n) && i.push(n + "=" + t[n]);
        return(e && -1 !== e.indexOf("?") ? "&" : "?") + i.join("&")
    }, template: function (t, e) {
        return t.replace(/\{ *([\w_]+) *\}/g, function (t, i) {
            var n = e[i];
            if (!e.hasOwnProperty(i))throw Error("No value provided for variable " + t);
            return n
        })
    }, isArray: function (t) {
        return"[object Array]" === Object.prototype.toString.call(t)
    }, emptyImageUrl: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="}, function () {
        function e(e) {
            var i, n, o = ["webkit", "moz", "o", "ms"];
            for (i = 0; o.length > i && !n; i++)n = t[o[i] + e];
            return n
        }

        function o(e) {
            var i = +new Date, n = Math.max(0, 16 - (i - s));
            return s = i + n, t.setTimeout(e, n)
        }

        var s = 0, a = t.requestAnimationFrame || e("RequestAnimationFrame") || o, r = t.cancelAnimationFrame || e("CancelAnimationFrame") || e("CancelRequestAnimationFrame") || function (e) {
            t.clearTimeout(e)
        };
        n.Util.requestAnimFrame = function (e, s, r, h) {
            return e = n.bind(e, s), r && a === o ? (e(), i) : a.call(t, e, h)
        }, n.Util.cancelAnimFrame = function (e) {
            e && r.call(t, e)
        }
    }(), n.extend = n.Util.extend, n.bind = n.Util.bind, n.stamp = n.Util.stamp, n.setOptions = n.Util.setOptions, n.Class = function () {
    }, n.Class.extend = function (t) {
        var e = function () {
            this.initialize && this.initialize.apply(this, arguments), this._initHooks && this.callInitHooks()
        }, i = function () {
        };
        i.prototype = this.prototype;
        var o = new i;
        o.constructor = e, e.prototype = o;
        for (var s in this)this.hasOwnProperty(s) && "prototype" !== s && (e[s] = this[s]);
        t.statics && (n.extend(e, t.statics), delete t.statics), t.includes && (n.Util.extend.apply(null, [o].concat(t.includes)), delete t.includes), t.options && o.options && (t.options = n.extend({}, o.options, t.options)), n.extend(o, t), o._initHooks = [];
        var a = this;
        return o.callInitHooks = function () {
            if (!this._initHooksCalled) {
                a.prototype.callInitHooks && a.prototype.callInitHooks.call(this), this._initHooksCalled = !0;
                for (var t = 0, e = o._initHooks.length; e > t; t++)o._initHooks[t].call(this)
            }
        }, e
    }, n.Class.include = function (t) {
        n.extend(this.prototype, t)
    }, n.Class.mergeOptions = function (t) {
        n.extend(this.prototype.options, t)
    }, n.Class.addInitHook = function (t) {
        var e = Array.prototype.slice.call(arguments, 1), i = "function" == typeof t ? t : function () {
            this[t].apply(this, e)
        };
        this.prototype._initHooks = this.prototype._initHooks || [], this.prototype._initHooks.push(i)
    };
    var s = "_leaflet_events";
    n.Mixin = {}, n.Mixin.Events = {addEventListener: function (t, e, i) {
        var o, a, r, h = this[s] = this[s] || {};
        if ("object" == typeof t) {
            for (o in t)t.hasOwnProperty(o) && this.addEventListener(o, t[o], e);
            return this
        }
        for (t = n.Util.splitWords(t), a = 0, r = t.length; r > a; a++)h[t[a]] = h[t[a]] || [], h[t[a]].push({action: e, context: i || this});
        return this
    }, hasEventListeners: function (t) {
        return s in this && t in this[s] && this[s][t].length > 0
    }, removeEventListener: function (t, e, i) {
        var o, a, r, h, l, u = this[s];
        if ("object" == typeof t) {
            for (o in t)t.hasOwnProperty(o) && this.removeEventListener(o, t[o], e);
            return this
        }
        for (t = n.Util.splitWords(t), a = 0, r = t.length; r > a; a++)if (this.hasEventListeners(t[a]))for (h = u[t[a]], l = h.length - 1; l >= 0; l--)e && h[l].action !== e || i && h[l].context !== i || h.splice(l, 1);
        return this
    }, fireEvent: function (t, e) {
        if (!this.hasEventListeners(t))return this;
        for (var i = n.extend({type: t, target: this}, e), o = this[s][t].slice(), a = 0, r = o.length; r > a; a++)o[a].action.call(o[a].context || this, i);
        return this
    }}, n.Mixin.Events.on = n.Mixin.Events.addEventListener, n.Mixin.Events.off = n.Mixin.Events.removeEventListener, n.Mixin.Events.fire = n.Mixin.Events.fireEvent, function () {
        var o = !!t.ActiveXObject, s = o && !t.XMLHttpRequest, a = o && !e.querySelector, r = navigator.userAgent.toLowerCase(), h = -1 !== r.indexOf("webkit"), l = -1 !== r.indexOf("chrome"), u = -1 !== r.indexOf("android"), c = -1 !== r.search("android [23]"), _ = typeof orientation != i + "", d = t.navigator && t.navigator.msPointerEnabled && t.navigator.msMaxTouchPoints, p = "devicePixelRatio"in t && t.devicePixelRatio > 1 || "matchMedia"in t && t.matchMedia("(min-resolution:144dpi)") && t.matchMedia("(min-resolution:144dpi)").matches, m = e.documentElement, f = o && "transition"in m.style, g = "WebKitCSSMatrix"in t && "m11"in new t.WebKitCSSMatrix, v = "MozPerspective"in m.style, y = "OTransition"in m.style, L = !t.L_DISABLE_3D && (f || g || v || y), P = !t.L_NO_TOUCH && function () {
            var t = "ontouchstart";
            if (d || t in m)return!0;
            var i = e.createElement("div"), n = !1;
            return i.setAttribute ? (i.setAttribute(t, "return;"), "function" == typeof i[t] && (n = !0), i.removeAttribute(t), i = null, n) : !1
        }();
        n.Browser = {ie: o, ie6: s, ie7: a, webkit: h, android: u, android23: c, chrome: l, ie3d: f, webkit3d: g, gecko3d: v, opera3d: y, any3d: L, mobile: _, mobileWebkit: _ && h, mobileWebkit3d: _ && g, mobileOpera: _ && t.opera, touch: P, msTouch: d, retina: p}
    }(), n.Point = function (t, e, i) {
        this.x = i ? Math.round(t) : t, this.y = i ? Math.round(e) : e
    }, n.Point.prototype = {clone: function () {
        return new n.Point(this.x, this.y)
    }, add: function (t) {
        return this.clone()._add(n.point(t))
    }, _add: function (t) {
        return this.x += t.x, this.y += t.y, this
    }, subtract: function (t) {
        return this.clone()._subtract(n.point(t))
    }, _subtract: function (t) {
        return this.x -= t.x, this.y -= t.y, this
    }, divideBy: function (t) {
        return this.clone()._divideBy(t)
    }, _divideBy: function (t) {
        return this.x /= t, this.y /= t, this
    }, multiplyBy: function (t) {
        return this.clone()._multiplyBy(t)
    }, _multiplyBy: function (t) {
        return this.x *= t, this.y *= t, this
    }, round: function () {
        return this.clone()._round()
    }, _round: function () {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this
    }, floor: function () {
        return this.clone()._floor()
    }, _floor: function () {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this
    }, distanceTo: function (t) {
        t = n.point(t);
        var e = t.x - this.x, i = t.y - this.y;
        return Math.sqrt(e * e + i * i)
    }, equals: function (t) {
        return t.x === this.x && t.y === this.y
    }, toString: function () {
        return"Point(" + n.Util.formatNum(this.x) + ", " + n.Util.formatNum(this.y) + ")"
    }}, n.point = function (t, e, i) {
        return t instanceof n.Point ? t : n.Util.isArray(t) ? new n.Point(t[0], t[1]) : isNaN(t) ? t : new n.Point(t, e, i)
    }, n.Bounds = function (t, e) {
        if (t)for (var i = e ? [t, e] : t, n = 0, o = i.length; o > n; n++)this.extend(i[n])
    }, n.Bounds.prototype = {extend: function (t) {
        return t = n.point(t), this.min || this.max ? (this.min.x = Math.min(t.x, this.min.x), this.max.x = Math.max(t.x, this.max.x), this.min.y = Math.min(t.y, this.min.y), this.max.y = Math.max(t.y, this.max.y)) : (this.min = t.clone(), this.max = t.clone()), this
    }, getCenter: function (t) {
        return new n.Point((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2, t)
    }, getBottomLeft: function () {
        return new n.Point(this.min.x, this.max.y)
    }, getTopRight: function () {
        return new n.Point(this.max.x, this.min.y)
    }, getSize: function () {
        return this.max.subtract(this.min)
    }, contains: function (t) {
        var e, i;
        return t = "number" == typeof t[0] || t instanceof n.Point ? n.point(t) : n.bounds(t), t instanceof n.Bounds ? (e = t.min, i = t.max) : e = i = t, e.x >= this.min.x && i.x <= this.max.x && e.y >= this.min.y && i.y <= this.max.y
    }, intersects: function (t) {
        t = n.bounds(t);
        var e = this.min, i = this.max, o = t.min, s = t.max, a = s.x >= e.x && o.x <= i.x, r = s.y >= e.y && o.y <= i.y;
        return a && r
    }, isValid: function () {
        return!(!this.min || !this.max)
    }}, n.bounds = function (t, e) {
        return!t || t instanceof n.Bounds ? t : new n.Bounds(t, e)
    }, n.Transformation = function (t, e, i, n) {
        this._a = t, this._b = e, this._c = i, this._d = n
    }, n.Transformation.prototype = {transform: function (t, e) {
        return this._transform(t.clone(), e)
    }, _transform: function (t, e) {
        return e = e || 1, t.x = e * (this._a * t.x + this._b), t.y = e * (this._c * t.y + this._d), t
    }, untransform: function (t, e) {
        return e = e || 1, new n.Point((t.x / e - this._b) / this._a, (t.y / e - this._d) / this._c)
    }}, n.DomUtil = {get: function (t) {
        return"string" == typeof t ? e.getElementById(t) : t
    }, getStyle: function (t, i) {
        var n = t.style[i];
        if (!n && t.currentStyle && (n = t.currentStyle[i]), (!n || "auto" === n) && e.defaultView) {
            var o = e.defaultView.getComputedStyle(t, null);
            n = o ? o[i] : null
        }
        return"auto" === n ? null : n
    }, getViewportOffset: function (t) {
        var i, o = 0, s = 0, a = t, r = e.body, h = n.Browser.ie7;
        do {
            if (o += a.offsetTop || 0, s += a.offsetLeft || 0, o += parseInt(n.DomUtil.getStyle(a, "borderTopWidth"), 10) || 0, s += parseInt(n.DomUtil.getStyle(a, "borderLeftWidth"), 10) || 0, i = n.DomUtil.getStyle(a, "position"), a.offsetParent === r && "absolute" === i)break;
            if ("fixed" === i) {
                o += r.scrollTop || 0, s += r.scrollLeft || 0;
                break
            }
            a = a.offsetParent
        } while (a);
        a = t;
        do {
            if (a === r)break;
            o -= a.scrollTop || 0, s -= a.scrollLeft || 0, n.DomUtil.documentIsLtr() || !n.Browser.webkit && !h || (s += a.scrollWidth - a.clientWidth, h && "hidden" !== n.DomUtil.getStyle(a, "overflow-y") && "hidden" !== n.DomUtil.getStyle(a, "overflow") && (s += 17)), a = a.parentNode
        } while (a);
        return new n.Point(s, o)
    }, documentIsLtr: function () {
        return n.DomUtil._docIsLtrCached || (n.DomUtil._docIsLtrCached = !0, n.DomUtil._docIsLtr = "ltr" === n.DomUtil.getStyle(e.body, "direction")), n.DomUtil._docIsLtr
    }, create: function (t, i, n) {
        var o = e.createElement(t);
        return o.className = i, n && n.appendChild(o), o
    }, disableTextSelection: function () {
        e.selection && e.selection.empty && e.selection.empty(), this._onselectstart || (this._onselectstart = e.onselectstart || null, e.onselectstart = n.Util.falseFn)
    }, enableTextSelection: function () {
        e.onselectstart === n.Util.falseFn && (e.onselectstart = this._onselectstart, this._onselectstart = null)
    }, hasClass: function (t, e) {
        return t.className.length > 0 && RegExp("(^|\\s)" + e + "(\\s|$)").test(t.className)
    }, addClass: function (t, e) {
        n.DomUtil.hasClass(t, e) || (t.className += (t.className ? " " : "") + e)
    }, removeClass: function (t, e) {
        function i(t, i) {
            return i === e ? "" : t
        }

        t.className = t.className.replace(/(\S+)\s*/g, i).replace(/(^\s+|\s+$)/, "")
    }, setOpacity: function (t, e) {
        if ("opacity"in t.style)t.style.opacity = e; else if ("filter"in t.style) {
            var i = !1, n = "DXImageTransform.Microsoft.Alpha";
            try {
                i = t.filters.item(n)
            } catch (o) {
            }
            e = Math.round(100 * e), i ? (i.Enabled = 100 !== e, i.Opacity = e) : t.style.filter += " progid:" + n + "(opacity=" + e + ")"
        }
    }, testProp: function (t) {
        for (var i = e.documentElement.style, n = 0; t.length > n; n++)if (t[n]in i)return t[n];
        return!1
    }, getTranslateString: function (t) {
        var e = n.Browser.webkit3d, i = "translate" + (e ? "3d" : "") + "(", o = (e ? ",0" : "") + ")";
        return i + t.x + "px," + t.y + "px" + o
    }, getScaleString: function (t, e) {
        var i = n.DomUtil.getTranslateString(e.add(e.multiplyBy(-1 * t))), o = " scale(" + t + ") ";
        return i + o
    }, setPosition: function (t, e, i) {
        t._leaflet_pos = e, !i && n.Browser.any3d ? (t.style[n.DomUtil.TRANSFORM] = n.DomUtil.getTranslateString(e), n.Browser.mobileWebkit3d && (t.style.WebkitBackfaceVisibility = "hidden")) : (t.style.left = e.x + "px", t.style.top = e.y + "px")
    }, getPosition: function (t) {
        return t._leaflet_pos
    }}, n.DomUtil.TRANSFORM = n.DomUtil.testProp(["transform", "WebkitTransform", "OTransform", "MozTransform", "msTransform"]), n.DomUtil.TRANSITION = n.DomUtil.testProp(["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]), n.DomUtil.TRANSITION_END = "webkitTransition" === n.DomUtil.TRANSITION || "OTransition" === n.DomUtil.TRANSITION ? n.DomUtil.TRANSITION + "End" : "transitionend", n.LatLng = function (t, e) {
        var i = parseFloat(t), n = parseFloat(e);
        if (isNaN(i) || isNaN(n))throw Error("Invalid LatLng object: (" + t + ", " + e + ")");
        this.lat = i, this.lng = n
    }, n.extend(n.LatLng, {DEG_TO_RAD: Math.PI / 180, RAD_TO_DEG: 180 / Math.PI, MAX_MARGIN: 1e-9}), n.LatLng.prototype = {equals: function (t) {
        if (!t)return!1;
        t = n.latLng(t);
        var e = Math.max(Math.abs(this.lat - t.lat), Math.abs(this.lng - t.lng));
        return n.LatLng.MAX_MARGIN >= e
    }, toString: function (t) {
        return"LatLng(" + n.Util.formatNum(this.lat, t) + ", " + n.Util.formatNum(this.lng, t) + ")"
    }, distanceTo: function (t) {
        t = n.latLng(t);
        var e = 6378137, i = n.LatLng.DEG_TO_RAD, o = (t.lat - this.lat) * i, s = (t.lng - this.lng) * i, a = this.lat * i, r = t.lat * i, h = Math.sin(o / 2), l = Math.sin(s / 2), u = h * h + l * l * Math.cos(a) * Math.cos(r);
        return 2 * e * Math.atan2(Math.sqrt(u), Math.sqrt(1 - u))
    }, wrap: function (t, e) {
        var i = this.lng;
        return t = t || -180, e = e || 180, i = (i + e) % (e - t) + (t > i || i === e ? e : t), new n.LatLng(this.lat, i)
    }}, n.latLng = function (t, e) {
        return t instanceof n.LatLng ? t : n.Util.isArray(t) ? new n.LatLng(t[0], t[1]) : isNaN(t) ? t : new n.LatLng(t, e)
    }, n.LatLngBounds = function (t, e) {
        if (t)for (var i = e ? [t, e] : t, n = 0, o = i.length; o > n; n++)this.extend(i[n])
    }, n.LatLngBounds.prototype = {extend: function (t) {
        return t = "number" == typeof t[0] || "string" == typeof t[0] || t instanceof n.LatLng ? n.latLng(t) : n.latLngBounds(t), t instanceof n.LatLng ? this._southWest || this._northEast ? (this._southWest.lat = Math.min(t.lat, this._southWest.lat), this._southWest.lng = Math.min(t.lng, this._southWest.lng), this._northEast.lat = Math.max(t.lat, this._northEast.lat), this._northEast.lng = Math.max(t.lng, this._northEast.lng)) : (this._southWest = new n.LatLng(t.lat, t.lng), this._northEast = new n.LatLng(t.lat, t.lng)) : t instanceof n.LatLngBounds && (this.extend(t._southWest), this.extend(t._northEast)), this
    }, pad: function (t) {
        var e = this._southWest, i = this._northEast, o = Math.abs(e.lat - i.lat) * t, s = Math.abs(e.lng - i.lng) * t;
        return new n.LatLngBounds(new n.LatLng(e.lat - o, e.lng - s), new n.LatLng(i.lat + o, i.lng + s))
    }, getCenter: function () {
        return new n.LatLng((this._southWest.lat + this._northEast.lat) / 2, (this._southWest.lng + this._northEast.lng) / 2)
    }, getSouthWest: function () {
        return this._southWest
    }, getNorthEast: function () {
        return this._northEast
    }, getNorthWest: function () {
        return new n.LatLng(this._northEast.lat, this._southWest.lng)
    }, getSouthEast: function () {
        return new n.LatLng(this._southWest.lat, this._northEast.lng)
    }, contains: function (t) {
        t = "number" == typeof t[0] || t instanceof n.LatLng ? n.latLng(t) : n.latLngBounds(t);
        var e, i, o = this._southWest, s = this._northEast;
        return t instanceof n.LatLngBounds ? (e = t.getSouthWest(), i = t.getNorthEast()) : e = i = t, e.lat >= o.lat && i.lat <= s.lat && e.lng >= o.lng && i.lng <= s.lng
    }, intersects: function (t) {
        t = n.latLngBounds(t);
        var e = this._southWest, i = this._northEast, o = t.getSouthWest(), s = t.getNorthEast(), a = s.lat >= e.lat && o.lat <= i.lat, r = s.lng >= e.lng && o.lng <= i.lng;
        return a && r
    }, toBBoxString: function () {
        var t = this._southWest, e = this._northEast;
        return[t.lng, t.lat, e.lng, e.lat].join(",")
    }, equals: function (t) {
        return t ? (t = n.latLngBounds(t), this._southWest.equals(t.getSouthWest()) && this._northEast.equals(t.getNorthEast())) : !1
    }, isValid: function () {
        return!(!this._southWest || !this._northEast)
    }}, n.latLngBounds = function (t, e) {
        return!t || t instanceof n.LatLngBounds ? t : new n.LatLngBounds(t, e)
    }, n.Projection = {}, n.Projection.SphericalMercator = {MAX_LATITUDE: 85.0511287798, project: function (t) {
        var e = n.LatLng.DEG_TO_RAD, i = this.MAX_LATITUDE, o = Math.max(Math.min(i, t.lat), -i), s = t.lng * e, a = o * e;
        return a = Math.log(Math.tan(Math.PI / 4 + a / 2)), new n.Point(s, a)
    }, unproject: function (t) {
        var e = n.LatLng.RAD_TO_DEG, i = t.x * e, o = (2 * Math.atan(Math.exp(t.y)) - Math.PI / 2) * e;
        return new n.LatLng(o, i)
    }}, n.Projection.LonLat = {project: function (t) {
        return new n.Point(t.lng, t.lat)
    }, unproject: function (t) {
        return new n.LatLng(t.y, t.x)
    }}, n.CRS = {latLngToPoint: function (t, e) {
        var i = this.projection.project(t), n = this.scale(e);
        return this.transformation._transform(i, n)
    }, pointToLatLng: function (t, e) {
        var i = this.scale(e), n = this.transformation.untransform(t, i);
        return this.projection.unproject(n)
    }, project: function (t) {
        return this.projection.project(t)
    }, scale: function (t) {
        return 256 * Math.pow(2, t)
    }}, n.CRS.Simple = n.extend({}, n.CRS, {projection: n.Projection.LonLat, transformation: new n.Transformation(1, 0, -1, 0), scale: function (t) {
        return Math.pow(2, t)
    }}), n.CRS.EPSG3857 = n.extend({}, n.CRS, {code: "EPSG:3857", projection: n.Projection.SphericalMercator, transformation: new n.Transformation(.5 / Math.PI, .5, -.5 / Math.PI, .5), project: function (t) {
        var e = this.projection.project(t), i = 6378137;
        return e.multiplyBy(i)
    }}), n.CRS.EPSG900913 = n.extend({}, n.CRS.EPSG3857, {code: "EPSG:900913"}), n.CRS.EPSG4326 = n.extend({}, n.CRS, {code: "EPSG:4326", projection: n.Projection.LonLat, transformation: new n.Transformation(1 / 360, .5, -1 / 360, .5)}), n.Map = n.Class.extend({includes: n.Mixin.Events, options: {crs: n.CRS.EPSG3857, fadeAnimation: n.DomUtil.TRANSITION && !n.Browser.android23, trackResize: !0, markerZoomAnimation: n.DomUtil.TRANSITION && n.Browser.any3d}, initialize: function (t, e) {
        e = n.setOptions(this, e), this._initContainer(t), this._initLayout(), this.callInitHooks(), this._initEvents(), e.maxBounds && this.setMaxBounds(e.maxBounds), e.center && e.zoom !== i && this.setView(n.latLng(e.center), e.zoom, !0), this._initLayers(e.layers)
    }, setView: function (t, e) {
        return this._resetView(n.latLng(t), this._limitZoom(e)), this
    }, setZoom: function (t) {
        return this.setView(this.getCenter(), t)
    }, zoomIn: function (t) {
        return this.setZoom(this._zoom + (t || 1))
    }, zoomOut: function (t) {
        return this.setZoom(this._zoom - (t || 1))
    }, fitBounds: function (t) {
        var e = this.getBoundsZoom(t);
        return this.setView(n.latLngBounds(t).getCenter(), e)
    }, fitWorld: function () {
        var t = new n.LatLng(-60, -170), e = new n.LatLng(85, 179);
        return this.fitBounds(new n.LatLngBounds(t, e))
    }, panTo: function (t) {
        return this.setView(t, this._zoom)
    }, panBy: function (t) {
        return this.fire("movestart"), this._rawPanBy(n.point(t)), this.fire("move"), this.fire("moveend")
    }, setMaxBounds: function (t) {
        if (t = n.latLngBounds(t), this.options.maxBounds = t, !t)return this._boundsMinZoom = null, this;
        var e = this.getBoundsZoom(t, !0);
        return this._boundsMinZoom = e, this._loaded && (e > this._zoom ? this.setView(t.getCenter(), e) : this.panInsideBounds(t)), this
    }, panInsideBounds: function (t) {
        t = n.latLngBounds(t);
        var e = this.getBounds(), i = this.project(e.getSouthWest()), o = this.project(e.getNorthEast()), s = this.project(t.getSouthWest()), a = this.project(t.getNorthEast()), r = 0, h = 0;
        return o.y < a.y && (h = a.y - o.y), o.x > a.x && (r = a.x - o.x), i.y > s.y && (h = s.y - i.y), i.x < s.x && (r = s.x - i.x), this.panBy(new n.Point(r, h, !0))
    }, addLayer: function (t) {
        var e = n.stamp(t);
        return this._layers[e] ? this : (this._layers[e] = t, !t.options || isNaN(t.options.maxZoom) && isNaN(t.options.minZoom) || (this._zoomBoundLayers[e] = t, this._updateZoomLevels()), this.options.zoomAnimation && n.TileLayer && t instanceof n.TileLayer && (this._tileLayersNum++, this._tileLayersToLoad++, t.on("load", this._onTileLayerLoad, this)), this.whenReady(function () {
            t.onAdd(this), this.fire("layeradd", {layer: t})
        }, this), this)
    }, removeLayer: function (t) {
        var e = n.stamp(t);
        if (this._layers[e])return t.onRemove(this), delete this._layers[e], this._zoomBoundLayers[e] && (delete this._zoomBoundLayers[e], this._updateZoomLevels()), this.options.zoomAnimation && n.TileLayer && t instanceof n.TileLayer && (this._tileLayersNum--, this._tileLayersToLoad--, t.off("load", this._onTileLayerLoad, this)), this.fire("layerremove", {layer: t})
    }, hasLayer: function (t) {
        var e = n.stamp(t);
        return this._layers.hasOwnProperty(e)
    }, invalidateSize: function (t) {
        var e = this.getSize();
        if (this._sizeChanged = !0, this.options.maxBounds && this.setMaxBounds(this.options.maxBounds), !this._loaded)return this;
        var i = e._subtract(this.getSize())._divideBy(2)._round();
        return t === !0 ? this.panBy(i) : (this._rawPanBy(i), this.fire("move"), clearTimeout(this._sizeTimer), this._sizeTimer = setTimeout(n.bind(this.fire, this, "moveend"), 200)), this
    }, addHandler: function (t, e) {
        return e ? (this[t] = new e(this), this.options[t] && this[t].enable(), this) : i
    }, getCenter: function () {
        return this.layerPointToLatLng(this._getCenterLayerPoint())
    }, getZoom: function () {
        return this._zoom
    }, getBounds: function () {
        var t = this.getPixelBounds(), e = this.unproject(t.getBottomLeft()), i = this.unproject(t.getTopRight());
        return new n.LatLngBounds(e, i)
    }, getMinZoom: function () {
        var t = this.options.minZoom || 0, e = this._layersMinZoom || 0, i = this._boundsMinZoom || 0;
        return Math.max(t, e, i)
    }, getMaxZoom: function () {
        var t = this.options.maxZoom === i ? 1 / 0 : this.options.maxZoom, e = this._layersMaxZoom === i ? 1 / 0 : this._layersMaxZoom;
        return Math.min(t, e)
    }, getBoundsZoom: function (t, e) {
        t = n.latLngBounds(t);
        var i, o, s, a = this.getSize(), r = this.options.minZoom || 0, h = this.getMaxZoom(), l = t.getNorthEast(), u = t.getSouthWest(), c = !0;
        e && r--;
        do r++, o = this.project(l, r), s = this.project(u, r), i = new n.Point(Math.abs(o.x - s.x), Math.abs(s.y - o.y)), c = e ? i.x < a.x || i.y < a.y : i.x <= a.x && i.y <= a.y; while (c && h >= r);
        return c && e ? null : e ? r : r - 1
    }, getSize: function () {
        return(!this._size || this._sizeChanged) && (this._size = new n.Point(this._container.clientWidth, this._container.clientHeight), this._sizeChanged = !1), this._size.clone()
    }, getPixelBounds: function () {
        var t = this._getTopLeftPoint();
        return new n.Bounds(t, t.add(this.getSize()))
    }, getPixelOrigin: function () {
        return this._initialTopLeftPoint
    }, getPanes: function () {
        return this._panes
    }, getContainer: function () {
        return this._container
    }, getZoomScale: function (t) {
        var e = this.options.crs;
        return e.scale(t) / e.scale(this._zoom)
    }, getScaleZoom: function (t) {
        return this._zoom + Math.log(t) / Math.LN2
    }, project: function (t, e) {
        return e = e === i ? this._zoom : e, this.options.crs.latLngToPoint(n.latLng(t), e)
    }, unproject: function (t, e) {
        return e = e === i ? this._zoom : e, this.options.crs.pointToLatLng(n.point(t), e)
    }, layerPointToLatLng: function (t) {
        var e = n.point(t).add(this._initialTopLeftPoint);
        return this.unproject(e)
    }, latLngToLayerPoint: function (t) {
        var e = this.project(n.latLng(t))._round();
        return e._subtract(this._initialTopLeftPoint)
    }, containerPointToLayerPoint: function (t) {
        return n.point(t).subtract(this._getMapPanePos())
    }, layerPointToContainerPoint: function (t) {
        return n.point(t).add(this._getMapPanePos())
    }, containerPointToLatLng: function (t) {
        var e = this.containerPointToLayerPoint(n.point(t));
        return this.layerPointToLatLng(e)
    }, latLngToContainerPoint: function (t) {
        return this.layerPointToContainerPoint(this.latLngToLayerPoint(n.latLng(t)))
    }, mouseEventToContainerPoint: function (t) {
        return n.DomEvent.getMousePosition(t, this._container)
    }, mouseEventToLayerPoint: function (t) {
        return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t))
    }, mouseEventToLatLng: function (t) {
        return this.layerPointToLatLng(this.mouseEventToLayerPoint(t))
    }, _initContainer: function (t) {
        var e = this._container = n.DomUtil.get(t);
        if (e._leaflet)throw Error("Map container is already initialized.");
        e._leaflet = !0
    }, _initLayout: function () {
        var t = this._container;
        n.DomUtil.addClass(t, "leaflet-container"), n.Browser.touch && n.DomUtil.addClass(t, "leaflet-touch"), this.options.fadeAnimation && n.DomUtil.addClass(t, "leaflet-fade-anim");
        var e = n.DomUtil.getStyle(t, "position");
        "absolute" !== e && "relative" !== e && "fixed" !== e && (t.style.position = "relative"), this._initPanes(), this._initControlPos && this._initControlPos()
    }, _initPanes: function () {
        var t = this._panes = {};
        this._mapPane = t.mapPane = this._createPane("leaflet-map-pane", this._container), this._tilePane = t.tilePane = this._createPane("leaflet-tile-pane", this._mapPane), t.objectsPane = this._createPane("leaflet-objects-pane", this._mapPane), t.shadowPane = this._createPane("leaflet-shadow-pane"), t.overlayPane = this._createPane("leaflet-overlay-pane"), t.markerPane = this._createPane("leaflet-marker-pane"), t.popupPane = this._createPane("leaflet-popup-pane");
        var e = " leaflet-zoom-hide";
        this.options.markerZoomAnimation || (n.DomUtil.addClass(t.markerPane, e), n.DomUtil.addClass(t.shadowPane, e), n.DomUtil.addClass(t.popupPane, e))
    }, _createPane: function (t, e) {
        return n.DomUtil.create("div", t, e || this._panes.objectsPane)
    }, _initLayers: function (t) {
        t = t ? n.Util.isArray(t) ? t : [t] : [], this._layers = {}, this._zoomBoundLayers = {}, this._tileLayersNum = 0;
        var e, i;
        for (e = 0, i = t.length; i > e; e++)this.addLayer(t[e])
    }, _resetView: function (t, e, i, o) {
        var s = this._zoom !== e;
        o || (this.fire("movestart"), s && this.fire("zoomstart")), this._zoom = e, this._initialTopLeftPoint = this._getNewTopLeftPoint(t), i ? this._initialTopLeftPoint._add(this._getMapPanePos()) : n.DomUtil.setPosition(this._mapPane, new n.Point(0, 0)), this._tileLayersToLoad = this._tileLayersNum;
        var a = !this._loaded;
        this._loaded = !0, this.fire("viewreset", {hard: !i}), this.fire("move"), (s || o) && this.fire("zoomend"), this.fire("moveend", {hard: !i}), a && this.fire("load")
    }, _rawPanBy: function (t) {
        n.DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(t))
    }, _updateZoomLevels: function () {
        var t, e = 1 / 0, n = -1 / 0;
        for (t in this._zoomBoundLayers)if (this._zoomBoundLayers.hasOwnProperty(t)) {
            var o = this._zoomBoundLayers[t];
            isNaN(o.options.minZoom) || (e = Math.min(e, o.options.minZoom)), isNaN(o.options.maxZoom) || (n = Math.max(n, o.options.maxZoom))
        }
        t === i ? this._layersMaxZoom = this._layersMinZoom = i : (this._layersMaxZoom = n, this._layersMinZoom = e)
    }, _initEvents: function () {
        if (n.DomEvent) {
            n.DomEvent.on(this._container, "click", this._onMouseClick, this);
            var e, i, o = ["dblclick", "mousedown", "mouseup", "mouseenter", "mouseleave", "mousemove", "contextmenu"];
            for (e = 0, i = o.length; i > e; e++)n.DomEvent.on(this._container, o[e], this._fireMouseEvent, this);
            this.options.trackResize && n.DomEvent.on(t, "resize", this._onResize, this)
        }
    }, _onResize: function () {
        n.Util.cancelAnimFrame(this._resizeRequest), this._resizeRequest = n.Util.requestAnimFrame(this.invalidateSize, this, !1, this._container)
    }, _onMouseClick: function (t) {
        !this._loaded || this.dragging && this.dragging.moved() || (this.fire("preclick"), this._fireMouseEvent(t))
    }, _fireMouseEvent: function (t) {
        if (this._loaded) {
            var e = t.type;
            if (e = "mouseenter" === e ? "mouseover" : "mouseleave" === e ? "mouseout" : e, this.hasEventListeners(e)) {
                "contextmenu" === e && n.DomEvent.preventDefault(t);
                var i = this.mouseEventToContainerPoint(t), o = this.containerPointToLayerPoint(i), s = this.layerPointToLatLng(o);
                this.fire(e, {latlng: s, layerPoint: o, containerPoint: i, originalEvent: t})
            }
        }
    }, _onTileLayerLoad: function () {
        this._tileLayersToLoad--, this._tileLayersNum && !this._tileLayersToLoad && this._tileBg && (clearTimeout(this._clearTileBgTimer), this._clearTileBgTimer = setTimeout(n.bind(this._clearTileBg, this), 500))
    }, whenReady: function (t, e) {
        return this._loaded ? t.call(e || this, this) : this.on("load", t, e), this
    }, _getMapPanePos: function () {
        return n.DomUtil.getPosition(this._mapPane)
    }, _getTopLeftPoint: function () {
        if (!this._loaded)throw Error("Set map center and zoom first.");
        return this._initialTopLeftPoint.subtract(this._getMapPanePos())
    }, _getNewTopLeftPoint: function (t, e) {
        var i = this.getSize()._divideBy(2);
        return this.project(t, e)._subtract(i)._round()
    }, _latLngToNewLayerPoint: function (t, e, i) {
        var n = this._getNewTopLeftPoint(i, e).add(this._getMapPanePos());
        return this.project(t, e)._subtract(n)
    }, _getCenterLayerPoint: function () {
        return this.containerPointToLayerPoint(this.getSize()._divideBy(2))
    }, _getCenterOffset: function (t) {
        return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint())
    }, _limitZoom: function (t) {
        var e = this.getMinZoom(), i = this.getMaxZoom();
        return Math.max(e, Math.min(i, t))
    }}), n.map = function (t, e) {
        return new n.Map(t, e)
    }, n.Projection.Mercator = {MAX_LATITUDE: 85.0840591556, R_MINOR: 6356752.3142, R_MAJOR: 6378137, project: function (t) {
        var e = n.LatLng.DEG_TO_RAD, i = this.MAX_LATITUDE, o = Math.max(Math.min(i, t.lat), -i), s = this.R_MAJOR, a = this.R_MINOR, r = t.lng * e * s, h = o * e, l = a / s, u = Math.sqrt(1 - l * l), c = u * Math.sin(h);
        c = Math.pow((1 - c) / (1 + c), .5 * u);
        var _ = Math.tan(.5 * (.5 * Math.PI - h)) / c;
        return h = -a * Math.log(_), new n.Point(r, h)
    }, unproject: function (t) {
        for (var e, i = n.LatLng.RAD_TO_DEG, o = this.R_MAJOR, s = this.R_MINOR, a = t.x * i / o, r = s / o, h = Math.sqrt(1 - r * r), l = Math.exp(-t.y / s), u = Math.PI / 2 - 2 * Math.atan(l), c = 15, _ = 1e-7, d = c, p = .1; Math.abs(p) > _ && --d > 0;)e = h * Math.sin(u), p = Math.PI / 2 - 2 * Math.atan(l * Math.pow((1 - e) / (1 + e), .5 * h)) - u, u += p;
        return new n.LatLng(u * i, a)
    }}, n.CRS.EPSG3395 = n.extend({}, n.CRS, {code: "EPSG:3395", projection: n.Projection.Mercator, transformation: function () {
        var t = n.Projection.Mercator, e = t.R_MAJOR, i = t.R_MINOR;
        return new n.Transformation(.5 / (Math.PI * e), .5, -.5 / (Math.PI * i), .5)
    }()}), n.TileLayer = n.Class.extend({includes: n.Mixin.Events, options: {minZoom: 0, maxZoom: 18, tileSize: 256, subdomains: "abc", errorTileUrl: "", attribution: "", zoomOffset: 0, opacity: 1, unloadInvisibleTiles: n.Browser.mobile, updateWhenIdle: n.Browser.mobile}, initialize: function (t, e) {
        e = n.setOptions(this, e), e.detectRetina && n.Browser.retina && e.maxZoom > 0 && (e.tileSize = Math.floor(e.tileSize / 2), e.zoomOffset++, e.minZoom > 0 && e.minZoom--, this.options.maxZoom--), this._url = t;
        var i = this.options.subdomains;
        "string" == typeof i && (this.options.subdomains = i.split(""))
    }, onAdd: function (t) {
        this._map = t, this._initContainer(), this._createTileProto(), t.on({viewreset: this._resetCallback, moveend: this._update}, this), this.options.updateWhenIdle || (this._limitedUpdate = n.Util.limitExecByInterval(this._update, 150, this), t.on("move", this._limitedUpdate, this)), this._reset(), this._update()
    }, addTo: function (t) {
        return t.addLayer(this), this
    }, onRemove: function (t) {
        this._container.parentNode.removeChild(this._container), t.off({viewreset: this._resetCallback, moveend: this._update}, this), this.options.updateWhenIdle || t.off("move", this._limitedUpdate, this), this._container = null, this._map = null
    }, bringToFront: function () {
        var t = this._map._panes.tilePane;
        return this._container && (t.appendChild(this._container), this._setAutoZIndex(t, Math.max)), this
    }, bringToBack: function () {
        var t = this._map._panes.tilePane;
        return this._container && (t.insertBefore(this._container, t.firstChild), this._setAutoZIndex(t, Math.min)), this
    }, getAttribution: function () {
        return this.options.attribution
    }, setOpacity: function (t) {
        return this.options.opacity = t, this._map && this._updateOpacity(), this
    }, setZIndex: function (t) {
        return this.options.zIndex = t, this._updateZIndex(), this
    }, setUrl: function (t, e) {
        return this._url = t, e || this.redraw(), this
    }, redraw: function () {
        return this._map && (this._map._panes.tilePane.empty = !1, this._reset(!0), this._update()), this
    }, _updateZIndex: function () {
        this._container && this.options.zIndex !== i && (this._container.style.zIndex = this.options.zIndex)
    }, _setAutoZIndex: function (t, e) {
        var i, n, o, s = t.children, a = -e(1 / 0, -1 / 0);
        for (n = 0, o = s.length; o > n; n++)s[n] !== this._container && (i = parseInt(s[n].style.zIndex, 10), isNaN(i) || (a = e(a, i)));
        this.options.zIndex = this._container.style.zIndex = (isFinite(a) ? a : 0) + e(1, -1)
    }, _updateOpacity: function () {
        n.DomUtil.setOpacity(this._container, this.options.opacity);
        var t, e = this._tiles;
        if (n.Browser.webkit)for (t in e)e.hasOwnProperty(t) && (e[t].style.webkitTransform += " translate(0,0)")
    }, _initContainer: function () {
        var t = this._map._panes.tilePane;
        (!this._container || t.empty) && (this._container = n.DomUtil.create("div", "leaflet-layer"), this._updateZIndex(), t.appendChild(this._container), 1 > this.options.opacity && this._updateOpacity())
    }, _resetCallback: function (t) {
        this._reset(t.hard)
    }, _reset: function (t) {
        var e = this._tiles;
        for (var i in e)e.hasOwnProperty(i) && this.fire("tileunload", {tile: e[i]});
        this._tiles = {}, this._tilesToLoad = 0, this.options.reuseTiles && (this._unusedTiles = []), t && this._container && (this._container.innerHTML = ""), this._initContainer()
    }, _update: function () {
        if (this._map) {
            var t = this._map.getPixelBounds(), e = this._map.getZoom(), i = this.options.tileSize;
            if (!(e > this.options.maxZoom || this.options.minZoom > e)) {
                var o = new n.Point(Math.floor(t.min.x / i), Math.floor(t.min.y / i)), s = new n.Point(Math.floor(t.max.x / i), Math.floor(t.max.y / i)), a = new n.Bounds(o, s);
                this._addTilesFromCenterOut(a), (this.options.unloadInvisibleTiles || this.options.reuseTiles) && this._removeOtherTiles(a)
            }
        }
    }, _addTilesFromCenterOut: function (t) {
        var i, o, s, a = [], r = t.getCenter();
        for (i = t.min.y; t.max.y >= i; i++)for (o = t.min.x; t.max.x >= o; o++)s = new n.Point(o, i), this._tileShouldBeLoaded(s) && a.push(s);
        var h = a.length;
        if (0 !== h) {
            a.sort(function (t, e) {
                return t.distanceTo(r) - e.distanceTo(r)
            });
            var l = e.createDocumentFragment();
            for (this._tilesToLoad || this.fire("loading"), this._tilesToLoad += h, o = 0; h > o; o++)this._addTile(a[o], l);
            this._container.appendChild(l)
        }
    }, _tileShouldBeLoaded: function (t) {
        if (t.x + ":" + t.y in this._tiles)return!1;
        if (!this.options.continuousWorld) {
            var e = this._getWrapTileNum();
            if (this.options.noWrap && (0 > t.x || t.x >= e) || 0 > t.y || t.y >= e)return!1
        }
        return!0
    }, _removeOtherTiles: function (t) {
        var e, i, n, o;
        for (o in this._tiles)this._tiles.hasOwnProperty(o) && (e = o.split(":"), i = parseInt(e[0], 10), n = parseInt(e[1], 10), (t.min.x > i || i > t.max.x || t.min.y > n || n > t.max.y) && this._removeTile(o))
    }, _removeTile: function (t) {
        var e = this._tiles[t];
        this.fire("tileunload", {tile: e, url: e.src}), this.options.reuseTiles ? (n.DomUtil.removeClass(e, "leaflet-tile-loaded"), this._unusedTiles.push(e)) : e.parentNode === this._container && this._container.removeChild(e), n.Browser.android || (e.src = n.Util.emptyImageUrl), delete this._tiles[t]
    }, _addTile: function (t, e) {
        var i = this._getTilePos(t), o = this._getTile();
        n.DomUtil.setPosition(o, i, n.Browser.chrome || n.Browser.android23), this._tiles[t.x + ":" + t.y] = o, this._loadTile(o, t), o.parentNode !== this._container && e.appendChild(o)
    }, _getZoomForUrl: function () {
        var t = this.options, e = this._map.getZoom();
        return t.zoomReverse && (e = t.maxZoom - e), e + t.zoomOffset
    }, _getTilePos: function (t) {
        var e = this._map.getPixelOrigin(), i = this.options.tileSize;
        return t.multiplyBy(i).subtract(e)
    }, getTileUrl: function (t) {
        return this._adjustTilePoint(t), n.Util.template(this._url, n.extend({s: this._getSubdomain(t), z: this._getZoomForUrl(), x: t.x, y: t.y}, this.options))
    }, _getWrapTileNum: function () {
        return Math.pow(2, this._getZoomForUrl())
    }, _adjustTilePoint: function (t) {
        var e = this._getWrapTileNum();
        this.options.continuousWorld || this.options.noWrap || (t.x = (t.x % e + e) % e), this.options.tms && (t.y = e - t.y - 1)
    }, _getSubdomain: function (t) {
        var e = (t.x + t.y) % this.options.subdomains.length;
        return this.options.subdomains[e]
    }, _createTileProto: function () {
        var t = this._tileImg = n.DomUtil.create("img", "leaflet-tile");
        t.style.width = t.style.height = this.options.tileSize + "px", t.galleryimg = "no"
    }, _getTile: function () {
        if (this.options.reuseTiles && this._unusedTiles.length > 0) {
            var t = this._unusedTiles.pop();
            return this._resetTile(t), t
        }
        return this._createTile()
    }, _resetTile: function () {
    }, _createTile: function () {
        var t = this._tileImg.cloneNode(!1);
        return t.onselectstart = t.onmousemove = n.Util.falseFn, t
    }, _loadTile: function (t, e) {
        t._layer = this, t.onload = this._tileOnLoad, t.onerror = this._tileOnError, t.src = this.getTileUrl(e)
    }, _tileLoaded: function () {
        this._tilesToLoad--, this._tilesToLoad || this.fire("load")
    }, _tileOnLoad: function () {
        var t = this._layer;
        this.src !== n.Util.emptyImageUrl && (n.DomUtil.addClass(this, "leaflet-tile-loaded"), t.fire("tileload", {tile: this, url: this.src})), t._tileLoaded()
    }, _tileOnError: function () {
        var t = this._layer;
        t.fire("tileerror", {tile: this, url: this.src});
        var e = t.options.errorTileUrl;
        e && (this.src = e), t._tileLoaded()
    }}), n.tileLayer = function (t, e) {
        return new n.TileLayer(t, e)
    }, n.TileLayer.WMS = n.TileLayer.extend({defaultWmsParams: {service: "WMS", request: "GetMap", version: "1.1.1", layers: "", styles: "", format: "image/jpeg", transparent: !1}, initialize: function (t, e) {
        this._url = t;
        var i = n.extend({}, this.defaultWmsParams);
        i.width = i.height = e.detectRetina && n.Browser.retina ? 2 * this.options.tileSize : this.options.tileSize;
        for (var o in e)this.options.hasOwnProperty(o) || (i[o] = e[o]);
        this.wmsParams = i, n.setOptions(this, e)
    }, onAdd: function (t) {
        var e = parseFloat(this.wmsParams.version) >= 1.3 ? "crs" : "srs";
        this.wmsParams[e] = t.options.crs.code, n.TileLayer.prototype.onAdd.call(this, t)
    }, getTileUrl: function (t, e) {
        this._adjustTilePoint(t);
        var i = this._map, o = i.options.crs, s = this.options.tileSize, a = t.multiplyBy(s), r = a.add(new n.Point(s, s)), h = o.project(i.unproject(a, e)), l = o.project(i.unproject(r, e)), u = [h.x, l.y, l.x, h.y].join(","), c = n.Util.template(this._url, {s: this._getSubdomain(t)});
        return c + n.Util.getParamString(this.wmsParams, c) + "&bbox=" + u
    }, setParams: function (t, e) {
        return n.extend(this.wmsParams, t), e || this.redraw(), this
    }}), n.tileLayer.wms = function (t, e) {
        return new n.TileLayer.WMS(t, e)
    }, n.TileLayer.Canvas = n.TileLayer.extend({options: {async: !1}, initialize: function (t) {
        n.setOptions(this, t)
    }, redraw: function () {
        var t = this._tiles;
        for (var e in t)t.hasOwnProperty(e) && this._redrawTile(t[e])
    }, _redrawTile: function (t) {
        this.drawTile(t, t._tilePoint, this._map._zoom)
    }, _createTileProto: function () {
        var t = this._canvasProto = n.DomUtil.create("canvas", "leaflet-tile");
        t.width = t.height = this.options.tileSize
    }, _createTile: function () {
        var t = this._canvasProto.cloneNode(!1);
        return t.onselectstart = t.onmousemove = n.Util.falseFn, t
    }, _loadTile: function (t, e) {
        t._layer = this, t._tilePoint = e, this._redrawTile(t), this.options.async || this.tileDrawn(t)
    }, drawTile: function () {
    }, tileDrawn: function (t) {
        this._tileOnLoad.call(t)
    }}), n.tileLayer.canvas = function (t) {
        return new n.TileLayer.Canvas(t)
    }, n.ImageOverlay = n.Class.extend({includes: n.Mixin.Events, options: {opacity: 1}, initialize: function (t, e, i) {
        this._url = t, this._bounds = n.latLngBounds(e), n.setOptions(this, i)
    }, onAdd: function (t) {
        this._map = t, this._image || this._initImage(), t._panes.overlayPane.appendChild(this._image), t.on("viewreset", this._reset, this), t.options.zoomAnimation && n.Browser.any3d && t.on("zoomanim", this._animateZoom, this), this._reset()
    }, onRemove: function (t) {
        t.getPanes().overlayPane.removeChild(this._image), t.off("viewreset", this._reset, this), t.options.zoomAnimation && t.off("zoomanim", this._animateZoom, this)
    }, addTo: function (t) {
        return t.addLayer(this), this
    }, setOpacity: function (t) {
        return this.options.opacity = t, this._updateOpacity(), this
    }, bringToFront: function () {
        return this._image && this._map._panes.overlayPane.appendChild(this._image), this
    }, bringToBack: function () {
        var t = this._map._panes.overlayPane;
        return this._image && t.insertBefore(this._image, t.firstChild), this
    }, _initImage: function () {
        this._image = n.DomUtil.create("img", "leaflet-image-layer"), this._map.options.zoomAnimation && n.Browser.any3d ? n.DomUtil.addClass(this._image, "leaflet-zoom-animated") : n.DomUtil.addClass(this._image, "leaflet-zoom-hide"), this._updateOpacity(), n.extend(this._image, {galleryimg: "no", onselectstart: n.Util.falseFn, onmousemove: n.Util.falseFn, onload: n.bind(this._onImageLoad, this), src: this._url})
    }, _animateZoom: function (t) {
        var e = this._map, i = this._image, o = e.getZoomScale(t.zoom), s = this._bounds.getNorthWest(), a = this._bounds.getSouthEast(), r = e._latLngToNewLayerPoint(s, t.zoom, t.center), h = e._latLngToNewLayerPoint(a, t.zoom, t.center)._subtract(r), l = r._add(h._multiplyBy(.5 * (1 - 1 / o)));
        i.style[n.DomUtil.TRANSFORM] = n.DomUtil.getTranslateString(l) + " scale(" + o + ") "
    }, _reset: function () {
        var t = this._image, e = this._map.latLngToLayerPoint(this._bounds.getNorthWest()), i = this._map.latLngToLayerPoint(this._bounds.getSouthEast())._subtract(e);
        n.DomUtil.setPosition(t, e), t.style.width = i.x + "px", t.style.height = i.y + "px"
    }, _onImageLoad: function () {
        this.fire("load")
    }, _updateOpacity: function () {
        n.DomUtil.setOpacity(this._image, this.options.opacity)
    }}), n.imageOverlay = function (t, e, i) {
        return new n.ImageOverlay(t, e, i)
    }, n.Icon = n.Class.extend({options: {className: ""}, initialize: function (t) {
        n.setOptions(this, t)
    }, createIcon: function () {
        return this._createIcon("icon")
    }, createShadow: function () {
        return this._createIcon("shadow")
    }, _createIcon: function (t) {
        var e = this._getIconUrl(t);
        if (!e) {
            if ("icon" === t)throw Error("iconUrl not set in Icon options (see the docs).");
            return null
        }
        var i = this._createImg(e);
        return this._setIconStyles(i, t), i
    }, _setIconStyles: function (t, e) {
        var i, o = this.options, s = n.point(o[e + "Size"]);
        i = "shadow" === e ? n.point(o.shadowAnchor || o.iconAnchor) : n.point(o.iconAnchor), !i && s && (i = s.divideBy(2, !0)), t.className = "leaflet-marker-" + e + " " + o.className, i && (t.style.marginLeft = -i.x + "px", t.style.marginTop = -i.y + "px"), s && (t.style.width = s.x + "px", t.style.height = s.y + "px")
    }, _createImg: function (t) {
        var i;
        return n.Browser.ie6 ? (i = e.createElement("div"), i.style.filter = 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + t + '")') : (i = e.createElement("img"), i.src = t), i
    }, _getIconUrl: function (t) {
        return n.Browser.retina && this.options[t + "RetinaUrl"] ? this.options[t + "RetinaUrl"] : this.options[t + "Url"]
    }}), n.icon = function (t) {
        return new n.Icon(t)
    }, n.Icon.Default = n.Icon.extend({options: {iconSize: new n.Point(25, 41), iconAnchor: new n.Point(12, 41), popupAnchor: new n.Point(1, -34), shadowSize: new n.Point(41, 41)}, _getIconUrl: function (t) {
        var e = t + "Url";
        if (this.options[e])return this.options[e];
        n.Browser.retina && "icon" === t && (t += "@2x");
        var i = n.Icon.Default.imagePath;
        if (!i)throw Error("Couldn't autodetect L.Icon.Default.imagePath, set it manually.");
        return i + "/marker-" + t + ".png"
    }}), n.Icon.Default.imagePath = function () {
        var t, i, n, o, s = e.getElementsByTagName("script"), a = /\/?leaflet[\-\._]?([\w\-\._]*)\.js\??/;
        for (t = 0, i = s.length; i > t; t++)if (n = s[t].src, o = n.match(a))return n.split(a)[0] + "/images"
    }(), n.Marker = n.Class.extend({includes: n.Mixin.Events, options: {icon: new n.Icon.Default, title: "", clickable: !0, draggable: !1, zIndexOffset: 0, opacity: 1, riseOnHover: !1, riseOffset: 250}, initialize: function (t, e) {
        n.setOptions(this, e), this._latlng = n.latLng(t)
    }, onAdd: function (t) {
        this._map = t, t.on("viewreset", this.update, this), this._initIcon(), this.update(), t.options.zoomAnimation && t.options.markerZoomAnimation && t.on("zoomanim", this._animateZoom, this)
    }, addTo: function (t) {
        return t.addLayer(this), this
    }, onRemove: function (t) {
        this._removeIcon(), this.fire("remove"), t.off({viewreset: this.update, zoomanim: this._animateZoom}, this), this._map = null
    }, getLatLng: function () {
        return this._latlng
    }, setLatLng: function (t) {
        return this._latlng = n.latLng(t), this.update(), this.fire("move", {latlng: this._latlng})
    }, setZIndexOffset: function (t) {
        return this.options.zIndexOffset = t, this.update(), this
    }, setIcon: function (t) {
        return this._map && this._removeIcon(), this.options.icon = t, this._map && (this._initIcon(), this.update()), this
    }, update: function () {
        if (this._icon) {
            var t = this._map.latLngToLayerPoint(this._latlng).round();
            this._setPos(t)
        }
        return this
    }, _initIcon: function () {
        var t = this.options, e = this._map, i = e.options.zoomAnimation && e.options.markerZoomAnimation, o = i ? "leaflet-zoom-animated" : "leaflet-zoom-hide", s = !1;
        this._icon || (this._icon = t.icon.createIcon(), t.title && (this._icon.title = t.title), this._initInteraction(), s = 1 > this.options.opacity, n.DomUtil.addClass(this._icon, o), t.riseOnHover && n.DomEvent.on(this._icon, "mouseover", this._bringToFront, this).on(this._icon, "mouseout", this._resetZIndex, this)), this._shadow || (this._shadow = t.icon.createShadow(), this._shadow && (n.DomUtil.addClass(this._shadow, o), s = 1 > this.options.opacity)), s && this._updateOpacity();
        var a = this._map._panes;
        a.markerPane.appendChild(this._icon), this._shadow && a.shadowPane.appendChild(this._shadow)
    }, _removeIcon: function () {
        var t = this._map._panes;
        this.options.riseOnHover && n.DomEvent.off(this._icon, "mouseover", this._bringToFront).off(this._icon, "mouseout", this._resetZIndex), t.markerPane.removeChild(this._icon), this._shadow && t.shadowPane.removeChild(this._shadow), this._icon = this._shadow = null
    }, _setPos: function (t) {
        n.DomUtil.setPosition(this._icon, t), this._shadow && n.DomUtil.setPosition(this._shadow, t), this._zIndex = t.y + this.options.zIndexOffset, this._resetZIndex()
    }, _updateZIndex: function (t) {
        this._icon.style.zIndex = this._zIndex + t
    }, _animateZoom: function (t) {
        var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center);
        this._setPos(e)
    }, _initInteraction: function () {
        if (this.options.clickable) {
            var t = this._icon, e = ["dblclick", "mousedown", "mouseover", "mouseout", "contextmenu"];
            n.DomUtil.addClass(t, "leaflet-clickable"), n.DomEvent.on(t, "click", this._onMouseClick, this);
            for (var i = 0; e.length > i; i++)n.DomEvent.on(t, e[i], this._fireMouseEvent, this);
            n.Handler.MarkerDrag && (this.dragging = new n.Handler.MarkerDrag(this), this.options.draggable && this.dragging.enable())
        }
    }, _onMouseClick: function (t) {
        var e = this.dragging && this.dragging.moved();
        (this.hasEventListeners(t.type) || e) && n.DomEvent.stopPropagation(t), e || (this.dragging && this.dragging._enabled || !this._map.dragging || !this._map.dragging.moved()) && this.fire(t.type, {originalEvent: t})
    }, _fireMouseEvent: function (t) {
        this.fire(t.type, {originalEvent: t}), "contextmenu" === t.type && this.hasEventListeners(t.type) && n.DomEvent.preventDefault(t), "mousedown" !== t.type && n.DomEvent.stopPropagation(t)
    }, setOpacity: function (t) {
        this.options.opacity = t, this._map && this._updateOpacity()
    }, _updateOpacity: function () {
        n.DomUtil.setOpacity(this._icon, this.options.opacity), this._shadow && n.DomUtil.setOpacity(this._shadow, this.options.opacity)
    }, _bringToFront: function () {
        this._updateZIndex(this.options.riseOffset)
    }, _resetZIndex: function () {
        this._updateZIndex(0)
    }}), n.marker = function (t, e) {
        return new n.Marker(t, e)
    }, n.DivIcon = n.Icon.extend({options: {iconSize: new n.Point(12, 12), className: "leaflet-div-icon"}, createIcon: function () {
        var t = e.createElement("div"), i = this.options;
        return i.html && (t.innerHTML = i.html), i.bgPos && (t.style.backgroundPosition = -i.bgPos.x + "px " + -i.bgPos.y + "px"), this._setIconStyles(t, "icon"), t
    }, createShadow: function () {
        return null
    }}), n.divIcon = function (t) {
        return new n.DivIcon(t)
    }, n.Map.mergeOptions({closePopupOnClick: !0}), n.Popup = n.Class.extend({includes: n.Mixin.Events, options: {minWidth: 50, maxWidth: 300, maxHeight: null, autoPan: !0, closeButton: !0, offset: new n.Point(0, 6), autoPanPadding: new n.Point(5, 5), className: "", zoomAnimation: !0}, initialize: function (t, e) {
        n.setOptions(this, t), this._source = e, this._animated = n.Browser.any3d && this.options.zoomAnimation
    }, onAdd: function (t) {
        this._map = t, this._container || this._initLayout(), this._updateContent();
        var e = t.options.fadeAnimation;
        e && n.DomUtil.setOpacity(this._container, 0), t._panes.popupPane.appendChild(this._container), t.on("viewreset", this._updatePosition, this), this._animated && t.on("zoomanim", this._zoomAnimation, this), t.options.closePopupOnClick && t.on("preclick", this._close, this), this._update(), e && n.DomUtil.setOpacity(this._container, 1)
    }, addTo: function (t) {
        return t.addLayer(this), this
    }, openOn: function (t) {
        return t.openPopup(this), this
    }, onRemove: function (t) {
        t._panes.popupPane.removeChild(this._container), n.Util.falseFn(this._container.offsetWidth), t.off({viewreset: this._updatePosition, preclick: this._close, zoomanim: this._zoomAnimation}, this), t.options.fadeAnimation && n.DomUtil.setOpacity(this._container, 0), this._map = null
    }, setLatLng: function (t) {
        return this._latlng = n.latLng(t), this._update(), this
    }, setContent: function (t) {
        return this._content = t, this._update(), this
    }, _close: function () {
        var t = this._map;
        t && (t._popup = null, t.removeLayer(this).fire("popupclose", {popup: this}))
    }, _initLayout: function () {
        var t, e = "leaflet-popup", i = e + " " + this.options.className + " leaflet-zoom-" + (this._animated ? "animated" : "hide"), o = this._container = n.DomUtil.create("div", i);
        this.options.closeButton && (t = this._closeButton = n.DomUtil.create("a", e + "-close-button", o), t.href = "#close", t.innerHTML = "&#215;", n.DomEvent.on(t, "click", this._onCloseButtonClick, this));
        var s = this._wrapper = n.DomUtil.create("div", e + "-content-wrapper", o);
        n.DomEvent.disableClickPropagation(s), this._contentNode = n.DomUtil.create("div", e + "-content", s), n.DomEvent.on(this._contentNode, "mousewheel", n.DomEvent.stopPropagation), this._tipContainer = n.DomUtil.create("div", e + "-tip-container", o), this._tip = n.DomUtil.create("div", e + "-tip", this._tipContainer)
    }, _update: function () {
        this._map && (this._container.style.visibility = "hidden", this._updateContent(), this._updateLayout(), this._updatePosition(), this._container.style.visibility = "", this._adjustPan())
    }, _updateContent: function () {
        if (this._content) {
            if ("string" == typeof this._content)this._contentNode.innerHTML = this._content; else {
                for (; this._contentNode.hasChildNodes();)this._contentNode.removeChild(this._contentNode.firstChild);
                this._contentNode.appendChild(this._content)
            }
            this.fire("contentupdate")
        }
    }, _updateLayout: function () {
        var t = this._contentNode, e = t.style;
        e.width = "", e.whiteSpace = "nowrap";
        var i = t.offsetWidth;
        i = Math.min(i, this.options.maxWidth), i = Math.max(i, this.options.minWidth), e.width = i + 1 + "px", e.whiteSpace = "", e.height = "";
        var o = t.offsetHeight, s = this.options.maxHeight, a = "leaflet-popup-scrolled";
        s && o > s ? (e.height = s + "px", n.DomUtil.addClass(t, a)) : n.DomUtil.removeClass(t, a), this._containerWidth = this._container.offsetWidth
    }, _updatePosition: function () {
        if (this._map) {
            var t = this._map.latLngToLayerPoint(this._latlng), e = this._animated, i = this.options.offset;
            e && n.DomUtil.setPosition(this._container, t), this._containerBottom = -i.y - (e ? 0 : t.y), this._containerLeft = -Math.round(this._containerWidth / 2) + i.x + (e ? 0 : t.x), this._container.style.bottom = this._containerBottom + "px", this._container.style.left = this._containerLeft + "px"
        }
    }, _zoomAnimation: function (t) {
        var e = this._map._latLngToNewLayerPoint(this._latlng, t.zoom, t.center);
        n.DomUtil.setPosition(this._container, e)
    }, _adjustPan: function () {
        if (this.options.autoPan) {
            var t = this._map, e = this._container.offsetHeight, i = this._containerWidth, o = new n.Point(this._containerLeft, -e - this._containerBottom);
            this._animated && o._add(n.DomUtil.getPosition(this._container));
            var s = t.layerPointToContainerPoint(o), a = this.options.autoPanPadding, r = t.getSize(), h = 0, l = 0;
            0 > s.x && (h = s.x - a.x), s.x + i > r.x && (h = s.x + i - r.x + a.x), 0 > s.y && (l = s.y - a.y), s.y + e > r.y && (l = s.y + e - r.y + a.y), (h || l) && t.panBy(new n.Point(h, l))
        }
    }, _onCloseButtonClick: function (t) {
        this._close(), n.DomEvent.stop(t)
    }}), n.popup = function (t, e) {
        return new n.Popup(t, e)
    }, n.Marker.include({openPopup: function () {
        return this._popup && this._map && (this._popup.setLatLng(this._latlng), this._map.openPopup(this._popup)), this
    }, closePopup: function () {
        return this._popup && this._popup._close(), this
    }, bindPopup: function (t, e) {
        var i = n.point(this.options.icon.options.popupAnchor) || new n.Point(0, 0);
        return i = i.add(n.Popup.prototype.options.offset), e && e.offset && (i = i.add(e.offset)), e = n.extend({offset: i}, e), this._popup || this.on("click", this.openPopup, this).on("remove", this.closePopup, this).on("move", this._movePopup, this), this._popup = new n.Popup(e, this).setContent(t), this
    }, unbindPopup: function () {
        return this._popup && (this._popup = null, this.off("click", this.openPopup).off("remove", this.closePopup).off("move", this._movePopup)), this
    }, _movePopup: function (t) {
        this._popup.setLatLng(t.latlng)
    }}), n.Map.include({openPopup: function (t) {
        return this.closePopup(), this._popup = t, this.addLayer(t).fire("popupopen", {popup: this._popup})
    }, closePopup: function () {
        return this._popup && this._popup._close(), this
    }}), n.LayerGroup = n.Class.extend({initialize: function (t) {
        this._layers = {};
        var e, i;
        if (t)for (e = 0, i = t.length; i > e; e++)this.addLayer(t[e])
    }, addLayer: function (t) {
        var e = n.stamp(t);
        return this._layers[e] = t, this._map && this._map.addLayer(t), this
    }, removeLayer: function (t) {
        var e = n.stamp(t);
        return delete this._layers[e], this._map && this._map.removeLayer(t), this
    }, clearLayers: function () {
        return this.eachLayer(this.removeLayer, this), this
    }, invoke: function (t) {
        var e, i, n = Array.prototype.slice.call(arguments, 1);
        for (e in this._layers)this._layers.hasOwnProperty(e) && (i = this._layers[e], i[t] && i[t].apply(i, n));
        return this
    }, onAdd: function (t) {
        this._map = t, this.eachLayer(t.addLayer, t)
    }, onRemove: function (t) {
        this.eachLayer(t.removeLayer, t), this._map = null
    }, addTo: function (t) {
        return t.addLayer(this), this
    }, eachLayer: function (t, e) {
        for (var i in this._layers)this._layers.hasOwnProperty(i) && t.call(e, this._layers[i])
    }, setZIndex: function (t) {
        return this.invoke("setZIndex", t)
    }}), n.layerGroup = function (t) {
        return new n.LayerGroup(t)
    }, n.FeatureGroup = n.LayerGroup.extend({includes: n.Mixin.Events, statics: {EVENTS: "click dblclick mouseover mouseout mousemove contextmenu"}, addLayer: function (t) {
        return this._layers[n.stamp(t)] ? this : (t.on(n.FeatureGroup.EVENTS, this._propagateEvent, this), n.LayerGroup.prototype.addLayer.call(this, t), this._popupContent && t.bindPopup && t.bindPopup(this._popupContent, this._popupOptions), this.fire("layeradd", {layer: t}))
    }, removeLayer: function (t) {
        return t.off(n.FeatureGroup.EVENTS, this._propagateEvent, this), n.LayerGroup.prototype.removeLayer.call(this, t), this._popupContent && this.invoke("unbindPopup"), this.fire("layerremove", {layer: t})
    }, bindPopup: function (t, e) {
        return this._popupContent = t, this._popupOptions = e, this.invoke("bindPopup", t, e)
    }, setStyle: function (t) {
        return this.invoke("setStyle", t)
    }, bringToFront: function () {
        return this.invoke("bringToFront")
    }, bringToBack: function () {
        return this.invoke("bringToBack")
    }, getBounds: function () {
        var t = new n.LatLngBounds;
        return this.eachLayer(function (e) {
            t.extend(e instanceof n.Marker ? e.getLatLng() : e.getBounds())
        }), t
    }, _propagateEvent: function (t) {
        t.layer = t.target, t.target = this, this.fire(t.type, t)
    }}), n.featureGroup = function (t) {
        return new n.FeatureGroup(t)
    }, n.Path = n.Class.extend({includes: [n.Mixin.Events], statics: {CLIP_PADDING: n.Browser.mobile ? Math.max(0, Math.min(.5, (1280 / Math.max(t.innerWidth, t.innerHeight) - 1) / 2)) : .5}, options: {stroke: !0, color: "#0033ff", dashArray: null, weight: 5, opacity: .5, fill: !1, fillColor: null, fillOpacity: .2, clickable: !0}, initialize: function (t) {
        n.setOptions(this, t)
    }, onAdd: function (t) {
        this._map = t, this._container || (this._initElements(), this._initEvents()), this.projectLatlngs(), this._updatePath(), this._container && this._map._pathRoot.appendChild(this._container), this.fire("add"), t.on({viewreset: this.projectLatlngs, moveend: this._updatePath}, this)
    }, addTo: function (t) {
        return t.addLayer(this), this
    }, onRemove: function (t) {
        t._pathRoot.removeChild(this._container), this.fire("remove"), this._map = null, n.Browser.vml && (this._container = null, this._stroke = null, this._fill = null), t.off({viewreset: this.projectLatlngs, moveend: this._updatePath}, this)
    }, projectLatlngs: function () {
    }, setStyle: function (t) {
        return n.setOptions(this, t), this._container && this._updateStyle(), this
    }, redraw: function () {
        return this._map && (this.projectLatlngs(), this._updatePath()), this
    }}), n.Map.include({_updatePathViewport: function () {
        var t = n.Path.CLIP_PADDING, e = this.getSize(), i = n.DomUtil.getPosition(this._mapPane), o = i.multiplyBy(-1)._subtract(e.multiplyBy(t)._round()), s = o.add(e.multiplyBy(1 + 2 * t)._round());
        this._pathViewport = new n.Bounds(o, s)
    }}), n.Path.SVG_NS = "http://www.w3.org/2000/svg", n.Browser.svg = !(!e.createElementNS || !e.createElementNS(n.Path.SVG_NS, "svg").createSVGRect), n.Path = n.Path.extend({statics: {SVG: n.Browser.svg}, bringToFront: function () {
        var t = this._map._pathRoot, e = this._container;
        return e && t.lastChild !== e && t.appendChild(e), this
    }, bringToBack: function () {
        var t = this._map._pathRoot, e = this._container, i = t.firstChild;
        return e && i !== e && t.insertBefore(e, i), this
    }, getPathString: function () {
    }, _createElement: function (t) {
        return e.createElementNS(n.Path.SVG_NS, t)
    }, _initElements: function () {
        this._map._initPathRoot(), this._initPath(), this._initStyle()
    }, _initPath: function () {
        this._container = this._createElement("g"), this._path = this._createElement("path"), this._container.appendChild(this._path)
    }, _initStyle: function () {
        this.options.stroke && (this._path.setAttribute("stroke-linejoin", "round"), this._path.setAttribute("stroke-linecap", "round")), this.options.fill && this._path.setAttribute("fill-rule", "evenodd"), this._updateStyle()
    }, _updateStyle: function () {
        this.options.stroke ? (this._path.setAttribute("stroke", this.options.color), this._path.setAttribute("stroke-opacity", this.options.opacity), this._path.setAttribute("stroke-width", this.options.weight), this.options.dashArray ? this._path.setAttribute("stroke-dasharray", this.options.dashArray) : this._path.removeAttribute("stroke-dasharray")) : this._path.setAttribute("stroke", "none"), this.options.fill ? (this._path.setAttribute("fill", this.options.fillColor || this.options.color), this._path.setAttribute("fill-opacity", this.options.fillOpacity)) : this._path.setAttribute("fill", "none")
    }, _updatePath: function () {
        var t = this.getPathString();
        t || (t = "M0 0"), this._path.setAttribute("d", t)
    }, _initEvents: function () {
        if (this.options.clickable) {
            (n.Browser.svg || !n.Browser.vml) && this._path.setAttribute("class", "leaflet-clickable"), n.DomEvent.on(this._container, "click", this._onMouseClick, this);
            for (var t = ["dblclick", "mousedown", "mouseover", "mouseout", "mousemove", "contextmenu"], e = 0; t.length > e; e++)n.DomEvent.on(this._container, t[e], this._fireMouseEvent, this)
        }
    }, _onMouseClick: function (t) {
        this._map.dragging && this._map.dragging.moved() || this._fireMouseEvent(t)
    }, _fireMouseEvent: function (t) {
        if (this.hasEventListeners(t.type)) {
            var e = this._map, i = e.mouseEventToContainerPoint(t), o = e.containerPointToLayerPoint(i), s = e.layerPointToLatLng(o);
            this.fire(t.type, {latlng: s, layerPoint: o, containerPoint: i, originalEvent: t}), "contextmenu" === t.type && n.DomEvent.preventDefault(t), "mousemove" !== t.type && n.DomEvent.stopPropagation(t)
        }
    }}), n.Map.include({_initPathRoot: function () {
        this._pathRoot || (this._pathRoot = n.Path.prototype._createElement("svg"), this._panes.overlayPane.appendChild(this._pathRoot), this.options.zoomAnimation && n.Browser.any3d ? (this._pathRoot.setAttribute("class", " leaflet-zoom-animated"), this.on({zoomanim: this._animatePathZoom, zoomend: this._endPathZoom})) : this._pathRoot.setAttribute("class", " leaflet-zoom-hide"), this.on("moveend", this._updateSvgViewport), this._updateSvgViewport())
    }, _animatePathZoom: function (t) {
        var e = this.getZoomScale(t.zoom), i = this._getCenterOffset(t.center)._multiplyBy(-e)._add(this._pathViewport.min);
        this._pathRoot.style[n.DomUtil.TRANSFORM] = n.DomUtil.getTranslateString(i) + " scale(" + e + ") ", this._pathZooming = !0
    }, _endPathZoom: function () {
        this._pathZooming = !1
    }, _updateSvgViewport: function () {
        if (!this._pathZooming) {
            this._updatePathViewport();
            var t = this._pathViewport, e = t.min, i = t.max, o = i.x - e.x, s = i.y - e.y, a = this._pathRoot, r = this._panes.overlayPane;
            n.Browser.mobileWebkit && r.removeChild(a), n.DomUtil.setPosition(a, e), a.setAttribute("width", o), a.setAttribute("height", s), a.setAttribute("viewBox", [e.x, e.y, o, s].join(" ")), n.Browser.mobileWebkit && r.appendChild(a)
        }
    }}), n.Path.include({bindPopup: function (t, e) {
        return(!this._popup || e) && (this._popup = new n.Popup(e, this)), this._popup.setContent(t), this._popupHandlersAdded || (this.on("click", this._openPopup, this).on("remove", this.closePopup, this), this._popupHandlersAdded = !0), this
    }, unbindPopup: function () {
        return this._popup && (this._popup = null, this.off("click", this._openPopup).off("remove", this.closePopup), this._popupHandlersAdded = !1), this
    }, openPopup: function (t) {
        return this._popup && (t = t || this._latlng || this._latlngs[Math.floor(this._latlngs.length / 2)], this._openPopup({latlng: t})), this
    }, closePopup: function () {
        return this._popup && this._popup._close(), this
    }, _openPopup: function (t) {
        this._popup.setLatLng(t.latlng), this._map.openPopup(this._popup)
    }}), n.Browser.vml = !n.Browser.svg && function () {
        try {
            var t = e.createElement("div");
            t.innerHTML = '<v:shape adj="1"/>';
            var i = t.firstChild;
            return i.style.behavior = "url(#default#VML)", i && "object" == typeof i.adj
        } catch (n) {
            return!1
        }
    }(), n.Path = n.Browser.svg || !n.Browser.vml ? n.Path : n.Path.extend({statics: {VML: !0, CLIP_PADDING: .02}, _createElement: function () {
        try {
            return e.namespaces.add("lvml", "urn:schemas-microsoft-com:vml"), function (t) {
                return e.createElement("<lvml:" + t + ' class="lvml">')
            }
        } catch (t) {
            return function (t) {
                return e.createElement("<" + t + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">')
            }
        }
    }(), _initPath: function () {
        var t = this._container = this._createElement("shape");
        n.DomUtil.addClass(t, "leaflet-vml-shape"), this.options.clickable && n.DomUtil.addClass(t, "leaflet-clickable"), t.coordsize = "1 1", this._path = this._createElement("path"), t.appendChild(this._path), this._map._pathRoot.appendChild(t)
    }, _initStyle: function () {
        this._updateStyle()
    }, _updateStyle: function () {
        var t = this._stroke, e = this._fill, i = this.options, n = this._container;
        n.stroked = i.stroke, n.filled = i.fill, i.stroke ? (t || (t = this._stroke = this._createElement("stroke"), t.endcap = "round", n.appendChild(t)), t.weight = i.weight + "px", t.color = i.color, t.opacity = i.opacity, t.dashStyle = i.dashArray ? i.dashArray instanceof Array ? i.dashArray.join(" ") : i.dashArray.replace(/ *, */g, " ") : "") : t && (n.removeChild(t), this._stroke = null), i.fill ? (e || (e = this._fill = this._createElement("fill"), n.appendChild(e)), e.color = i.fillColor || i.color, e.opacity = i.fillOpacity) : e && (n.removeChild(e), this._fill = null)
    }, _updatePath: function () {
        var t = this._container.style;
        t.display = "none", this._path.v = this.getPathString() + " ", t.display = ""
    }}), n.Map.include(n.Browser.svg || !n.Browser.vml ? {} : {_initPathRoot: function () {
        if (!this._pathRoot) {
            var t = this._pathRoot = e.createElement("div");
            t.className = "leaflet-vml-container", this._panes.overlayPane.appendChild(t), this.on("moveend", this._updatePathViewport), this._updatePathViewport()
        }
    }}), n.Browser.canvas = function () {
        return!!e.createElement("canvas").getContext
    }(), n.Path = n.Path.SVG && !t.L_PREFER_CANVAS || !n.Browser.canvas ? n.Path : n.Path.extend({statics: {CANVAS: !0, SVG: !1}, redraw: function () {
        return this._map && (this.projectLatlngs(), this._requestUpdate()), this
    }, setStyle: function (t) {
        return n.setOptions(this, t), this._map && (this._updateStyle(), this._requestUpdate()), this
    }, onRemove: function (t) {
        t.off("viewreset", this.projectLatlngs, this).off("moveend", this._updatePath, this), this.options.clickable && this._map.off("click", this._onClick, this), this._requestUpdate(), this._map = null
    }, _requestUpdate: function () {
        this._map && !n.Path._updateRequest && (n.Path._updateRequest = n.Util.requestAnimFrame(this._fireMapMoveEnd, this._map))
    }, _fireMapMoveEnd: function () {
        n.Path._updateRequest = null, this.fire("moveend")
    }, _initElements: function () {
        this._map._initPathRoot(), this._ctx = this._map._canvasCtx
    }, _updateStyle: function () {
        var t = this.options;
        t.stroke && (this._ctx.lineWidth = t.weight, this._ctx.strokeStyle = t.color), t.fill && (this._ctx.fillStyle = t.fillColor || t.color)
    }, _drawPath: function () {
        var t, e, i, o, s, a;
        for (this._ctx.beginPath(), t = 0, i = this._parts.length; i > t; t++) {
            for (e = 0, o = this._parts[t].length; o > e; e++)s = this._parts[t][e], a = (0 === e ? "move" : "line") + "To", this._ctx[a](s.x, s.y);
            this instanceof n.Polygon && this._ctx.closePath()
        }
    }, _checkIfEmpty: function () {
        return!this._parts.length
    }, _updatePath: function () {
        if (!this._checkIfEmpty()) {
            var t = this._ctx, e = this.options;
            this._drawPath(), t.save(), this._updateStyle(), e.fill && (t.globalAlpha = e.fillOpacity, t.fill()), e.stroke && (t.globalAlpha = e.opacity, t.stroke()), t.restore()
        }
    }, _initEvents: function () {
        this.options.clickable && this._map.on("click", this._onClick, this)
    }, _onClick: function (t) {
        this._containsPoint(t.layerPoint) && this.fire("click", {latlng: t.latlng, layerPoint: t.layerPoint, containerPoint: t.containerPoint, originalEvent: t})
    }}), n.Map.include(n.Path.SVG && !t.L_PREFER_CANVAS || !n.Browser.canvas ? {} : {_initPathRoot: function () {
        var t, i = this._pathRoot;
        i || (i = this._pathRoot = e.createElement("canvas"), i.style.position = "absolute", t = this._canvasCtx = i.getContext("2d"), t.lineCap = "round", t.lineJoin = "round", this._panes.overlayPane.appendChild(i), this.options.zoomAnimation && (this._pathRoot.className = "leaflet-zoom-animated", this.on("zoomanim", this._animatePathZoom), this.on("zoomend", this._endPathZoom)), this.on("moveend", this._updateCanvasViewport), this._updateCanvasViewport())
    }, _updateCanvasViewport: function () {
        if (!this._pathZooming) {
            this._updatePathViewport();
            var t = this._pathViewport, e = t.min, i = t.max.subtract(e), o = this._pathRoot;
            n.DomUtil.setPosition(o, e), o.width = i.x, o.height = i.y, o.getContext("2d").translate(-e.x, -e.y)
        }
    }}), n.LineUtil = {simplify: function (t, e) {
        if (!e || !t.length)return t.slice();
        var i = e * e;
        return t = this._reducePoints(t, i), t = this._simplifyDP(t, i)
    }, pointToSegmentDistance: function (t, e, i) {
        return Math.sqrt(this._sqClosestPointOnSegment(t, e, i, !0))
    }, closestPointOnSegment: function (t, e, i) {
        return this._sqClosestPointOnSegment(t, e, i)
    }, _simplifyDP: function (t, e) {
        var n = t.length, o = typeof Uint8Array != i + "" ? Uint8Array : Array, s = new o(n);
        s[0] = s[n - 1] = 1, this._simplifyDPStep(t, s, e, 0, n - 1);
        var a, r = [];
        for (a = 0; n > a; a++)s[a] && r.push(t[a]);
        return r
    }, _simplifyDPStep: function (t, e, i, n, o) {
        var s, a, r, h = 0;
        for (a = n + 1; o - 1 >= a; a++)r = this._sqClosestPointOnSegment(t[a], t[n], t[o], !0), r > h && (s = a, h = r);
        h > i && (e[s] = 1, this._simplifyDPStep(t, e, i, n, s), this._simplifyDPStep(t, e, i, s, o))
    }, _reducePoints: function (t, e) {
        for (var i = [t[0]], n = 1, o = 0, s = t.length; s > n; n++)this._sqDist(t[n], t[o]) > e && (i.push(t[n]), o = n);
        return s - 1 > o && i.push(t[s - 1]), i
    }, clipSegment: function (t, e, i, n) {
        var o, s, a, r = n ? this._lastCode : this._getBitCode(t, i), h = this._getBitCode(e, i);
        for (this._lastCode = h; ;) {
            if (!(r | h))return[t, e];
            if (r & h)return!1;
            o = r || h, s = this._getEdgeIntersection(t, e, o, i), a = this._getBitCode(s, i), o === r ? (t = s, r = a) : (e = s, h = a)
        }
    }, _getEdgeIntersection: function (t, e, o, s) {
        var a = e.x - t.x, r = e.y - t.y, h = s.min, l = s.max;
        return 8 & o ? new n.Point(t.x + a * (l.y - t.y) / r, l.y) : 4 & o ? new n.Point(t.x + a * (h.y - t.y) / r, h.y) : 2 & o ? new n.Point(l.x, t.y + r * (l.x - t.x) / a) : 1 & o ? new n.Point(h.x, t.y + r * (h.x - t.x) / a) : i
    }, _getBitCode: function (t, e) {
        var i = 0;
        return t.x < e.min.x ? i |= 1 : t.x > e.max.x && (i |= 2), t.y < e.min.y ? i |= 4 : t.y > e.max.y && (i |= 8), i
    }, _sqDist: function (t, e) {
        var i = e.x - t.x, n = e.y - t.y;
        return i * i + n * n
    }, _sqClosestPointOnSegment: function (t, e, i, o) {
        var s, a = e.x, r = e.y, h = i.x - a, l = i.y - r, u = h * h + l * l;
        return u > 0 && (s = ((t.x - a) * h + (t.y - r) * l) / u, s > 1 ? (a = i.x, r = i.y) : s > 0 && (a += h * s, r += l * s)), h = t.x - a, l = t.y - r, o ? h * h + l * l : new n.Point(a, r)
    }}, n.Polyline = n.Path.extend({initialize: function (t, e) {
        n.Path.prototype.initialize.call(this, e), this._latlngs = this._convertLatLngs(t)
    }, options: {smoothFactor: 1, noClip: !1}, projectLatlngs: function () {
        this._originalPoints = [];
        for (var t = 0, e = this._latlngs.length; e > t; t++)this._originalPoints[t] = this._map.latLngToLayerPoint(this._latlngs[t])
    }, getPathString: function () {
        for (var t = 0, e = this._parts.length, i = ""; e > t; t++)i += this._getPathPartStr(this._parts[t]);
        return i
    }, getLatLngs: function () {
        return this._latlngs
    }, setLatLngs: function (t) {
        return this._latlngs = this._convertLatLngs(t), this.redraw()
    }, addLatLng: function (t) {
        return this._latlngs.push(n.latLng(t)), this.redraw()
    }, spliceLatLngs: function () {
        var t = [].splice.apply(this._latlngs, arguments);
        return this._convertLatLngs(this._latlngs), this.redraw(), t
    }, closestLayerPoint: function (t) {
        for (var e, i, o = 1 / 0, s = this._parts, a = null, r = 0, h = s.length; h > r; r++)for (var l = s[r], u = 1, c = l.length; c > u; u++) {
            e = l[u - 1], i = l[u];
            var _ = n.LineUtil._sqClosestPointOnSegment(t, e, i, !0);
            o > _ && (o = _, a = n.LineUtil._sqClosestPointOnSegment(t, e, i))
        }
        return a && (a.distance = Math.sqrt(o)), a
    }, getBounds: function () {
        var t, e, i = new n.LatLngBounds, o = this.getLatLngs();
        for (t = 0, e = o.length; e > t; t++)i.extend(o[t]);
        return i
    }, _convertLatLngs: function (t) {
        var e, i;
        for (e = 0, i = t.length; i > e; e++) {
            if (n.Util.isArray(t[e]) && "number" != typeof t[e][0])return;
            t[e] = n.latLng(t[e])
        }
        return t
    }, _initEvents: function () {
        n.Path.prototype._initEvents.call(this)
    }, _getPathPartStr: function (t) {
        for (var e, i = n.Path.VML, o = 0, s = t.length, a = ""; s > o; o++)e = t[o], i && e._round(), a += (o ? "L" : "M") + e.x + " " + e.y;
        return a
    }, _clipPoints: function () {
        var t, e, o, s = this._originalPoints, a = s.length;
        if (this.options.noClip)return this._parts = [s], i;
        this._parts = [];
        var r = this._parts, h = this._map._pathViewport, l = n.LineUtil;
        for (t = 0, e = 0; a - 1 > t; t++)o = l.clipSegment(s[t], s[t + 1], h, t), o && (r[e] = r[e] || [], r[e].push(o[0]), (o[1] !== s[t + 1] || t === a - 2) && (r[e].push(o[1]), e++))
    }, _simplifyPoints: function () {
        for (var t = this._parts, e = n.LineUtil, i = 0, o = t.length; o > i; i++)t[i] = e.simplify(t[i], this.options.smoothFactor)
    }, _updatePath: function () {
        this._map && (this._clipPoints(), this._simplifyPoints(), n.Path.prototype._updatePath.call(this))
    }}), n.polyline = function (t, e) {
        return new n.Polyline(t, e)
    }, n.PolyUtil = {}, n.PolyUtil.clipPolygon = function (t, e) {
        var i, o, s, a, r, h, l, u, c, _ = [1, 4, 2, 8], d = n.LineUtil;
        for (o = 0, l = t.length; l > o; o++)t[o]._code = d._getBitCode(t[o], e);
        for (a = 0; 4 > a; a++) {
            for (u = _[a], i = [], o = 0, l = t.length, s = l - 1; l > o; s = o++)r = t[o], h = t[s], r._code & u ? h._code & u || (c = d._getEdgeIntersection(h, r, u, e), c._code = d._getBitCode(c, e), i.push(c)) : (h._code & u && (c = d._getEdgeIntersection(h, r, u, e), c._code = d._getBitCode(c, e), i.push(c)), i.push(r));
            t = i
        }
        return t
    }, n.Polygon = n.Polyline.extend({options: {fill: !0}, initialize: function (t, e) {
        n.Polyline.prototype.initialize.call(this, t, e), t && n.Util.isArray(t[0]) && "number" != typeof t[0][0] && (this._latlngs = this._convertLatLngs(t[0]), this._holes = t.slice(1))
    }, projectLatlngs: function () {
        if (n.Polyline.prototype.projectLatlngs.call(this), this._holePoints = [], this._holes) {
            var t, e, i, o;
            for (t = 0, i = this._holes.length; i > t; t++)for (this._holePoints[t] = [], e = 0, o = this._holes[t].length; o > e; e++)this._holePoints[t][e] = this._map.latLngToLayerPoint(this._holes[t][e])
        }
    }, _clipPoints: function () {
        var t = this._originalPoints, e = [];
        if (this._parts = [t].concat(this._holePoints), !this.options.noClip) {
            for (var i = 0, o = this._parts.length; o > i; i++) {
                var s = n.PolyUtil.clipPolygon(this._parts[i], this._map._pathViewport);
                s.length && e.push(s)
            }
            this._parts = e
        }
    }, _getPathPartStr: function (t) {
        var e = n.Polyline.prototype._getPathPartStr.call(this, t);
        return e + (n.Browser.svg ? "z" : "x")
    }}), n.polygon = function (t, e) {
        return new n.Polygon(t, e)
    }, function () {
        function t(t) {
            return n.FeatureGroup.extend({initialize: function (t, e) {
                this._layers = {}, this._options = e, this.setLatLngs(t)
            }, setLatLngs: function (e) {
                var i = 0, n = e.length;
                for (this.eachLayer(function (t) {
                    n > i ? t.setLatLngs(e[i++]) : this.removeLayer(t)
                }, this); n > i;)this.addLayer(new t(e[i++], this._options));
                return this
            }})
        }

        n.MultiPolyline = t(n.Polyline), n.MultiPolygon = t(n.Polygon), n.multiPolyline = function (t, e) {
            return new n.MultiPolyline(t, e)
        }, n.multiPolygon = function (t, e) {
            return new n.MultiPolygon(t, e)
        }
    }(), n.Rectangle = n.Polygon.extend({initialize: function (t, e) {
        n.Polygon.prototype.initialize.call(this, this._boundsToLatLngs(t), e)
    }, setBounds: function (t) {
        this.setLatLngs(this._boundsToLatLngs(t))
    }, _boundsToLatLngs: function (t) {
        return t = n.latLngBounds(t), [t.getSouthWest(), t.getNorthWest(), t.getNorthEast(), t.getSouthEast()]
    }}), n.rectangle = function (t, e) {
        return new n.Rectangle(t, e)
    }, n.Circle = n.Path.extend({initialize: function (t, e, i) {
        n.Path.prototype.initialize.call(this, i), this._latlng = n.latLng(t), this._mRadius = e
    }, options: {fill: !0}, setLatLng: function (t) {
        return this._latlng = n.latLng(t), this.redraw()
    }, setRadius: function (t) {
        return this._mRadius = t, this.redraw()
    }, projectLatlngs: function () {
        var t = this._getLngRadius(), e = new n.LatLng(this._latlng.lat, this._latlng.lng - t), i = this._map.latLngToLayerPoint(e);
        this._point = this._map.latLngToLayerPoint(this._latlng), this._radius = Math.max(Math.round(this._point.x - i.x), 1)
    }, getBounds: function () {
        var t = this._getLngRadius(), e = 360 * (this._mRadius / 40075017), i = this._latlng, o = new n.LatLng(i.lat - e, i.lng - t), s = new n.LatLng(i.lat + e, i.lng + t);
        return new n.LatLngBounds(o, s)
    }, getLatLng: function () {
        return this._latlng
    }, getPathString: function () {
        var t = this._point, e = this._radius;
        return this._checkIfEmpty() ? "" : n.Browser.svg ? "M" + t.x + "," + (t.y - e) + "A" + e + "," + e + ",0,1,1," + (t.x - .1) + "," + (t.y - e) + " z" : (t._round(), e = Math.round(e), "AL " + t.x + "," + t.y + " " + e + "," + e + " 0," + 23592600)
    }, getRadius: function () {
        return this._mRadius
    }, _getLatRadius: function () {
        return 360 * (this._mRadius / 40075017)
    }, _getLngRadius: function () {
        return this._getLatRadius() / Math.cos(n.LatLng.DEG_TO_RAD * this._latlng.lat)
    }, _checkIfEmpty: function () {
        if (!this._map)return!1;
        var t = this._map._pathViewport, e = this._radius, i = this._point;
        return i.x - e > t.max.x || i.y - e > t.max.y || i.x + e < t.min.x || i.y + e < t.min.y
    }}), n.circle = function (t, e, i) {
        return new n.Circle(t, e, i)
    }, n.CircleMarker = n.Circle.extend({options: {radius: 10, weight: 2}, initialize: function (t, e) {
        n.Circle.prototype.initialize.call(this, t, null, e), this._radius = this.options.radius
    }, projectLatlngs: function () {
        this._point = this._map.latLngToLayerPoint(this._latlng)
    }, _updateStyle: function () {
        n.Circle.prototype._updateStyle.call(this), this.setRadius(this.options.radius)
    }, setRadius: function (t) {
        return this.options.radius = this._radius = t, this.redraw()
    }}), n.circleMarker = function (t, e) {
        return new n.CircleMarker(t, e)
    }, n.Polyline.include(n.Path.CANVAS ? {_containsPoint: function (t, e) {
        var i, o, s, a, r, h, l, u = this.options.weight / 2;
        for (n.Browser.touch && (u += 10), i = 0, a = this._parts.length; a > i; i++)for (l = this._parts[i], o = 0, r = l.length, s = r - 1; r > o; s = o++)if ((e || 0 !== o) && (h = n.LineUtil.pointToSegmentDistance(t, l[s], l[o]), u >= h))return!0;
        return!1
    }} : {}), n.Polygon.include(n.Path.CANVAS ? {_containsPoint: function (t) {
        var e, i, o, s, a, r, h, l, u = !1;
        if (n.Polyline.prototype._containsPoint.call(this, t, !0))return!0;
        for (s = 0, h = this._parts.length; h > s; s++)for (e = this._parts[s], a = 0, l = e.length, r = l - 1; l > a; r = a++)i = e[a], o = e[r], i.y > t.y != o.y > t.y && t.x < (o.x - i.x) * (t.y - i.y) / (o.y - i.y) + i.x && (u = !u);
        return u
    }} : {}), n.Circle.include(n.Path.CANVAS ? {_drawPath: function () {
        var t = this._point;
        this._ctx.beginPath(), this._ctx.arc(t.x, t.y, this._radius, 0, 2 * Math.PI, !1)
    }, _containsPoint: function (t) {
        var e = this._point, i = this.options.stroke ? this.options.weight / 2 : 0;
        return t.distanceTo(e) <= this._radius + i
    }} : {}), n.GeoJSON = n.FeatureGroup.extend({initialize: function (t, e) {
        n.setOptions(this, e), this._layers = {}, t && this.addData(t)
    }, addData: function (t) {
        var e, i, o = n.Util.isArray(t) ? t : t.features;
        if (o) {
            for (e = 0, i = o.length; i > e; e++)(o[e].geometries || o[e].geometry || o[e].features) && this.addData(o[e]);
            return this
        }
        var s = this.options;
        if (!s.filter || s.filter(t)) {
            var a = n.GeoJSON.geometryToLayer(t, s.pointToLayer);
            return a.feature = t, a.defaultOptions = a.options, this.resetStyle(a), s.onEachFeature && s.onEachFeature(t, a), this.addLayer(a)
        }
    }, resetStyle: function (t) {
        var e = this.options.style;
        e && (n.Util.extend(t.options, t.defaultOptions), this._setLayerStyle(t, e))
    }, setStyle: function (t) {
        this.eachLayer(function (e) {
            this._setLayerStyle(e, t)
        }, this)
    }, _setLayerStyle: function (t, e) {
        "function" == typeof e && (e = e(t.feature)), t.setStyle && t.setStyle(e)
    }}), n.extend(n.GeoJSON, {geometryToLayer: function (t, e) {
        var i, o, s, a, r, h = "Feature" === t.type ? t.geometry : t, l = h.coordinates, u = [];
        switch (h.type) {
            case"Point":
                return i = this.coordsToLatLng(l), e ? e(t, i) : new n.Marker(i);
            case"MultiPoint":
                for (s = 0, a = l.length; a > s; s++)i = this.coordsToLatLng(l[s]), r = e ? e(t, i) : new n.Marker(i), u.push(r);
                return new n.FeatureGroup(u);
            case"LineString":
                return o = this.coordsToLatLngs(l), new n.Polyline(o);
            case"Polygon":
                return o = this.coordsToLatLngs(l, 1), new n.Polygon(o);
            case"MultiLineString":
                return o = this.coordsToLatLngs(l, 1), new n.MultiPolyline(o);
            case"MultiPolygon":
                return o = this.coordsToLatLngs(l, 2), new n.MultiPolygon(o);
            case"GeometryCollection":
                for (s = 0, a = h.geometries.length; a > s; s++)r = this.geometryToLayer({geometry: h.geometries[s], type: "Feature", properties: t.properties}, e), u.push(r);
                return new n.FeatureGroup(u);
            default:
                throw Error("Invalid GeoJSON object.")
        }
    }, coordsToLatLng: function (t, e) {
        var i = parseFloat(t[e ? 0 : 1]), o = parseFloat(t[e ? 1 : 0]);
        return new n.LatLng(i, o)
    }, coordsToLatLngs: function (t, e, i) {
        var n, o, s, a = [];
        for (o = 0, s = t.length; s > o; o++)n = e ? this.coordsToLatLngs(t[o], e - 1, i) : this.coordsToLatLng(t[o], i), a.push(n);
        return a
    }}), n.geoJson = function (t, e) {
        return new n.GeoJSON(t, e)
    }, n.DomEvent = {addListener: function (t, e, o, s) {
        var a, r, h, l = n.stamp(o), u = "_leaflet_" + e + l;
        return t[u] ? this : (a = function (e) {
            return o.call(s || t, e || n.DomEvent._getEvent())
        }, n.Browser.msTouch && 0 === e.indexOf("touch") ? this.addMsTouchListener(t, e, a, l) : (n.Browser.touch && "dblclick" === e && this.addDoubleTapListener && this.addDoubleTapListener(t, a, l), "addEventListener"in t ? "mousewheel" === e ? (t.addEventListener("DOMMouseScroll", a, !1), t.addEventListener(e, a, !1)) : "mouseenter" === e || "mouseleave" === e ? (r = a, h = "mouseenter" === e ? "mouseover" : "mouseout", a = function (e) {
            return n.DomEvent._checkMouse(t, e) ? r(e) : i
        }, t.addEventListener(h, a, !1)) : t.addEventListener(e, a, !1) : "attachEvent"in t && t.attachEvent("on" + e, a), t[u] = a, this))
    }, removeListener: function (t, e, i) {
        var o = n.stamp(i), s = "_leaflet_" + e + o, a = t[s];
        if (a)return n.Browser.msTouch && 0 === e.indexOf("touch") ? this.removeMsTouchListener(t, e, o) : n.Browser.touch && "dblclick" === e && this.removeDoubleTapListener ? this.removeDoubleTapListener(t, o) : "removeEventListener"in t ? "mousewheel" === e ? (t.removeEventListener("DOMMouseScroll", a, !1), t.removeEventListener(e, a, !1)) : "mouseenter" === e || "mouseleave" === e ? t.removeEventListener("mouseenter" === e ? "mouseover" : "mouseout", a, !1) : t.removeEventListener(e, a, !1) : "detachEvent"in t && t.detachEvent("on" + e, a), t[s] = null, this
    }, stopPropagation: function (t) {
        return t.stopPropagation ? t.stopPropagation() : t.cancelBubble = !0, this
    }, disableClickPropagation: function (t) {
        for (var e = n.DomEvent.stopPropagation, i = n.Draggable.START.length - 1; i >= 0; i--)n.DomEvent.addListener(t, n.Draggable.START[i], e);
        return n.DomEvent.addListener(t, "click", e).addListener(t, "dblclick", e)
    }, preventDefault: function (t) {
        return t.preventDefault ? t.preventDefault() : t.returnValue = !1, this
    }, stop: function (t) {
        return n.DomEvent.preventDefault(t).stopPropagation(t)
    }, getMousePosition: function (t, i) {
        var o = e.body, s = e.documentElement, a = t.pageX ? t.pageX : t.clientX + o.scrollLeft + s.scrollLeft, r = t.pageY ? t.pageY : t.clientY + o.scrollTop + s.scrollTop, h = new n.Point(a, r);
        return i ? h._subtract(n.DomUtil.getViewportOffset(i)) : h
    }, getWheelDelta: function (t) {
        var e = 0;
        return t.wheelDelta && (e = t.wheelDelta / 120), t.detail && (e = -t.detail / 3), e
    }, _checkMouse: function (t, e) {
        var i = e.relatedTarget;
        if (!i)return!0;
        try {
            for (; i && i !== t;)i = i.parentNode
        } catch (n) {
            return!1
        }
        return i !== t
    }, _getEvent: function () {
        var e = t.event;
        if (!e)for (var i = arguments.callee.caller; i && (e = i.arguments[0], !e || t.Event !== e.constructor);)i = i.caller;
        return e
    }}, n.DomEvent.on = n.DomEvent.addListener, n.DomEvent.off = n.DomEvent.removeListener, n.Draggable = n.Class.extend({includes: n.Mixin.Events, statics: {START: n.Browser.touch ? ["touchstart", "mousedown"] : ["mousedown"], END: {mousedown: "mouseup", touchstart: "touchend", MSPointerDown: "touchend"}, MOVE: {mousedown: "mousemove", touchstart: "touchmove", MSPointerDown: "touchmove"}, TAP_TOLERANCE: 15}, initialize: function (t, e, i) {
        this._element = t, this._dragStartTarget = e || t, this._longPress = i && !n.Browser.msTouch
    }, enable: function () {
        if (!this._enabled) {
            for (var t = n.Draggable.START.length - 1; t >= 0; t--)n.DomEvent.on(this._dragStartTarget, n.Draggable.START[t], this._onDown, this);
            this._enabled = !0
        }
    }, disable: function () {
        if (this._enabled) {
            for (var t = n.Draggable.START.length - 1; t >= 0; t--)n.DomEvent.off(this._dragStartTarget, n.Draggable.START[t], this._onDown, this);
            this._enabled = !1, this._moved = !1
        }
    }, _onDown: function (t) {
        if (!(!n.Browser.touch && t.shiftKey || 1 !== t.which && 1 !== t.button && !t.touches || (n.DomEvent.preventDefault(t), n.DomEvent.stopPropagation(t), n.Draggable._disabled))) {
            if (this._simulateClick = !0, t.touches && t.touches.length > 1)return this._simulateClick = !1, clearTimeout(this._longPressTimeout), i;
            var o = t.touches && 1 === t.touches.length ? t.touches[0] : t, s = o.target;
            n.Browser.touch && "a" === s.tagName.toLowerCase() && n.DomUtil.addClass(s, "leaflet-active"), this._moved = !1, this._moving || (this._startPoint = new n.Point(o.clientX, o.clientY), this._startPos = this._newPos = n.DomUtil.getPosition(this._element), t.touches && 1 === t.touches.length && n.Browser.touch && this._longPress && (this._longPressTimeout = setTimeout(n.bind(function () {
                var t = this._newPos && this._newPos.distanceTo(this._startPos) || 0;
                n.Draggable.TAP_TOLERANCE > t && (this._simulateClick = !1, this._onUp(), this._simulateEvent("contextmenu", o))
            }, this), 1e3)), n.DomEvent.on(e, n.Draggable.MOVE[t.type], this._onMove, this), n.DomEvent.on(e, n.Draggable.END[t.type], this._onUp, this))
        }
    }, _onMove: function (t) {
        if (!(t.touches && t.touches.length > 1)) {
            var e = t.touches && 1 === t.touches.length ? t.touches[0] : t, i = new n.Point(e.clientX, e.clientY), o = i.subtract(this._startPoint);
            (o.x || o.y) && (n.DomEvent.preventDefault(t), this._moved || (this.fire("dragstart"), this._moved = !0, this._startPos = n.DomUtil.getPosition(this._element).subtract(o), n.Browser.touch || (n.DomUtil.disableTextSelection(), this._setMovingCursor())), this._newPos = this._startPos.add(o), this._moving = !0, n.Util.cancelAnimFrame(this._animRequest), this._animRequest = n.Util.requestAnimFrame(this._updatePosition, this, !0, this._dragStartTarget))
        }
    }, _updatePosition: function () {
        this.fire("predrag"), n.DomUtil.setPosition(this._element, this._newPos), this.fire("drag")
    }, _onUp: function (t) {
        var i;
        if (clearTimeout(this._longPressTimeout), this._simulateClick && t.changedTouches) {
            var o = t.changedTouches[0], s = o.target, a = this._newPos && this._newPos.distanceTo(this._startPos) || 0;
            "a" === s.tagName.toLowerCase() && n.DomUtil.removeClass(s, "leaflet-active"), n.Draggable.TAP_TOLERANCE > a && (i = o)
        }
        n.Browser.touch || (n.DomUtil.enableTextSelection(), this._restoreCursor());
        for (var r in n.Draggable.MOVE)n.Draggable.MOVE.hasOwnProperty(r) && (n.DomEvent.off(e, n.Draggable.MOVE[r], this._onMove), n.DomEvent.off(e, n.Draggable.END[r], this._onUp));
        this._moved && (n.Util.cancelAnimFrame(this._animRequest), this.fire("dragend")), this._moving = !1, i && (this._moved = !1, this._simulateEvent("click", i))
    }, _setMovingCursor: function () {
        n.DomUtil.addClass(e.body, "leaflet-dragging")
    }, _restoreCursor: function () {
        n.DomUtil.removeClass(e.body, "leaflet-dragging")
    }, _simulateEvent: function (i, n) {
        var o = e.createEvent("MouseEvents");
        o.initMouseEvent(i, !0, !0, t, 1, n.screenX, n.screenY, n.clientX, n.clientY, !1, !1, !1, !1, 0, null), n.target.dispatchEvent(o)
    }}), n.Handler = n.Class.extend({initialize: function (t) {
        this._map = t
    }, enable: function () {
        this._enabled || (this._enabled = !0, this.addHooks())
    }, disable: function () {
        this._enabled && (this._enabled = !1, this.removeHooks())
    }, enabled: function () {
        return!!this._enabled
    }}), n.Map.mergeOptions({dragging: !0, inertia: !n.Browser.android23, inertiaDeceleration: 3400, inertiaMaxSpeed: 1 / 0, inertiaThreshold: n.Browser.touch ? 32 : 18, easeLinearity: .25, longPress: !0, worldCopyJump: !1}), n.Map.Drag = n.Handler.extend({addHooks: function () {
        if (!this._draggable) {
            var t = this._map;
            this._draggable = new n.Draggable(t._mapPane, t._container, t.options.longPress), this._draggable.on({dragstart: this._onDragStart, drag: this._onDrag, dragend: this._onDragEnd}, this), t.options.worldCopyJump && (this._draggable.on("predrag", this._onPreDrag, this), t.on("viewreset", this._onViewReset, this))
        }
        this._draggable.enable()
    }, removeHooks: function () {
        this._draggable.disable()
    }, moved: function () {
        return this._draggable && this._draggable._moved
    }, _onDragStart: function () {
        var t = this._map;
        t._panAnim && t._panAnim.stop(), t.fire("movestart").fire("dragstart"), t.options.inertia && (this._positions = [], this._times = [])
    }, _onDrag: function () {
        if (this._map.options.inertia) {
            var t = this._lastTime = +new Date, e = this._lastPos = this._draggable._newPos;
            this._positions.push(e), this._times.push(t), t - this._times[0] > 200 && (this._positions.shift(), this._times.shift())
        }
        this._map.fire("move").fire("drag")
    }, _onViewReset: function () {
        var t = this._map.getSize()._divideBy(2), e = this._map.latLngToLayerPoint(new n.LatLng(0, 0));
        this._initialWorldOffset = e.subtract(t).x, this._worldWidth = this._map.project(new n.LatLng(0, 180)).x
    }, _onPreDrag: function () {
        var t = this._worldWidth, e = Math.round(t / 2), i = this._initialWorldOffset, n = this._draggable._newPos.x, o = (n - e + i) % t + e - i, s = (n + e + i) % t - e - i, a = Math.abs(o + i) < Math.abs(s + i) ? o : s;
        this._draggable._newPos.x = a
    }, _onDragEnd: function () {
        var t = this._map, e = t.options, i = +new Date - this._lastTime, o = !e.inertia || i > e.inertiaThreshold || !this._positions[0];
        if (o)t.fire("moveend"); else {
            var s = this._lastPos.subtract(this._positions[0]), a = (this._lastTime + i - this._times[0]) / 1e3, r = e.easeLinearity, h = s.multiplyBy(r / a), l = h.distanceTo(new n.Point(0, 0)), u = Math.min(e.inertiaMaxSpeed, l), c = h.multiplyBy(u / l), _ = u / (e.inertiaDeceleration * r), d = c.multiplyBy(-_ / 2).round();
            n.Util.requestAnimFrame(function () {
                t.panBy(d, _, r)
            })
        }
        t.fire("dragend"), e.maxBounds && n.Util.requestAnimFrame(this._panInsideMaxBounds, t, !0, t._container)
    }, _panInsideMaxBounds: function () {
        this.panInsideBounds(this.options.maxBounds)
    }}), n.Map.addInitHook("addHandler", "dragging", n.Map.Drag), n.Map.mergeOptions({doubleClickZoom: !0}), n.Map.DoubleClickZoom = n.Handler.extend({addHooks: function () {
        this._map.on("dblclick", this._onDoubleClick)
    }, removeHooks: function () {
        this._map.off("dblclick", this._onDoubleClick)
    }, _onDoubleClick: function (t) {
        this.setView(t.latlng, this._zoom + 1)
    }}), n.Map.addInitHook("addHandler", "doubleClickZoom", n.Map.DoubleClickZoom), n.Map.mergeOptions({scrollWheelZoom: !0}), n.Map.ScrollWheelZoom = n.Handler.extend({addHooks: function () {
        n.DomEvent.on(this._map._container, "mousewheel", this._onWheelScroll, this), this._delta = 0
    }, removeHooks: function () {
        n.DomEvent.off(this._map._container, "mousewheel", this._onWheelScroll)
    }, _onWheelScroll: function (t) {
        var e = n.DomEvent.getWheelDelta(t);
        this._delta += e, this._lastMousePos = this._map.mouseEventToContainerPoint(t), this._startTime || (this._startTime = +new Date);
        var i = Math.max(40 - (+new Date - this._startTime), 0);
        clearTimeout(this._timer), this._timer = setTimeout(n.bind(this._performZoom, this), i), n.DomEvent.preventDefault(t), n.DomEvent.stopPropagation(t)
    }, _performZoom: function () {
        var t = this._map, e = this._delta, i = t.getZoom();
        if (e = e > 0 ? Math.ceil(e) : Math.round(e), e = Math.max(Math.min(e, 4), -4), e = t._limitZoom(i + e) - i, this._delta = 0, this._startTime = null, e) {
            var n = i + e, o = this._getCenterForScrollWheelZoom(n);
            t.setView(o, n)
        }
    }, _getCenterForScrollWheelZoom: function (t) {
        var e = this._map, i = e.getZoomScale(t), n = e.getSize()._divideBy(2), o = this._lastMousePos._subtract(n)._multiplyBy(1 - 1 / i), s = e._getTopLeftPoint()._add(n)._add(o);
        return e.unproject(s)
    }}), n.Map.addInitHook("addHandler", "scrollWheelZoom", n.Map.ScrollWheelZoom), n.extend(n.DomEvent, {_touchstart: n.Browser.msTouch ? "MSPointerDown" : "touchstart", _touchend: n.Browser.msTouch ? "MSPointerUp" : "touchend", addDoubleTapListener: function (t, i, o) {
        function s(t) {
            var e;
            if (n.Browser.msTouch ? (p.push(t.pointerId), e = p.length) : e = t.touches.length, !(e > 1)) {
                var i = Date.now(), o = i - (r || i);
                h = t.touches ? t.touches[0] : t, l = o > 0 && u >= o, r = i
            }
        }

        function a(t) {
            if (n.Browser.msTouch) {
                var e = p.indexOf(t.pointerId);
                if (-1 === e)return;
                p.splice(e, 1)
            }
            if (l) {
                if (n.Browser.msTouch) {
                    var o, s = {};
                    for (var a in h)o = h[a], s[a] = "function" == typeof o ? o.bind(h) : o;
                    h = s
                }
                h.type = "dblclick", i(h), r = null
            }
        }

        var r, h, l = !1, u = 250, c = "_leaflet_", _ = this._touchstart, d = this._touchend, p = [];
        t[c + _ + o] = s, t[c + d + o] = a;
        var m = n.Browser.msTouch ? e.documentElement : t;
        return t.addEventListener(_, s, !1), m.addEventListener(d, a, !1), n.Browser.msTouch && m.addEventListener("MSPointerCancel", a, !1), this
    }, removeDoubleTapListener: function (t, i) {
        var o = "_leaflet_";
        return t.removeEventListener(this._touchstart, t[o + this._touchstart + i], !1), (n.Browser.msTouch ? e.documentElement : t).removeEventListener(this._touchend, t[o + this._touchend + i], !1), n.Browser.msTouch && e.documentElement.removeEventListener("MSPointerCancel", t[o + this._touchend + i], !1), this
    }}), n.extend(n.DomEvent, {_msTouches: [], _msDocumentListener: !1, addMsTouchListener: function (t, e, i, n) {
        switch (e) {
            case"touchstart":
                return this.addMsTouchListenerStart(t, e, i, n);
            case"touchend":
                return this.addMsTouchListenerEnd(t, e, i, n);
            case"touchmove":
                return this.addMsTouchListenerMove(t, e, i, n);
            default:
                throw"Unknown touch event type"
        }
    }, addMsTouchListenerStart: function (t, i, n, o) {
        var s = "_leaflet_", a = this._msTouches, r = function (t) {
            for (var e = !1, i = 0; a.length > i; i++)if (a[i].pointerId === t.pointerId) {
                e = !0;
                break
            }
            e || a.push(t), t.touches = a.slice(), t.changedTouches = [t], n(t)
        };
        if (t[s + "touchstart" + o] = r, t.addEventListener("MSPointerDown", r, !1), !this._msDocumentListener) {
            var h = function (t) {
                for (var e = 0; a.length > e; e++)if (a[e].pointerId === t.pointerId) {
                    a.splice(e, 1);
                    break
                }
            };
            e.documentElement.addEventListener("MSPointerUp", h, !1), e.documentElement.addEventListener("MSPointerCancel", h, !1), this._msDocumentListener = !0
        }
        return this
    }, addMsTouchListenerMove: function (t, e, i, n) {
        function o(t) {
            if (t.pointerType !== t.MSPOINTER_TYPE_MOUSE || 0 !== t.buttons) {
                for (var e = 0; a.length > e; e++)if (a[e].pointerId === t.pointerId) {
                    a[e] = t;
                    break
                }
                t.touches = a.slice(), t.changedTouches = [t], i(t)
            }
        }

        var s = "_leaflet_", a = this._msTouches;
        return t[s + "touchmove" + n] = o, t.addEventListener("MSPointerMove", o, !1), this
    }, addMsTouchListenerEnd: function (t, e, i, n) {
        var o = "_leaflet_", s = this._msTouches, a = function (t) {
            for (var e = 0; s.length > e; e++)if (s[e].pointerId === t.pointerId) {
                s.splice(e, 1);
                break
            }
            t.touches = s.slice(), t.changedTouches = [t], i(t)
        };
        return t[o + "touchend" + n] = a, t.addEventListener("MSPointerUp", a, !1), t.addEventListener("MSPointerCancel", a, !1), this
    }, removeMsTouchListener: function (t, e, i) {
        var n = "_leaflet_", o = t[n + e + i];
        switch (e) {
            case"touchstart":
                t.removeEventListener("MSPointerDown", o, !1);
                break;
            case"touchmove":
                t.removeEventListener("MSPointerMove", o, !1);
                break;
            case"touchend":
                t.removeEventListener("MSPointerUp", o, !1), t.removeEventListener("MSPointerCancel", o, !1)
        }
        return this
    }}), n.Map.mergeOptions({touchZoom: n.Browser.touch && !n.Browser.android23}), n.Map.TouchZoom = n.Handler.extend({addHooks: function () {
        n.DomEvent.on(this._map._container, "touchstart", this._onTouchStart, this)
    }, removeHooks: function () {
        n.DomEvent.off(this._map._container, "touchstart", this._onTouchStart, this)
    }, _onTouchStart: function (t) {
        var i = this._map;
        if (t.touches && 2 === t.touches.length && !i._animatingZoom && !this._zooming) {
            var o = i.mouseEventToLayerPoint(t.touches[0]), s = i.mouseEventToLayerPoint(t.touches[1]), a = i._getCenterLayerPoint();
            this._startCenter = o.add(s)._divideBy(2), this._startDist = o.distanceTo(s), this._moved = !1, this._zooming = !0, this._centerOffset = a.subtract(this._startCenter), i._panAnim && i._panAnim.stop(), n.DomEvent.on(e, "touchmove", this._onTouchMove, this).on(e, "touchend", this._onTouchEnd, this), n.DomEvent.preventDefault(t)
        }
    }, _onTouchMove: function (t) {
        if (t.touches && 2 === t.touches.length) {
            var e = this._map, i = e.mouseEventToLayerPoint(t.touches[0]), o = e.mouseEventToLayerPoint(t.touches[1]);
            this._scale = i.distanceTo(o) / this._startDist, this._delta = i._add(o)._divideBy(2)._subtract(this._startCenter), 1 !== this._scale && (this._moved || (n.DomUtil.addClass(e._mapPane, "leaflet-zoom-anim leaflet-touching"), e.fire("movestart").fire("zoomstart")._prepareTileBg(), this._moved = !0), n.Util.cancelAnimFrame(this._animRequest), this._animRequest = n.Util.requestAnimFrame(this._updateOnMove, this, !0, this._map._container), n.DomEvent.preventDefault(t))
        }
    }, _updateOnMove: function () {
        var t = this._map, e = this._getScaleOrigin(), i = t.layerPointToLatLng(e);
        t.fire("zoomanim", {center: i, zoom: t.getScaleZoom(this._scale)}), t._tileBg.style[n.DomUtil.TRANSFORM] = n.DomUtil.getTranslateString(this._delta) + " " + n.DomUtil.getScaleString(this._scale, this._startCenter)
    }, _onTouchEnd: function () {
        if (this._moved && this._zooming) {
            var t = this._map;
            this._zooming = !1, n.DomUtil.removeClass(t._mapPane, "leaflet-touching"), n.DomEvent.off(e, "touchmove", this._onTouchMove).off(e, "touchend", this._onTouchEnd);
            var i = this._getScaleOrigin(), o = t.layerPointToLatLng(i), s = t.getZoom(), a = t.getScaleZoom(this._scale) - s, r = a > 0 ? Math.ceil(a) : Math.floor(a), h = t._limitZoom(s + r);
            t.fire("zoomanim", {center: o, zoom: h}), t._runAnimation(o, h, t.getZoomScale(h) / this._scale, i, !0)
        }
    }, _getScaleOrigin: function () {
        var t = this._centerOffset.subtract(this._delta).divideBy(this._scale);
        return this._startCenter.add(t)
    }}), n.Map.addInitHook("addHandler", "touchZoom", n.Map.TouchZoom), n.Map.mergeOptions({boxZoom: !0}), n.Map.BoxZoom = n.Handler.extend({initialize: function (t) {
        this._map = t, this._container = t._container, this._pane = t._panes.overlayPane
    }, addHooks: function () {
        n.DomEvent.on(this._container, "mousedown", this._onMouseDown, this)
    }, removeHooks: function () {
        n.DomEvent.off(this._container, "mousedown", this._onMouseDown)
    }, _onMouseDown: function (t) {
        return!t.shiftKey || 1 !== t.which && 1 !== t.button ? !1 : (n.DomUtil.disableTextSelection(), this._startLayerPoint = this._map.mouseEventToLayerPoint(t), this._box = n.DomUtil.create("div", "leaflet-zoom-box", this._pane), n.DomUtil.setPosition(this._box, this._startLayerPoint), this._container.style.cursor = "crosshair", n.DomEvent.on(e, "mousemove", this._onMouseMove, this).on(e, "mouseup", this._onMouseUp, this).preventDefault(t), this._map.fire("boxzoomstart"), i)
    }, _onMouseMove: function (t) {
        var e = this._startLayerPoint, i = this._box, o = this._map.mouseEventToLayerPoint(t), s = o.subtract(e), a = new n.Point(Math.min(o.x, e.x), Math.min(o.y, e.y));
        n.DomUtil.setPosition(i, a), i.style.width = Math.max(0, Math.abs(s.x) - 4) + "px", i.style.height = Math.max(0, Math.abs(s.y) - 4) + "px"
    }, _onMouseUp: function (t) {
        this._pane.removeChild(this._box), this._container.style.cursor = "", n.DomUtil.enableTextSelection(), n.DomEvent.off(e, "mousemove", this._onMouseMove).off(e, "mouseup", this._onMouseUp);
        var i = this._map, o = i.mouseEventToLayerPoint(t);
        if (!this._startLayerPoint.equals(o)) {
            var s = new n.LatLngBounds(i.layerPointToLatLng(this._startLayerPoint), i.layerPointToLatLng(o));
            i.fitBounds(s), i.fire("boxzoomend", {boxZoomBounds: s})
        }
    }}), n.Map.addInitHook("addHandler", "boxZoom", n.Map.BoxZoom), n.Map.mergeOptions({keyboard: !0, keyboardPanOffset: 80, keyboardZoomOffset: 1}), n.Map.Keyboard = n.Handler.extend({keyCodes: {left: [37], right: [39], down: [40], up: [38], zoomIn: [187, 107, 61], zoomOut: [189, 109, 173]}, initialize: function (t) {
        this._map = t, this._setPanOffset(t.options.keyboardPanOffset), this._setZoomOffset(t.options.keyboardZoomOffset)
    }, addHooks: function () {
        var t = this._map._container;
        -1 === t.tabIndex && (t.tabIndex = "0"), n.DomEvent.on(t, "focus", this._onFocus, this).on(t, "blur", this._onBlur, this).on(t, "mousedown", this._onMouseDown, this), this._map.on("focus", this._addHooks, this).on("blur", this._removeHooks, this)
    }, removeHooks: function () {
        this._removeHooks();
        var t = this._map._container;
        n.DomEvent.off(t, "focus", this._onFocus, this).off(t, "blur", this._onBlur, this).off(t, "mousedown", this._onMouseDown, this), this._map.off("focus", this._addHooks, this).off("blur", this._removeHooks, this)
    }, _onMouseDown: function () {
        this._focused || this._map._container.focus()
    }, _onFocus: function () {
        this._focused = !0, this._map.fire("focus")
    }, _onBlur: function () {
        this._focused = !1, this._map.fire("blur")
    }, _setPanOffset: function (t) {
        var e, i, n = this._panKeys = {}, o = this.keyCodes;
        for (e = 0, i = o.left.length; i > e; e++)n[o.left[e]] = [-1 * t, 0];
        for (e = 0, i = o.right.length; i > e; e++)n[o.right[e]] = [t, 0];
        for (e = 0, i = o.down.length; i > e; e++)n[o.down[e]] = [0, t];
        for (e = 0, i = o.up.length; i > e; e++)n[o.up[e]] = [0, -1 * t]
    }, _setZoomOffset: function (t) {
        var e, i, n = this._zoomKeys = {}, o = this.keyCodes;
        for (e = 0, i = o.zoomIn.length; i > e; e++)n[o.zoomIn[e]] = t;
        for (e = 0, i = o.zoomOut.length; i > e; e++)n[o.zoomOut[e]] = -t
    }, _addHooks: function () {
        n.DomEvent.on(e, "keydown", this._onKeyDown, this)
    }, _removeHooks: function () {
        n.DomEvent.off(e, "keydown", this._onKeyDown, this)
    }, _onKeyDown: function (t) {
        var e = t.keyCode, i = this._map;
        if (this._panKeys.hasOwnProperty(e))i.panBy(this._panKeys[e]), i.options.maxBounds && i.panInsideBounds(i.options.maxBounds); else {
            if (!this._zoomKeys.hasOwnProperty(e))return;
            i.setZoom(i.getZoom() + this._zoomKeys[e])
        }
        n.DomEvent.stop(t)
    }}), n.Map.addInitHook("addHandler", "keyboard", n.Map.Keyboard), n.Handler.MarkerDrag = n.Handler.extend({initialize: function (t) {
        this._marker = t
    }, addHooks: function () {
        var t = this._marker._icon;
        this._draggable || (this._draggable = new n.Draggable(t, t).on("dragstart", this._onDragStart, this).on("drag", this._onDrag, this).on("dragend", this._onDragEnd, this)), this._draggable.enable()
    }, removeHooks: function () {
        this._draggable.disable()
    }, moved: function () {
        return this._draggable && this._draggable._moved
    }, _onDragStart: function () {
        this._marker.closePopup().fire("movestart").fire("dragstart")
    }, _onDrag: function () {
        var t = this._marker, e = t._shadow, i = n.DomUtil.getPosition(t._icon), o = t._map.layerPointToLatLng(i);
        e && n.DomUtil.setPosition(e, i), t._latlng = o, t.fire("move", {latlng: o}).fire("drag")
    }, _onDragEnd: function () {
        this._marker.fire("moveend").fire("dragend")
    }}), n.Handler.PolyEdit = n.Handler.extend({options: {icon: new n.DivIcon({iconSize: new n.Point(8, 8), className: "leaflet-div-icon leaflet-editing-icon"})}, initialize: function (t, e) {
        this._poly = t, n.setOptions(this, e)
    }, addHooks: function () {
        this._poly._map && (this._markerGroup || this._initMarkers(), this._poly._map.addLayer(this._markerGroup))
    }, removeHooks: function () {
        this._poly._map && (this._poly._map.removeLayer(this._markerGroup), delete this._markerGroup, delete this._markers)
    }, updateMarkers: function () {
        this._markerGroup.clearLayers(), this._initMarkers()
    }, _initMarkers: function () {
        this._markerGroup || (this._markerGroup = new n.LayerGroup), this._markers = [];
        var t, e, i, o, s = this._poly._latlngs;
        for (t = 0, i = s.length; i > t; t++)o = this._createMarker(s[t], t), o.on("click", this._onMarkerClick, this), this._markers.push(o);
        var a, r;
        for (t = 0, e = i - 1; i > t; e = t++)(0 !== t || n.Polygon && this._poly instanceof n.Polygon) && (a = this._markers[e], r = this._markers[t], this._createMiddleMarker(a, r), this._updatePrevNext(a, r))
    }, _createMarker: function (t, e) {
        var i = new n.Marker(t, {draggable: !0, icon: this.options.icon});
        return i._origLatLng = t, i._index = e, i.on("drag", this._onMarkerDrag, this), i.on("dragend", this._fireEdit, this), this._markerGroup.addLayer(i), i
    }, _fireEdit: function () {
        this._poly.fire("edit")
    }, _onMarkerDrag: function (t) {
        var e = t.target;
        n.extend(e._origLatLng, e._latlng), e._middleLeft && e._middleLeft.setLatLng(this._getMiddleLatLng(e._prev, e)), e._middleRight && e._middleRight.setLatLng(this._getMiddleLatLng(e, e._next)), this._poly.redraw()
    }, _onMarkerClick: function (t) {
        if (!(3 > this._poly._latlngs.length)) {
            var e = t.target, i = e._index;
            this._markerGroup.removeLayer(e), this._markers.splice(i, 1), this._poly.spliceLatLngs(i, 1), this._updateIndexes(i, -1), this._updatePrevNext(e._prev, e._next), e._middleLeft && this._markerGroup.removeLayer(e._middleLeft), e._middleRight && this._markerGroup.removeLayer(e._middleRight), e._prev && e._next ? this._createMiddleMarker(e._prev, e._next) : e._prev ? e._next || (e._prev._middleRight = null) : e._next._middleLeft = null, this._poly.fire("edit")
        }
    }, _updateIndexes: function (t, e) {
        this._markerGroup.eachLayer(function (i) {
            i._index > t && (i._index += e)
        })
    }, _createMiddleMarker: function (t, e) {
        var i, n, o, s = this._getMiddleLatLng(t, e), a = this._createMarker(s);
        a.setOpacity(.6), t._middleRight = e._middleLeft = a, n = function () {
            var n = e._index;
            a._index = n, a.off("click", i).on("click", this._onMarkerClick, this), s.lat = a.getLatLng().lat, s.lng = a.getLatLng().lng, this._poly.spliceLatLngs(n, 0, s), this._markers.splice(n, 0, a), a.setOpacity(1), this._updateIndexes(n, 1), e._index++, this._updatePrevNext(t, a), this._updatePrevNext(a, e)
        }, o = function () {
            a.off("dragstart", n, this), a.off("dragend", o, this), this._createMiddleMarker(t, a), this._createMiddleMarker(a, e)
        }, i = function () {
            n.call(this), o.call(this), this._poly.fire("edit")
        }, a.on("click", i, this).on("dragstart", n, this).on("dragend", o, this), this._markerGroup.addLayer(a)
    }, _updatePrevNext: function (t, e) {
        t && (t._next = e), e && (e._prev = t)
    }, _getMiddleLatLng: function (t, e) {
        var i = this._poly._map, n = i.latLngToLayerPoint(t.getLatLng()), o = i.latLngToLayerPoint(e.getLatLng());
        return i.layerPointToLatLng(n._add(o)._divideBy(2))
    }}), n.Polyline.addInitHook(function () {
        n.Handler.PolyEdit && (this.editing = new n.Handler.PolyEdit(this), this.options.editable && this.editing.enable()), this.on("add", function () {
            this.editing && this.editing.enabled() && this.editing.addHooks()
        }), this.on("remove", function () {
            this.editing && this.editing.enabled() && this.editing.removeHooks()
        })
    }), n.Control = n.Class.extend({options: {position: "topright"}, initialize: function (t) {
        n.setOptions(this, t)
    }, getPosition: function () {
        return this.options.position
    }, setPosition: function (t) {
        var e = this._map;
        return e && e.removeControl(this), this.options.position = t, e && e.addControl(this), this
    }, addTo: function (t) {
        this._map = t;
        var e = this._container = this.onAdd(t), i = this.getPosition(), o = t._controlCorners[i];
        return n.DomUtil.addClass(e, "leaflet-control"), -1 !== i.indexOf("bottom") ? o.insertBefore(e, o.firstChild) : o.appendChild(e), this
    }, removeFrom: function (t) {
        var e = this.getPosition(), i = t._controlCorners[e];
        return i.removeChild(this._container), this._map = null, this.onRemove && this.onRemove(t), this
    }}), n.control = function (t) {
        return new n.Control(t)
    }, n.Map.include({addControl: function (t) {
        return t.addTo(this), this
    }, removeControl: function (t) {
        return t.removeFrom(this), this
    }, _initControlPos: function () {
        function t(t, s) {
            var a = i + t + " " + i + s;
            e[t + s] = n.DomUtil.create("div", a, o)
        }

        var e = this._controlCorners = {}, i = "leaflet-", o = this._controlContainer = n.DomUtil.create("div", i + "control-container", this._container);
        t("top", "left"), t("top", "right"), t("bottom", "left"), t("bottom", "right")
    }}), n.Control.Zoom = n.Control.extend({options: {position: "topleft"}, onAdd: function (t) {
        var e = "leaflet-control-zoom", i = "leaflet-bar", o = i + "-part", s = n.DomUtil.create("div", e + " " + i);
        return this._map = t, this._zoomInButton = this._createButton("+", "Zoom in", e + "-in " + o + " " + o + "-top", s, this._zoomIn, this), this._zoomOutButton = this._createButton("-", "Zoom out", e + "-out " + o + " " + o + "-bottom", s, this._zoomOut, this), t.on("zoomend", this._updateDisabled, this), s
    }, onRemove: function (t) {
        t.off("zoomend", this._updateDisabled, this)
    }, _zoomIn: function (t) {
        this._map.zoomIn(t.shiftKey ? 3 : 1)
    }, _zoomOut: function (t) {
        this._map.zoomOut(t.shiftKey ? 3 : 1)
    }, _createButton: function (t, e, i, o, s, a) {
        var r = n.DomUtil.create("a", i, o);
        r.innerHTML = t, r.href = "#", r.title = e;
        var h = n.DomEvent.stopPropagation;
        return n.DomEvent.on(r, "click", h).on(r, "mousedown", h).on(r, "dblclick", h).on(r, "click", n.DomEvent.preventDefault).on(r, "click", s, a), r
    }, _updateDisabled: function () {
        var t = this._map, e = "leaflet-control-zoom-disabled";
        n.DomUtil.removeClass(this._zoomInButton, e), n.DomUtil.removeClass(this._zoomOutButton, e), t._zoom === t.getMinZoom() && n.DomUtil.addClass(this._zoomOutButton, e), t._zoom === t.getMaxZoom() && n.DomUtil.addClass(this._zoomInButton, e)
    }}), n.Map.mergeOptions({zoomControl: !0}), n.Map.addInitHook(function () {
        this.options.zoomControl && (this.zoomControl = new n.Control.Zoom, this.addControl(this.zoomControl))
    }), n.control.zoom = function (t) {
        return new n.Control.Zoom(t)
    }, n.Control.Attribution = n.Control.extend({options: {position: "bottomright", prefix: 'Powered by <a href="http://leafletjs.com">Leaflet</a>'}, initialize: function (t) {
        n.setOptions(this, t), this._attributions = {}
    }, onAdd: function (t) {
        return this._container = n.DomUtil.create("div", "leaflet-control-attribution"), n.DomEvent.disableClickPropagation(this._container), t.on("layeradd", this._onLayerAdd, this).on("layerremove", this._onLayerRemove, this), this._update(), this._container
    }, onRemove: function (t) {
        t.off("layeradd", this._onLayerAdd).off("layerremove", this._onLayerRemove)
    }, setPrefix: function (t) {
        return this.options.prefix = t, this._update(), this
    }, addAttribution: function (t) {
        return t ? (this._attributions[t] || (this._attributions[t] = 0), this._attributions[t]++, this._update(), this) : i
    }, removeAttribution: function (t) {
        return t ? (this._attributions[t]--, this._update(), this) : i
    }, _update: function () {
        if (this._map) {
            var t = [];
            for (var e in this._attributions)this._attributions.hasOwnProperty(e) && this._attributions[e] && t.push(e);
            var i = [];
            this.options.prefix && i.push(this.options.prefix), t.length && i.push(t.join(", ")), this._container.innerHTML = i.join(" &#8212; ")
        }
    }, _onLayerAdd: function (t) {
        t.layer.getAttribution && this.addAttribution(t.layer.getAttribution())
    }, _onLayerRemove: function (t) {
        t.layer.getAttribution && this.removeAttribution(t.layer.getAttribution())
    }}), n.Map.mergeOptions({attributionControl: !0}), n.Map.addInitHook(function () {
        this.options.attributionControl && (this.attributionControl = (new n.Control.Attribution).addTo(this))
    }), n.control.attribution = function (t) {
        return new n.Control.Attribution(t)
    }, n.Control.Scale = n.Control.extend({options: {position: "bottomleft", maxWidth: 100, metric: !0, imperial: !0, updateWhenIdle: !1}, onAdd: function (t) {
        this._map = t;
        var e = "leaflet-control-scale", i = n.DomUtil.create("div", e), o = this.options;
        return this._addScales(o, e, i), t.on(o.updateWhenIdle ? "moveend" : "move", this._update, this), t.whenReady(this._update, this), i
    }, onRemove: function (t) {
        t.off(this.options.updateWhenIdle ? "moveend" : "move", this._update, this)
    }, _addScales: function (t, e, i) {
        t.metric && (this._mScale = n.DomUtil.create("div", e + "-line", i)), t.imperial && (this._iScale = n.DomUtil.create("div", e + "-line", i))
    }, _update: function () {
        var t = this._map.getBounds(), e = t.getCenter().lat, i = 6378137 * Math.PI * Math.cos(e * Math.PI / 180), n = i * (t.getNorthEast().lng - t.getSouthWest().lng) / 180, o = this._map.getSize(), s = this.options, a = 0;
        o.x > 0 && (a = n * (s.maxWidth / o.x)), this._updateScales(s, a)
    }, _updateScales: function (t, e) {
        t.metric && e && this._updateMetric(e), t.imperial && e && this._updateImperial(e)
    }, _updateMetric: function (t) {
        var e = this._getRoundNum(t);
        this._mScale.style.width = this._getScaleWidth(e / t) + "px", this._mScale.innerHTML = 1e3 > e ? e + " m" : e / 1e3 + " km"
    }, _updateImperial: function (t) {
        var e, i, n, o = 3.2808399 * t, s = this._iScale;
        o > 5280 ? (e = o / 5280, i = this._getRoundNum(e), s.style.width = this._getScaleWidth(i / e) + "px", s.innerHTML = i + " mi") : (n = this._getRoundNum(o), s.style.width = this._getScaleWidth(n / o) + "px", s.innerHTML = n + " ft")
    }, _getScaleWidth: function (t) {
        return Math.round(this.options.maxWidth * t) - 10
    }, _getRoundNum: function (t) {
        var e = Math.pow(10, (Math.floor(t) + "").length - 1), i = t / e;
        return i = i >= 10 ? 10 : i >= 5 ? 5 : i >= 3 ? 3 : i >= 2 ? 2 : 1, e * i
    }}), n.control.scale = function (t) {
        return new n.Control.Scale(t)
    }, n.Control.Layers = n.Control.extend({options: {collapsed: !0, position: "topright", autoZIndex: !0}, initialize: function (t, e, i) {
        n.setOptions(this, i), this._layers = {}, this._lastZIndex = 0, this._handlingClick = !1;
        for (var o in t)t.hasOwnProperty(o) && this._addLayer(t[o], o);
        for (o in e)e.hasOwnProperty(o) && this._addLayer(e[o], o, !0)
    }, onAdd: function (t) {
        return this._initLayout(), this._update(), t.on("layeradd", this._onLayerChange, this).on("layerremove", this._onLayerChange, this), this._container
    }, onRemove: function (t) {
        t.off("layeradd", this._onLayerChange).off("layerremove", this._onLayerChange)
    }, addBaseLayer: function (t, e) {
        return this._addLayer(t, e), this._update(), this
    }, addOverlay: function (t, e) {
        return this._addLayer(t, e, !0), this._update(), this
    }, removeLayer: function (t) {
        var e = n.stamp(t);
        return delete this._layers[e], this._update(), this
    }, _initLayout: function () {
        var t = "leaflet-control-layers", e = this._container = n.DomUtil.create("div", t);
        n.Browser.touch ? n.DomEvent.on(e, "click", n.DomEvent.stopPropagation) : (n.DomEvent.disableClickPropagation(e), n.DomEvent.on(e, "mousewheel", n.DomEvent.stopPropagation));
        var i = this._form = n.DomUtil.create("form", t + "-list");
        if (this.options.collapsed) {
            n.DomEvent.on(e, "mouseover", this._expand, this).on(e, "mouseout", this._collapse, this);
            var o = this._layersLink = n.DomUtil.create("a", t + "-toggle", e);
            o.href = "#", o.title = "Layers", n.Browser.touch ? n.DomEvent.on(o, "click", n.DomEvent.stopPropagation).on(o, "click", n.DomEvent.preventDefault).on(o, "click", this._expand, this) : n.DomEvent.on(o, "focus", this._expand, this), this._map.on("movestart", this._collapse, this)
        } else this._expand();
        this._baseLayersList = n.DomUtil.create("div", t + "-base", i), this._separator = n.DomUtil.create("div", t + "-separator", i), this._overlaysList = n.DomUtil.create("div", t + "-overlays", i), e.appendChild(i)
    }, _addLayer: function (t, e, i) {
        var o = n.stamp(t);
        this._layers[o] = {layer: t, name: e, overlay: i}, this.options.autoZIndex && t.setZIndex && (this._lastZIndex++, t.setZIndex(this._lastZIndex))
    }, _update: function () {
        if (this._container) {
            this._baseLayersList.innerHTML = "", this._overlaysList.innerHTML = "";
            var t = !1, e = !1;
            for (var i in this._layers)if (this._layers.hasOwnProperty(i)) {
                var n = this._layers[i];
                this._addItem(n), e = e || n.overlay, t = t || !n.overlay
            }
            this._separator.style.display = e && t ? "" : "none"
        }
    }, _onLayerChange: function (t) {
        var e = n.stamp(t.layer);
        this._layers[e] && !this._handlingClick && this._update()
    }, _createRadioElement: function (t, i) {
        var n = '<input type="radio" class="leaflet-control-layers-selector" name="' + t + '"';
        i && (n += ' checked="checked"'), n += "/>";
        var o = e.createElement("div");
        return o.innerHTML = n, o.firstChild
    }, _addItem: function (t) {
        var i, o = e.createElement("label"), s = this._map.hasLayer(t.layer);
        t.overlay ? (i = e.createElement("input"), i.type = "checkbox", i.className = "leaflet-control-layers-selector", i.defaultChecked = s) : i = this._createRadioElement("leaflet-base-layers", s), i.layerId = n.stamp(t.layer), n.DomEvent.on(i, "click", this._onInputClick, this);
        var a = e.createElement("span");
        a.innerHTML = " " + t.name, o.appendChild(i), o.appendChild(a);
        var r = t.overlay ? this._overlaysList : this._baseLayersList;
        return r.appendChild(o), o
    }, _onInputClick: function () {
        var t, e, i, n, o = this._form.getElementsByTagName("input"), s = o.length;
        for (this._handlingClick = !0, t = 0; s > t; t++)e = o[t], i = this._layers[e.layerId], e.checked && !this._map.hasLayer(i.layer) ? (this._map.addLayer(i.layer), i.overlay || (n = i.layer)) : !e.checked && this._map.hasLayer(i.layer) && this._map.removeLayer(i.layer);
        n && (this._map.setZoom(this._map.getZoom()), this._map.fire("baselayerchange", {layer: n})), this._handlingClick = !1
    }, _expand: function () {
        n.DomUtil.addClass(this._container, "leaflet-control-layers-expanded")
    }, _collapse: function () {
        this._container.className = this._container.className.replace(" leaflet-control-layers-expanded", "")
    }}), n.control.layers = function (t, e, i) {
        return new n.Control.Layers(t, e, i)
    }, n.PosAnimation = n.Class.extend({includes: n.Mixin.Events, run: function (t, e, i, o) {
        this.stop(), this._el = t, this._inProgress = !0, this.fire("start"), t.style[n.DomUtil.TRANSITION] = "all " + (i || .25) + "s cubic-bezier(0,0," + (o || .5) + ",1)", n.DomEvent.on(t, n.DomUtil.TRANSITION_END, this._onTransitionEnd, this), n.DomUtil.setPosition(t, e), n.Util.falseFn(t.offsetWidth), this._stepTimer = setInterval(n.bind(this.fire, this, "step"), 50)
    }, stop: function () {
        this._inProgress && (n.DomUtil.setPosition(this._el, this._getPos()), this._onTransitionEnd(), n.Util.falseFn(this._el.offsetWidth))
    }, _transformRe: /(-?[\d\.]+), (-?[\d\.]+)\)/, _getPos: function () {
        var e, i, o, s = this._el, a = t.getComputedStyle(s);
        return n.Browser.any3d ? (o = a[n.DomUtil.TRANSFORM].match(this._transformRe), e = parseFloat(o[1]), i = parseFloat(o[2])) : (e = parseFloat(a.left), i = parseFloat(a.top)), new n.Point(e, i, !0)
    }, _onTransitionEnd: function () {
        n.DomEvent.off(this._el, n.DomUtil.TRANSITION_END, this._onTransitionEnd, this), this._inProgress && (this._inProgress = !1, this._el.style[n.DomUtil.TRANSITION] = "", clearInterval(this._stepTimer), this.fire("step").fire("end"))
    }}), n.Map.include({setView: function (t, e, i) {
        e = this._limitZoom(e);
        var n = this._zoom !== e;
        if (this._loaded && !i && this._layers) {
            this._panAnim && this._panAnim.stop();
            var o = n ? this._zoomToIfClose && this._zoomToIfClose(t, e) : this._panByIfClose(t);
            if (o)return clearTimeout(this._sizeTimer), this
        }
        return this._resetView(t, e), this
    }, panBy: function (t, e, i) {
        if (t = n.point(t), !t.x && !t.y)return this;
        this._panAnim || (this._panAnim = new n.PosAnimation, this._panAnim.on({step: this._onPanTransitionStep, end: this._onPanTransitionEnd}, this)), this.fire("movestart"), n.DomUtil.addClass(this._mapPane, "leaflet-pan-anim");
        var o = n.DomUtil.getPosition(this._mapPane).subtract(t)._round();
        return this._panAnim.run(this._mapPane, o, e || .25, i), this
    }, _onPanTransitionStep: function () {
        this.fire("move")
    }, _onPanTransitionEnd: function () {
        n.DomUtil.removeClass(this._mapPane, "leaflet-pan-anim"), this.fire("moveend")
    }, _panByIfClose: function (t) {
        var e = this._getCenterOffset(t)._floor();
        return this._offsetIsWithinView(e) ? (this.panBy(e), !0) : !1
    }, _offsetIsWithinView: function (t, e) {
        var i = e || 1, n = this.getSize();
        return Math.abs(t.x) <= n.x * i && Math.abs(t.y) <= n.y * i
    }}), n.PosAnimation = n.DomUtil.TRANSITION ? n.PosAnimation : n.PosAnimation.extend({run: function (t, e, i, o) {
        this.stop(), this._el = t, this._inProgress = !0, this._duration = i || .25, this._easeOutPower = 1 / Math.max(o || .5, .2), this._startPos = n.DomUtil.getPosition(t), this._offset = e.subtract(this._startPos), this._startTime = +new Date, this.fire("start"), this._animate()
    }, stop: function () {
        this._inProgress && (this._step(), this._complete())
    }, _animate: function () {
        this._animId = n.Util.requestAnimFrame(this._animate, this), this._step()
    }, _step: function () {
        var t = +new Date - this._startTime, e = 1e3 * this._duration;
        e > t ? this._runFrame(this._easeOut(t / e)) : (this._runFrame(1), this._complete())
    }, _runFrame: function (t) {
        var e = this._startPos.add(this._offset.multiplyBy(t));
        n.DomUtil.setPosition(this._el, e), this.fire("step")
    }, _complete: function () {
        n.Util.cancelAnimFrame(this._animId), this._inProgress = !1, this.fire("end")
    }, _easeOut: function (t) {
        return 1 - Math.pow(1 - t, this._easeOutPower)
    }}), n.Map.mergeOptions({zoomAnimation: n.DomUtil.TRANSITION && !n.Browser.android23 && !n.Browser.mobileOpera}), n.DomUtil.TRANSITION && n.Map.addInitHook(function () {
        n.DomEvent.on(this._mapPane, n.DomUtil.TRANSITION_END, this._catchTransitionEnd, this)
    }), n.Map.include(n.DomUtil.TRANSITION ? {_zoomToIfClose: function (t, e) {
        if (this._animatingZoom)return!0;
        if (!this.options.zoomAnimation)return!1;
        var i = this.getZoomScale(e), o = this._getCenterOffset(t)._divideBy(1 - 1 / i);
        if (!this._offsetIsWithinView(o, 1))return!1;
        n.DomUtil.addClass(this._mapPane, "leaflet-zoom-anim"), this.fire("movestart").fire("zoomstart"), this.fire("zoomanim", {center: t, zoom: e});
        var s = this._getCenterLayerPoint().add(o);
        return this._prepareTileBg(), this._runAnimation(t, e, i, s), !0
    }, _catchTransitionEnd: function () {
        this._animatingZoom && this._onZoomTransitionEnd()
    }, _runAnimation: function (t, e, i, o, s) {
        this._animateToCenter = t, this._animateToZoom = e, this._animatingZoom = !0, n.Draggable && (n.Draggable._disabled = !0);
        var a = n.DomUtil.TRANSFORM, r = this._tileBg;
        clearTimeout(this._clearTileBgTimer), n.Util.falseFn(r.offsetWidth);
        var h = n.DomUtil.getScaleString(i, o), l = r.style[a];
        r.style[a] = s ? l + " " + h : h + " " + l
    }, _prepareTileBg: function () {
        var t = this._tilePane, e = this._tileBg;
        if (e && this._getLoadedTilesPercentage(e) > .5 && .5 > this._getLoadedTilesPercentage(t))return t.style.visibility = "hidden", t.empty = !0, this._stopLoadingImages(t), i;
        e || (e = this._tileBg = this._createPane("leaflet-tile-pane", this._mapPane), e.style.zIndex = 1), e.style[n.DomUtil.TRANSFORM] = "", e.style.visibility = "hidden", e.empty = !0, t.empty = !1, this._tilePane = this._panes.tilePane = e;
        var o = this._tileBg = t;
        n.DomUtil.addClass(o, "leaflet-zoom-animated"), this._stopLoadingImages(o)
    }, _getLoadedTilesPercentage: function (t) {
        var e, i, n = t.getElementsByTagName("img"), o = 0;
        for (e = 0, i = n.length; i > e; e++)n[e].complete && o++;
        return o / i
    }, _stopLoadingImages: function (t) {
        var e, i, o, s = Array.prototype.slice.call(t.getElementsByTagName("img"));
        for (e = 0, i = s.length; i > e; e++)o = s[e], o.complete || (o.onload = n.Util.falseFn, o.onerror = n.Util.falseFn, o.src = n.Util.emptyImageUrl, o.parentNode.removeChild(o))
    }, _onZoomTransitionEnd: function () {
        this._restoreTileFront(), n.DomUtil.removeClass(this._mapPane, "leaflet-zoom-anim"), n.Util.falseFn(this._tileBg.offsetWidth), this._animatingZoom = !1, this._resetView(this._animateToCenter, this._animateToZoom, !0, !0), n.Draggable && (n.Draggable._disabled = !1)
    }, _restoreTileFront: function () {
        this._tilePane.innerHTML = "", this._tilePane.style.visibility = "", this._tilePane.style.zIndex = 2, this._tileBg.style.zIndex = 1
    }, _clearTileBg: function () {
        this._animatingZoom || this.touchZoom._zooming || (this._tileBg.innerHTML = "")
    }} : {}), n.Map.include({_defaultLocateOptions: {watch: !1, setView: !1, maxZoom: 1 / 0, timeout: 1e4, maximumAge: 0, enableHighAccuracy: !1}, locate: function (t) {
        if (t = this._locationOptions = n.extend(this._defaultLocateOptions, t), !navigator.geolocation)return this._handleGeolocationError({code: 0, message: "Geolocation not supported."}), this;
        var e = n.bind(this._handleGeolocationResponse, this), i = n.bind(this._handleGeolocationError, this);
        return t.watch ? this._locationWatchId = navigator.geolocation.watchPosition(e, i, t) : navigator.geolocation.getCurrentPosition(e, i, t), this
    }, stopLocate: function () {
        return navigator.geolocation && navigator.geolocation.clearWatch(this._locationWatchId), this
    }, _handleGeolocationError: function (t) {
        var e = t.code, i = t.message || (1 === e ? "permission denied" : 2 === e ? "position unavailable" : "timeout");
        this._locationOptions.setView && !this._loaded && this.fitWorld(), this.fire("locationerror", {code: e, message: "Geolocation error: " + i + "."})
    }, _handleGeolocationResponse: function (t) {
        var e = 180 * t.coords.accuracy / 4e7, i = 2 * e, o = t.coords.latitude, s = t.coords.longitude, a = new n.LatLng(o, s), r = new n.LatLng(o - e, s - i), h = new n.LatLng(o + e, s + i), l = new n.LatLngBounds(r, h), u = this._locationOptions;
        if (u.setView) {
            var c = Math.min(this.getBoundsZoom(l), u.maxZoom);
            this.setView(a, c)
        }
        this.fire("locationfound", {latlng: a, bounds: l, accuracy: t.coords.accuracy})
    }})
})(this, document);