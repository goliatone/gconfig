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
}(this, 'GConfig', function() {



    /**
     * Extend method.
     * @param  {Object} target Source object
     * @return {Object}        Resulting object from
     *                         meging target to params.
     */
    var _extend = function(target) {
        var i = 1, length = arguments.length, source;
        for ( ; i < length; i++ ) {
            // Only deal with defined values
            if ((source = arguments[i]) != undefined ){
                Object.getOwnPropertyNames(source).forEach(function(k){
                    var d = Object.getOwnPropertyDescriptor(source, k) || {value:source[k]};
                    if (d.get) {
                        target.__defineGetter__(k, d.get);
                        if (d.set) target.__defineSetter__(k, d.set);
                    } else if (target !== d.value) target[k] = d.value;
                });
            }
        }
        return target;
    };

    var _map = function(arr, done) {
        var i    = -1,
            len  = arr.length,
            args = Array.prototype.slice.call(arguments, 2);
        (function next(result) {
            var each,
                async,
                abort = (typeof result === 'boolean');

            do{ ++i; } while (!(i in arr) && i !== len);

            if (abort || i === len) {
                if(done) return done(result);
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
    var _shimConsole = function(){
        var empty = {},
            con   = {},
            noop  = function() {},
            properties = 'memory'.split(','),
            methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
                       'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
                       'table,time,timeEnd,timeStamp,trace,warn').split(','),
            prop,
            method;

        while (method = methods.pop())    con[method] = noop;
        while (prop   = properties.pop()) con[prop]   = empty;

        return con;
    };

///////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////
    
    var _OPTIONS = {
        selector:'meta[name^="::NAMESPACE::-"]',
        namespace:'app'
    };

    /**
     * GConfig constructor
     *
     * @param  {object} config Configuration object.
     */
    var GConfig = function(config){

        config  = config || {};

        config = _extend({}, GConfig.defaults || _OPTIONS, config);

        this.data = {};
        this.meta = document.getElementsByTagName('meta');

        this.namespaces = [];
        this.options = config;
        this.namespace = config.namespace;

        //TODO: Should we do methods instead of strings?
        !this.loaders && (this.loaders = []);

        this.addResourceLoader('metadata', this.loadMedatada.bind(this), 0);

        this.initialized = false;

        this.init(config);
    };

    GConfig.defaults = _OPTIONS;

///////////////////////////////////////////////////
// PUBLIC METHODS
///////////////////////////////////////////////////
    
    GConfig.prototype.init = function(config){
        if(this.initialized) return;
        this.initialized = true;
        config  = config || {};
        _extend(this, config);

        this.getConfig( );
        this.logger.log('META: ', this.data);
    };

    /**
     * Method that triggers data loaders.
     * By default, we use `loadMetadata` a
     * synchronous loader.
     * @return {GConfig}    Fluid interface.
     */
    GConfig.prototype.getConfig = function( )
    {
        //TODO: We should provide a next to each loader
        //to step forward on the chain.
        var onLoadersDone = function(){
            this.onConfigLoaded();
        }.bind(this);
        
        _map(this.loaders, onLoadersDone, this);
    };

    /**
     * TODO: Return promise or emit on done.
     * Method to update the meta object, from the meta NodeList
     */
    GConfig.prototype.loadMedatada = function( )
    {
        var key = null, val = null, nsp = null;

        var meta = this.meta || (this.meta = document.getElementsByTagName('meta'));

        // search desired tag
        for( var i = 0, l = meta.length; i < l; i++ )
        {
            key = meta[i].name || meta[i].getAttribute('property');
            // this.log('meta name: %s :: %s ', key, meta[i].content);

            //no key?
            if(!key) continue;

            //we have a regular meta, skip
            if( key.indexOf(':') === -1 ) continue;

            nsp = key.split(':')[0];
            key = key.split(':')[1];
            val = meta[i].content;

            //trigger callback
            // addMetaCallback(key, val, nsp);
            this.set(key, val, nsp);
        }
    };

    GConfig.prototype.onConfigLoaded = function(){
        /*setTimeout((function(){
            this.emit('ondata');
        }).bind(this), 0);*/
    };   

    /**
     * Extends GConfig's prototype. Use it to add
     * functionality or to override methods. The
     * idea is to support a plugin architecture.
     * @param  {Object} ext Object which's properties and
     *                      methods will get merged into
     *                      GConfig's prototype
     * @return {GConfig}    Fluid interface.
     */
    GConfig.prototype.use = function(ext){
        if(typeof ext === 'function') ext(GConfig);
        else if('register' in ext &&
            typeof ext.register === 'function') ext.register(GConfig);
        else if(typeof ext === 'object') _extend(GConfig.prototype, ext);

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
    GConfig.prototype.configure = function(object, namespace){
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
    GConfig.prototype.merge = function(object, namespace){
        _extend(this.getNamespace(namespace), object);
        return this;
    };

    /**
     * Set a key value under the given namespace
     * @param {String} key       Property value
     * @param {Object} value     Value to be added
     * @param  {String} namespace Namespace id
     * @return {GConfig}          Fluid interface.
     */
    GConfig.prototype.set = function(key, value, namespace){
        this.logger.log('Adding: %s::%s under %s.', key, value, namespace);
        namespace || (namespace = this.namespace);
        if(!(namespace in this.data)) this.data[namespace] = {};
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
    GConfig.prototype.get = function(key, defaultValue, namespace){
        namespace || (namespace = this.namespace);
        if(!(namespace in this.data) || !(key in this.data[namespace]))
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
    GConfig.prototype.getNamespace = function(namespace, clone){
        namespace || (namespace = this.namespace);

        if(!(namespace in this.data)){
            if(typeof clone === 'object') return clone;
            return {};
        }

        if(clone) return _extend({}, this.data[namespace]);

        return this.data[namespace];
    };

    /**
     * Simple log implementation.
     */
    GConfig.prototype.logger = console || _shimConsole();

    /**
     * TODO: We should do this at a global scope? Meaning before
     *       We create the instance?! Hoe we do this
     * Resource loader manager
     * @param {String} id     ID of resource loader.
     * @param {Function} loader Resource loader.
     */
    GConfig.prototype.addResourceLoader = function(id, loader, index){
        // this.loaders[id] = loader;
        if(index !== undefined) this.loaders.splice(index, 0, loader);
        else this.loaders.push(loader);
        return this;
    };

    //This will eventually be deprecated!
    GConfig.prototype.addMeta = GConfig.prototype.set;
    GConfig.prototype.getMeta = GConfig.prototype.get;

    return GConfig;
}));