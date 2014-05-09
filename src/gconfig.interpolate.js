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
        console.warn('path', path, target)
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

    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    /**
     * GCPPath constructor
     *
     * @param  {object} config Configuration object.
     */
    var GCInterpolate = {};
    var compiled = function(template, context, getter, otag, ctag) {
        template = template.split('.').join('\\.');

        function replaceFn() {
            var prop = arguments[1];
            prop = prop.replace(/\\/g, '');
            console.log('PROP', prop.replace(/\\/g, ''), context)

            return _resolvePropertyChain(context, prop)
        }
        otag = otag || '@{';
        ctag = ctag || '}';
        console.warn('template', otag + '(\\w+)' + ctag)
        return template.replace(/@{([^}\r\n]*)}/g, replaceFn);
    };
    GCInterpolate.register = function(GConfig) {
        var _get = GConfig.prototype.get;

        GConfig.prototype.interpolate = function(key, defaultValue, namespace) {
            var value = this.get(key, defaultValue, namespace);
            console.log('interpolate', value)
            return compiled(value, this.data, this.get);
        };
    };


    return GCInterpolate;
}));