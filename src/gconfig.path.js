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
        if (!target || !path) return false;
        path = path.split('.');
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
        if (!target) return false;

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
        if(GConfig.PLUGINS[this.ID]) return true;

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
            /*if (path.indexOf('.') !== -1) {
                var namespace = path.split('.')[0];
                if (!this.data.hasOwnProperty(namespace)) this.logger.warn('Invalid path');
            }*/
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

            /*
             * If we have a namespace, ensure that is not also
             * present in the key path.
             * If we do not have a namespace, then by making up
             * a non existent namespace and providing
             * `this.data` to `getNamespace` we ensure that we
             * append to `this.data`.
             * @see getNamespace
             */
            if (namespace) {
                key = key.replace(new RegExp('^' + namespace + '\\.'), '');
            } else namespace = 'SKIP_DEFAULT_NAMESAPCE_GET__DATA_OBJECT';

            _setPropertyChain(this.getNamespace(namespace, this.data), key, value);
            return this;
        };
    };

    /******************************************************
     * EXPOSE HELPER METHODS FOR UNIT TESTING.
    /******************************************************/
    GCPPath.h = {};
    GCPPath.h.setPropertyChain = _setPropertyChain;
    GCPPath.h.resolvePropertyChain = _resolvePropertyChain;

    return GCPPath;
}));