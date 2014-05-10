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


    /**
     * Parse query string into object.
     * @param   {String|undefined} query String to parse
     *                                   If undefined, location search
     *                                   is used.
     * @return  {Object}       Query string object.
     * @private
     */
    var _resolvePropertyChain = function(target, path, defaultValue) {
        if (typeof path === 'string') path = path.split('.');
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
    var _template = function(template, context, getter, otag, ctag) {
        otag = otag || '@{';
        ctag = ctag || '}';

        template = template.split('.').join('\\.');

        function replaceTokens() {
            var prop = arguments[1];
            prop = prop.replace(/\\/g, '');
            return _resolvePropertyChain(context, prop);
        }

        return template.replace(/@{([^}\r\n]*)}/g, replaceTokens);
    };

    var _needsInterpolation = function(key) {
        return !!key.match(/@{([^}\r\n]*)}/g);
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
    GCInterpolate.VERSION = '0.1.3';
    GCInterpolate.ID = 'GCInterpolate';

    /**
     * Registers the plugin with `GConfig`.
     * @param  {Object} GConfig GConfig class.
     */
    GCInterpolate.register = function(GConfig) {
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
    GCInterpolate.template = _template;
    GCInterpolate.needsInterpolation = _needsInterpolation;
    GCInterpolate.resolvePropertyChain = _resolvePropertyChain;

    return GCInterpolate;
}));