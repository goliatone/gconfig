'use strict';
/*
 * gconfig.interpolate
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
}(this, 'gconfig.interpolate', function() {






    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    /**
     * GCPPath constructor
     *
     * @param  {object} config Configuration object.
     */
    var GCInterpolate = {};
    GCInterpolate.VERSION = '0.1.4';
    GCInterpolate.ID = 'GCInterpolate';

    /**
     * Registers the plugin with `GConfig`.
     * @param  {Object} GConfig GConfig class.
     */
    GCInterpolate.register = function(GConfig) {

        if (GConfig.PLUGINS[this.ID]) return true;

        /*
         * Keep a reference to the original
         * `get` method.
         */
        var _get = GConfig.prototype.get;

        /**
         * Overload `get` method with interpolation.
         * @param  {String} key          Configuration key
         * @param  {Mixed} defaultValue  Default value
         * @param  {String} namespace    Namespace id
         * @return {Mixed}
         */
        GConfig.prototype.get = function(key, devaultValue, namespace) {
            var value = _get.call(this, key, devaultValue, namespace);
            if (!_needsInterpolation(value)) return value;
            return _template(value, this.data);
        };

        /**
         * Explicit call to solve a templated expression
         * @param  {String} key          Configuration key
         * @param  {Mixed} defaultValue  Default value
         * @param  {String} namespace    Namespace id
         * @return {Mixed}
         */
        GConfig.prototype.interpolate = function(key, defaultValue, namespace) {
            return this.get(key, defaultValue, namespace);
        };

        /**
         * Cycles through a GConfig instance and solves
         * all template references.
         * @return {this}
         */
        GConfig.prototype.solveDependencies = function() {
            var solve = function solve(data, namespace, self) {
                if (!data || typeof data !== 'object') return;
                var value;
                Object.keys(data).forEach(function(key) {
                    if (typeof data[key] === 'string') {
                        value = self.get(key, data[key], namespace);
                        self.set(key, value, namespace);
                    } else {
                        solve(data[key], key, self);
                    }
                });
            };

            solve(this.data, this.namespace, this);

            return this;
        };
    };

    /******************************************************
     * EXPOSE HELPER METHODS FOR UNIT TESTING.
    /******************************************************/
    GCInterpolate.h = {};
    GCInterpolate.h.template = _template;
    GCInterpolate.h.needsInterpolation = _needsInterpolation;
    GCInterpolate.h.resolvePropertyChain = _resolvePropertyChain;

    return GCInterpolate;
}));