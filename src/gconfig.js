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
    "use strict";
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
}(this, "GConfig", function() {



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

        if ( typeof context === "string" ) {
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

        // var addMetaCallback = _proxy(this.set, this);
        this.generateMeta();
        console.log('META: ', this.data);

        this.init();
    };

///////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////

    /**
     * Parse metadata
     * @param  {[type]} attribute [description]
     * @return {[type]}           [description]
     */
    GConfig.prototype.generateMeta = function( addMetaCallback )
    {
        var key = null, val = null, nsp = null;

        var meta = this.meta// || (this.meta = document.getElementsByTagName('meta'));

        // search desired tag
        for( var i = 0, l = meta.length; i < l; i++ )
        {
            key = meta[i].name || meta[i].getAttribute('property');
            // console.log('meta name: %s :: %s ', key, meta[i].content);

            //no key?
            if(!key) continue;

            //we have a regular meta, skip
            if( key.indexOf(':') === -1 ) return;

            nsp = key.split(':')[0];
            key = key.split(':')[1];
            val = meta[i].content;

            //trigger callback
            // addMetaCallback(key, val, nsp);
            this.set(key, val, nsp);
        }

    };

    GConfig.prototype.init = function(){};

    GConfig.prototype.use = function(ext){
        _extend(GConfig.prototype, ext);
        return this;
    };

    GConfig.prototype.configure = function(object, namespace){
        return _extend(object, this.getNamespace(namespace));
    };

    GConfig.prototype.merge = function(object, namespace){
        _extend(this.getNamespace(namespace), object);
        return this;
    };

    GConfig.prototype.set = function(key, value, namespace){
        console.log('Adding: %s::%s under %s.', key, value, namespace);
        namespace || (namespace = this.namespace);
        if(!(namespace in this.data)) this.data[namespace] = {};
        this.data[namespace][key] = value;
        return this;
    };

    GConfig.prototype.get = function(key, defaultValue, namespace){
        namespace || (namespace = this.namespace);
        if(!(namespace in this.data) || !(key in this.data[namespace]))
            return defaultValue;
        return this.data[namespace][key];
    };

    GConfig.prototype.getNamespace = function(namespace, notCloned){
        namespace || (namespace = this.namespace);
        if(!(namespace in this.data)) return {};
        return this.data[namespace];

        if(notCloned) return this.data[namespace];
        else return _extend({}, this.data[namespace]);
    };

    //This will eventually be deprecated!
    GConfig.prototype.addMeta = GConfig.prototype.set;
    GConfig.prototype.getMeta = GConfig.prototype.get;
    
    return GConfig;
}));