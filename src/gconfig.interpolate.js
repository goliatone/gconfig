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


    var DEFAULTS = {
        otag: '@{',
        ctag: '}'
    };

    /**
     * Parse query string into object.
     * @param   {String|undefined} query String to parse
     *                                   If undefined, location search
     *                                   is used.
     * @return  {Object}       Query string object.
     * @private
     */
    var _resolvePropertyChain = function(target, path, defaultValue) {
        if (!target || !path) return defaultValue;
        path = path.split('.');
        // console.warn('path', path, target);
        var l = path.length,
            i = 0,
            p = '';
        for (; i < l; ++i) {
            p = path[i];
            if (target.hasOwnProperty(p)) target = target[p];
            else return defaultValue;
        }
        return target;
    };

    /**
     * Simplte string interpolation function.
     * @param   {String} template
     * @param   {Object} context
     * @param   {String} otag     Open tag
     * @param   {String} ctag     Close tag
     * @return  {String}
     * @private
     */
    var _template = function(template, context, otag, ctag) {
        if (!template) return '';
        if (!context) return template;

        otag = otag || GCInterpolate.DEFAULTS.otag, ctag = ctag || GCInterpolate.DEFAULTS.ctag;

        template = template.split('.').join('\\.');

        function replaceTokens() {
            var prop = arguments[1];
            prop = prop.replace(/\\/g, '');
            return _resolvePropertyChain(context, prop, otag + prop + ctag);
        }

        return template.replace(new RegExp(otag + '([^}\\r\\n]*)' + ctag, 'g'), replaceTokens)
                       .replace(/\\./g, '.');
    };

    var _needsInterpolation = function(key, otag, ctag) {
        otag = otag || GCInterpolate.DEFAULTS.otag, ctag = ctag || GCInterpolate.DEFAULTS.ctag;
        if (!key || typeof key !== 'string') return false;
        return !!key.match(new RegExp(otag + '([^}\\r\\n]*)' + ctag, 'g'));
    };

    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    /**
     * GCPPath constructor
     *
     * @param  {object} config Configuration object.
     */
    var GCInterpolate = {};
    GCInterpolate.VERSION = '0.1.7';
    GCInterpolate.ID = 'GCInterpolate';
    GCInterpolate.DEFAULTS = DEFAULTS;
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
            return this.interpolate(value, this.data);
        };

        /**
         * Explicit call to solve a templated expression
         * @param  {String} template     Template string
         * @param  {Object} data         Template context
         * @return {String}
         */
        GConfig.prototype.interpolate = function(template, data) {
            return _template(template, data);
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
