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
}(this, 'gconfig.path', function() {


    /**
     * Parse query string into object.
     * @param   {String|undefined} query String to parse
     *                                   If undefined, location search
     *                                   is used.
     * @return  {Object}       Query string object.
     * @private
     */
    var _resolvePropertyChain = function(target, path, defaultValue){
        if(typeof path === 'string') path = path.split('.');
        var l = path.length, i = 0, p = '';
        for (; i < l; ++i ) {
            p = path[i];
            if ( target.hasOwnProperty( p ) ) target = target[ p ];
            else return defaultValue;
        }
        return target;
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

    GCPPath.register = function(GConfig){
        GConfig.prototype.resolve = function(path, defaultValue){
            return _resolvePropertyChain(this.data, path, defaultValue);
        };

        var _set = GConfig.prototype.set;

        GConfig.prototype.set = function(key, value, namespace){
            if(!key) return this;
            if(key.indexOf('.') === -1) return _set.call(this, key, value, namespace);
            //
            var keys = key.split('.'),
            //Need to check for namespace, if it does not exist
                target = namespace ? this.getNamespace(namespace) : this.data;

            key = keys.pop();
            keys.forEach(function(prop){
                if(!target[prop]) target[prop] = {};
                target = target[prop];
            });
            target[key] = value;

            return this;
        };
    };


    return GCPPath;
}));