'use strict';
/*
 * gconfig.path
 * https://github.com/goliatone/gconfig
 *
 * Copyright (c) 2013 goliatone
 * Licensed under the MIT license.
 */
/* jshint strict: false, plusplus: true */
/*global define: false, require: false, module: false, exports: false */
(function(root, name, deps, factory) {

    // Node
    if (typeof deps === 'function') {
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
        var d, i = 0,
            global = root,
            old = global[name],
            mod;
        while ((d = deps[i]) !== undefined) deps[i++] = root[d];
        global[name] = mod = factory.apply(global, deps);
        //Export no 'conflict module', aliases the module.
        mod.noConflict = function() {
            global[name] = old;
            return mod;
        };
    }
}(this, 'gconfig.typed', function() {

    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    /**
     * GCTyped constructor
     *
     * @param  {object} config Configuration object.
     */
    var GCTyped = {};
    GCTyped.ID = 'GCTyped';
    GCTyped.VERSION = '0.0.1';

    GCTyped.register = function(GConfig) {
        if (GConfig.PLUGINS[this.ID]) return true;


        GConfig.prototype.asBool = function(path, def, namespace) {
            def = def === undefined ? false : def;

            if (!this.has(path, namespace)) return def;

            try {
                return this.get(path, def, namespace).toLowerCase() === 'true';
            } catch (e) {
                this.logger.warn('conversion error', e);
                return def;
            }
        };

        GConfig.prototype.asInt = function(path, def, namespace) {
            def = def === undefined ? 0 : def;

            if (!this.has(path, namespace)) return def;

            try {
                var out = parseInt(this.get(path, def, namespace));
                return isNaN(out) ? def : out;
            } catch (e) {
                this.logger.warn('conversion error', e);
                return def;
            }
        };

        GConfig.prototype.asNumber = function(path, def, namespace) {
            def = def === undefined ? 0 : def;

            if (!this.has(path, namespace)) return def;

            try {
                var out = parseFloat(this.get(path, def, namespace));
                return isNaN(out) ? def : out;
            } catch (e) {
                this.logger.warn('conversion error', e);
                return def;
            }
        };

        GConfig.prototype.asArray = function(path, def, namespace) {
            def = def === undefined ? [] : def;

            if (!this.has(path, namespace)) return def;

            try {
                return JSON.parse(this.get(path, def, namespace));
            } catch (e) {
                this.logger.warn('conversion error', e);
                return def;
            }

        };

        GConfig.prototype.asObject = function(path, def, namespace) {
            def = def === undefined ? {} : def;

            if (!this.has(path, namespace)) return def;

            try {
                return JSON.parse(this.get(path, def, namespace));
            } catch (e) {
                this.logger.warn('conversion error', e);
                return def;
            }
        };
    };

    /******************************************************
     * EXPOSE HELPER METHODS FOR UNIT TESTING.
    /******************************************************/
    GCTyped.h = {};

    return GCTyped;
}));