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
    //TODO: Get rid of jquery!
}(this, 'gconfig.path', function() {


    /**
     * Returns the value of a path in dot notation
     * to a `target`s property.
     *
     * @param   {Object} target
     * @param   {String} path
     * @param   {Object} defaultValue
     * @return  {Object}
     * @private
     */
    var _resolvePropertyChain = function(target, path, defaultValue) {
        if (typeof path === 'string') path = path.split('.');
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

    var _setPropertyChain = function(target, key, value) {
        if (!target) throw new Error('WE NEED A VALID TARGET');
        var keys = key.split('.');
        key = keys.pop();
        keys.forEach(function(prop) {
            if (!target[prop]) target[prop] = {};
            target = target[prop];
        });

        target[key] = value;
    };

    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    /**
     * GCPPath constructor
     *
     * @param  {object} config Configuration object.
     */
    var GCPPath = {};
    GCPPath.ID = 'GCPPath';
    GCPPath.VERSION = '0.3.0';

    GCPPath.register = function(GConfig) {
        /*
         * Keep a reference to the original
         * `set` method.
         */
        var _set = GConfig.prototype.set;

        /**
         * Gets the value of a property addressed with
         * dot notation.
         * @param  {String} key          Configuration key
         * @param  {Mixed} defaultValue  Default value
         * @return {Mixed}
         */
        GConfig.prototype.resolve = function(path, defaultValue) {
            return _resolvePropertyChain(this.data, path, defaultValue);
        };

        /**
         * Override original set
         * Set a key value under the given namespace
         * @param {String} key       Property value
         * @param {Object} value     Value to be added
         * @param  {String} namespace Namespace id
         * @return {GConfig}          Fluid interface.
         */
        GConfig.prototype.set = function(key, value, namespace) {
            if (!key) return this;
            if (key.indexOf('.') === -1) return _set.call(this, key, value, namespace);
            if (!this.getNamespace(namespace, this.data)) throw new Error('FUCK IT')
            _setPropertyChain(this.getNamespace(namespace, this.data), key, value);
            return this;
        };
    };

    /******************************************************
     * EXPOSE HELPER METHODS FOR UNIT TESTING.
    /******************************************************/
    GCPPath.resolvePropertyChain = _resolvePropertyChain;

    return GCPPath;
}));