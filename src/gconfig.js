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

    /**
     * Proxy method
     * @param  {Function} fn      Function to be proxied
     * @param  {Object}   context Context for the method.
     */
    var _proxy = function( fn, context ) {
        var tmp, args, proxy, slice = Array.prototype.slice;

        if ( typeof context === 'string') {
            tmp = fn[ context ];
            context = fn;
            fn = tmp;
        }

        if ( ! typeof(fn) === 'function') return undefined;

        args = slice.call(arguments, 2);
        proxy = function() {
            return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
        };

        return proxy;
    };

    var options = {
        //http://stackoverflow.com/questions/7602410/how-do-i-find-elements-that-contain-a-data-attribute-matching-a-prefix-using-j
        selector:'meta[name^="::NAMESPACE::-"]',
        namespace:'app'
    };

///////////////////////////////////////////////////
// CONSTRUCTOR
///////////////////////////////////////////////////

    /**
     * GConfig constructor
     * 
     * @param  {object} config Configuration object.
     */
    var GConfig = function(config){
        _extend(options, config || {});

        this.data = {};
        this.meta = document.getElementsByTagName('meta');
        
        this.namespaces = [];
        this.options = options;
        this.namespace = options.namespace;

        //TODO: Should we do methods instead of strings?
        this.loaders = ['loadMedatada'];
        this.loadMedatada.async = false;

        this.initialized = false;

        this.init();
    };

///////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////
    
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
        this.loaders.forEach(function(loader){
            this[loader].call(this);
        }, this);
        this.onConfigLoaded();
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

    GConfig.prototype.init = function(){
        if(this.initialized) return;
        this.initialized = true;
        // var addMetaCallback = _proxy(this.set, this);
        this.getConfig( );
        this.log('META: ', this.data);
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
        _extend(GConfig.prototype, ext);
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
        //TODO: Make bindable.
        this.log('Adding: %s::%s under %s.', key, value, namespace);
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
     * @param  {String} namespace Namespace id
     * @param  {Boolean} notCloned Should we clone namespace
     * @return {Object}           Namespace object.
     */
    GConfig.prototype.getNamespace = function(namespace, notCloned){
        namespace || (namespace = this.namespace);
        if(!(namespace in this.data)) return {};
        return this.data[namespace];

        if(notCloned) return this.data[namespace];

        return _extend({}, this.data[namespace]);
    };

    /**
     * Simple log implementation.
     */
    GConfig.prototype.log = function(){
        if(!this.debug) return;
        console.log.apply(console, arguments);
    };

    //This will eventually be deprecated!
    GConfig.prototype.addMeta = GConfig.prototype.set;
    GConfig.prototype.getMeta = GConfig.prototype.get;
    
    return GConfig;
}));