"use strict";
/*
 * gconfig
 * https://github.com/goliatone/gconfig
 *
 * Copyright (c) 2013 goliatone
 * Licensed under the MIT license.
 */
/* jshint strict: false, plusplus: true */
/*global define: false, require: false, module: false, exports: false */
(function (root, name, deps, factory) {

    // Node
    if(typeof deps === 'function') {
        factory = deps;
        deps = [];
    }

    if (typeof exports === 'object') {
        module.exports = factory.apply(root, deps.map(require));
    } else if (typeof define === 'function' && 'amd' in define) {
        //require js, here we assume the file is named as the lower
        //case module name.
        define(name.toLowerCase(), deps, factory);
    } else {
        // Browser
        var d, i = 0, global = root, old = global[name], mod;
        while((d = deps[i]) !== undefined) deps[i++] = root[d];
        global[name] = mod = factory.apply(global, deps);
        //Export no 'conflict module', aliases the module.
        mod.noConflict = function(){
            global[name] = old;
            return mod;
        };
    }
    //TODO: Get rid of jquery!
}(this, 'gconfig.qstring', function() {


    /**
     * Parse query string into object.
     * @param   {String|undefined} query String to parse
     *                                   If undefined, location search
     *                                   is used.
     * @return  {Object}       Query string object.
     * @private
     */
    var _queryString = function _queryString(query) {
        if (typeof query !== 'string') query =  window.location.search;

        if(query.indexOf('?') === 0) query = query.substring(1);

        var out = {},
            hasOwn = out.hasOwnProperty,
            isArr  = Array.isArray,
            query  = query.replace(/\+/g, ' '),
            pairs  = query.split(/[&;]/),
            pair,
            key,
            value;

        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i].match(/^([^=]*)=?(.*)/);
            if(!pair[1]) continue;

            try {
                key  = decodeURIComponent(pair[1]);
                value = decodeURIComponent(pair[2]);
            } catch(e) {}

            if(!hasOwn.call(out, key)) out[key] = value;
            else if(isArr(out[key])) out[key].push(value);
            else out[key] = [out[key], value];
        }
        return out;
    };

    /**
     * Object to query string
     * TODO: Make for realz.
     * @param   {Object} obj Object to be serialized
     * @return  {String}     Serialized string
     * @private
     */
    var _stringify = function (a) {
        var prefix, s, add, name, r20, output;
        out = [];
        r20 = /%20/g;
        add = function (key, value) {
            // If value is a function, invoke it and return its value
            value = ( typeof value == 'function' ) ? value() : ( value == null ? "" : value );
            out[out.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
        };
        if (a instanceof Array) {
            for (name in a) add(name, a[name]);
        } else {
            for (prefix in a) _buildParams(prefix, a[ prefix ], add);
        }

        return out.join("&").replace(r20, "+");
    };

    var _buildParams = function _buildParams(prefix, obj, add) {
        var name, i, l, rbracket;
        rbracket = /\[\]$/;
        if (obj instanceof Array) {
            for (i = 0, l = obj.length; i < l; i++) {
                if (rbracket.test(prefix)) {
                    add(prefix, obj[i]);
                } else {
                    buildParams(prefix + "[" + ( typeof obj[i] === "object" ? i : "" ) + "]", obj[i], add);
                }
            }
        } else if (typeof obj == "object") {
            // Serialize object item.
            for (name in obj) {
                buildParams(prefix + "[" + name + "]", obj[ name ], add);
            }
        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    };

///////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////

    /**
     * GConfig constructor
     *
     * @param  {object} config Configuration object.
     */
    var GConfigQS = {};

    GConfigQS.register = function(GConfig){

        GConfig.prototype.toQueryString = function(){
            return _stringify(this.data);
        };

        GConfig.prototype.filterAttributes = function(data){
            return data;
        };

        GConfig.CONF_LOADERS.push('loadQueryString');

        GConfig.prototype.loadQueryString = function(queryString){
            this.log('WE ARE LOADING QUERY STRING');
            var qs = _queryString(queryString);
            qs = this.filterAttributes(qs);
            console.log(qs);
            window.kk = qs;
            this.merge(qs);
        };
    };

    return GConfigQS;
}));