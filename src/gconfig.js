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
}(this, 'GConfig', function() {

    /**
     * Extend method.
     * @param  {Object} target Source object
     * @return {Object}        Resulting object from
     *                         meging target to params.
     */
    var _extend = function extend(target) {
        var sources = [].slice.call(arguments, 1);
        sources.forEach(function(source) {
            for (var property in source) {
                if (source[property] && source[property].constructor &&
                    source[property].constructor === Object) {
                    target[property] = target[property] || {};
                    target[property] = extend(target[property], source[property]);
                } else target[property] = source[property];
            }
        });
        return target;
    };

    /**
     * Plug in implementation.
     * @param  {Function|Object} ext Plug in object.
     * @param  {Function|Object} src
     * @return {void}
     */
    var _using = function(ext, src, options) {
        if (typeof ext === 'function') ext(src, options);
        else if (ext && typeof ext.register === 'function') ext.register(src, options);
        else if (typeof ext === 'object') _extend(src, ext);
    };

    /**
     *
     * Based on [async-foreach]:https://github.com/cowboy/javascript-sync-async-foreach
     * @param  {Array}   arr
     * @param  {Function} done Callback
     * @return {void}
     */
    var _map = function(arr, done /*, ...rest*/ ) {
        var i = -1,
            len = arr.length,
            args = Array.prototype.slice.call(arguments, 2);
        (function next(result) {
            var each,
                async,
                abort = (typeof result === 'boolean');

            do {
                ++i;
            } while (!(i in arr) && i !== len);

            if (abort || i === len) {
                if (done) return done(result);
            }

            each = arr[i];
            result = each.apply({
                async: function() {
                    async = true;
                    return next;
                }
            }, args);

            if (!async) next(result);
        }());
    };

    /**
     * Shim console, make sure that if no console
     * available calls do not generate errors.
     * @return {Object} Console shim.
     */
    var _shimConsole = function(console) {

        if(console) return console;

        var empty = {},
            con = {},
            noop = function() {},
            properties = 'memory'.split(','),
            methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
                'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
                'table,time,timeEnd,timeStamp,trace,warn').split(','),
            prop,
            method;

        while (method = methods.pop()) con[method] = noop;
        while (prop = properties.pop()) con[prop] = empty;

        return con;
    };

    var _shimRequire = function(){
        var loader = function(){};
        try{
            loader = require;
        }catch(e){
            console && console.warn('No require found');
        }

        return loader;
    };

    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    var DEFAULTS = {
        namespace: 'app',
        autoinitialize: true
    };

    /**
     * GConfig constructor
     *
     * @param  {object} config Configuration object.
     */
    var GConfig = function(config) {

        config = config || {};

        config = _extend({}, this.constructor.DEFAULTS, config);

        this.data = config.data || {};

        this.namespaces = [];
        this.options = config;
        this.namespace = config.namespace;

        //TODO: Should we do methods instead of strings?
        this.loaders = this.loaders || [];

        this.initialized = false;

        if (config.autoinitialize) this.init(config);
    };

    GConfig.VERSION = '0.6.14';

    /**
     * GConfig default config object.
     */
    GConfig.defaults =
    GConfig.DEFAULTS = DEFAULTS;

    /**
     * GConfig configuration loaders.
     */
    GConfig.CONF_LOADERS = ['loadMedatada'];

    /**
     * Register of plugins that have
     * extended GConfig.
     * @type {Object}
     */
    GConfig.PLUGINS = {};

    /**
     * EXPERIMENTAL!
     * Module loader, defaults
     * to `require`
     * @type {Function}
     */
    GConfig.loader = _shimRequire();


    GConfig.logger = _shimConsole(console);

    /**
     * Require plugins and register on
     * load. Asynchronous
     * @augments {arguments} List of plugin names.
     * @return {void}
     */
    GConfig.require = function() {
        var plugins = [].slice.call(arguments);
        this.loader(plugins, function() {
            var plugins = [].slice.call(arguments);
            plugins.forEach(function(plugin) {
                plugin.register(GConfig);
            });
        });
        return this;
    };

    /**
     * GConfig extend method.
     * @param  {Object|Function} ext
     * @return {void}
     */
    GConfig.extend = function() {
        var plugins = [].slice.call(arguments);
        plugins.forEach(function(plugin) {
            if (!plugin) {
                return this.logger.warn('Null plugin registered!');
            }
            _using(plugin, this);
            if (!plugin.hasOwnProperty('ID') || !plugin.hasOwnProperty('ID')) {
                return this.logger.warn('Plugin does not have ID or VERSION property.');
            }
            GConfig.PLUGINS[plugin.ID] = plugin.VERSION;
        }, this);
        return this;
    };
    ///////////////////////////////////////////////////
    // PUBLIC METHODS
    ///////////////////////////////////////////////////

    GConfig.prototype.init = function(config) {
        if (this.initialized) return false;
        this.initialized = true;

        config = _extend({}, GConfig.defaults || _OPTIONS, config);
        _extend(this, config);

        this.getConfig();

        this.postInit();

        this.logger.log('META: ', this.data);
    };

    /**
     * Method that triggers data loaders.
     * By default, we use `loadMetadata` a
     * synchronous loader.
     * @return {GConfig}    Fluid interface.
     */
    GConfig.prototype.getConfig = function() {
        /*
         * Append all loaders to our instance. This we assigned
         * globally using `GCongfig.CONF_LOADERS`.
         */
        GConfig.CONF_LOADERS.forEach(function(element, index, array) {
            if (!this[element]) return;
            this.addResourceLoader(element, this[element].bind(this), index);
        }, this);

        /*
         * Iterate over registered loaders, and execute each.
         * Loaders can be async. Fire `onConfigLoaded` on done.
         */
        _map(this.loaders, this.onConfigLoaded.bind(this), this);
    };

    /**
     * Post initialization method. The current
     * implementation will not work since we have
     * `autoinitialize` and we do not have time
     * to add the listener.
     *
     * @return {void}
     */
    GConfig.prototype.postInit = function() {
        this.emit('initialized');
    };

    /**
     * Default resource loader.
     * Pulls data from DOMs `meta` tags.
     *
     */
    GConfig.prototype.loadMedatada = function() {
        var key = null,
            val = null,
            nsp = null;

        var meta = this.meta || (this.meta = document.getElementsByTagName('meta'));

        // search desired tag
        for (var i = 0, l = meta.length; i < l; i++) {
            key = meta[i].name || meta[i].getAttribute('property');

            //no key?
            if (!key) continue;

            //we have a regular meta, skip
            if (key.indexOf(':') === -1) continue;

            nsp = key.split(':')[0];
            key = key.split(':')[1];
            val = meta[i].content;

            this.set(key, val, nsp);
        }
    };

    /**
     * Handler called when configuration
     * loaders have finalized loading and
     * parsing
     * @return {void}
     * @private
     * @event 'ondata'
     */
    GConfig.prototype.onConfigLoaded = function() {
        /*
         * Schedule for next tick, so that registered
         * events get notified regardless if they are
         * attached after creating an instance.
         */
        setTimeout((function() {
            this.emit('ondata');
        }).bind(this), 0);
    };

    /**
     * TODO: Review plugin procedure. We want to pass
     *       GConfig to plugin to extend and initialize.
     *
     * Extends GConfig's prototype. Use it to add
     * functionality or to override methods. The
     * idea is to support a plugin architecture.
     * @param  {Object} ext Object which's properties and
     *                      methods will get merged into
     *                      GConfig's prototype
     * @return {GConfig}    Fluid interface.
     */
    GConfig.prototype.use = function(ext) {
        var plugins = [].slice.call(arguments);
        plugins.forEach(function(plugin) {
            _using(plugin, this);
        }, this);
        return this;
    };

    /**
     * It will extend the provided object with the
     * matching configuration object under the given
     * namespace.
     * If no namespace is provided, the default one
     * will be used.
     * TODO: Do we want to return GConfig or provided
     * source object? Which should be the chain's subject?
     *
     * @param  {Object} object    Object to be config.
     * @param  {String} namespace Namespace id
     * @return {GConfig}          Fluid interface.
     */
    GConfig.prototype.configure = function(object, namespace) {
        _extend(object, this.getNamespace(namespace));
        return this;
    };

    /**
     * Extend the identified namespace with the
     * given object.
     *
     * @param  {Object} object    Object to be merged.
     * @param  {String} namespace Namespace id.
     * @return {GConfig}          Fluid interface.
     */
    GConfig.prototype.merge = function(object, namespace) {
        _extend(this.getNamespace(namespace, this.data), object);
        return this;
    };

    /**
     * Set a key value under the given namespace
     * @param {String} key       Property value
     * @param {Object} value     Value to be added
     * @param  {String} namespace Namespace id
     * @return {GConfig}          Fluid interface.
     */
    GConfig.prototype.set = function(key, value, namespace) {
        namespace || (namespace = this.namespace);
        if (!(namespace in this.data)) this.data[namespace] = {};
        this.data[namespace][key] = value;
        return this;
    };

    /**
     * Get a value by key, we can provide a default
     * value in case the key is not registered.
     * @param  {String} key          Key
     * @param  {Object} defaultValue Default value
     * @param  {String} namespace Namespace id
     * @return {Object}           Key value
     */
    GConfig.prototype.get = function(key, defaultValue, namespace) {
        namespace || (namespace = this.namespace);
        if (!(namespace in this.data) || !(key in this.data[namespace]))
            return defaultValue;
        return this.data[namespace][key];
    };

    /**
     * Returns a clone of the configuration object
     * identified by `namespace` id.
     * If no namespace id is provided, default is used.
     * We can also pass a second argument to indicate
     * if we want to get a clone of the namespace object
     * or the actual reference.
     *
     * @param  {String} namespace   Namespace id
     * @param  {Boolean} clone      Should we clone namespace
     * @return {Object}             Namespace object.
     */
    GConfig.prototype.getNamespace = function(namespace, clone) {
        namespace || (namespace = this.namespace);

        if (!(namespace in this.data)) {
            if (typeof clone === 'object') return clone;
            return {};
        }

        if (clone === true) return _extend({}, this.data[namespace]);

        return this.data[namespace];
    };

    /**
     * Simple log implementation.
     */
    GConfig.prototype.logger = _shimConsole(console);

    /**
     * Stub emit function. User must extend
     * and implement to get events.
     */
    GConfig.prototype.emit = function(event, options) {};

    /**
     * TODO: We should do this at a global scope? Meaning before
     *       We create the instance?! Hoe we do this
     * Resource loader manager
     * @param {String} id     ID of resource loader.
     * @param {Function} loader Resource loader.
     */
    GConfig.prototype.addResourceLoader = function(id, loader, index) {
        // this.loaders[id] = loader;
        if (index !== undefined) this.loaders.splice(index, 0, loader);
        else this.loaders.push(loader);
        return this;
    };

    //This will eventually be deprecated!
    GConfig.prototype.addMeta = GConfig.prototype.set;
    GConfig.prototype.getMeta = GConfig.prototype.get;

    /******************************************************
     * EXPOSE HELPER METHODS FOR UNIT TESTING.
    /******************************************************/
    GConfig.h = {};
    GConfig.h.map = _map;
    GConfig.h.using = _using;
    GConfig.h.extend = _extend;

    return GConfig;
}));