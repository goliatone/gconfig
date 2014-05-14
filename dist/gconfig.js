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
        if(!target || !path) return defaultValue;
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
        if(!template) return '';
        if(!context) return template;

        otag = otag || '@{';
        ctag = ctag || '}';

        template = template.split('.').join('\\.');

        function replaceTokens() {
            var prop = arguments[1];
            prop = prop.replace(/\\/g, '');
            return _resolvePropertyChain(context, prop, otag+prop+ctag);
        }

        return template.replace(/@{([^}\r\n]*)}/g, replaceTokens);
    };

    var _needsInterpolation = function(key) {
        if(!key) return false;
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

        if(GConfig.PLUGINS[this.ID]) return true;

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
    GCInterpolate.h = {};
    GCInterpolate.h.template = _template;
    GCInterpolate.h.needsInterpolation = _needsInterpolation;
    GCInterpolate.h.resolvePropertyChain = _resolvePropertyChain;

    return GCInterpolate;
}));
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
    var _shimConsole = function() {
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

    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    var _OPTIONS = {
        selector: 'meta[name^="::NAMESPACE::-"]',
        namespace: 'app'
    };

    /**
     * GConfig constructor
     *
     * @param  {object} config Configuration object.
     */
    var GConfig = function(config) {

        config = config || {};

        config = _extend({}, GConfig.defaults || _OPTIONS, config);

        this.data = config.data || {};

        this.namespaces = [];
        this.options = config;
        this.namespace = config.namespace;

        //TODO: Should we do methods instead of strings?
        this.loaders = this.loaders || [];

        this.initialized = false;

        this.init(config);
    };

    GConfig.VERSION = '0.6.10';

    /**
     * GConfig default config object.
     */
    GConfig.defaults = _OPTIONS;

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
     * Module loader, defaults
     * to `require`
     * @type {Function}
     */
    GConfig.loader = require;


    GConfig.logger = console;

    /**
     * Require plugins and register on
     * load. Asynchronous
     * @augments {arguments} List of plugin names.
     * @return {void}
     */
    GConfig.require = function() {
        var plugins = [].slice.call(arguments);
        console.log('REQUIRE', plugins);
        this.loader(plugins, function() {
            console.log('REQUIRE DONE', arguments);
            var plugins = [].slice.call(arguments);
            plugins.forEach(function(plugin) {
                console.log('register', plugin);
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
            if(!plugin){ 
                return this.logger.warn('Null plugin registered!');
            }            
            _using(plugin, this);            
            if(! plugin.hasOwnProperty('ID') || ! plugin.hasOwnProperty('ID')){
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

        //Iterate over loaders, and execute each. It could be async.
        _map(this.loaders, this.onConfigLoaded.bind(this), this);
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

    GConfig.prototype.onConfigLoaded = function() {
        //Schedule for next tick, so that registered
        //events get notified regardless.
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
    GConfig.prototype.logger = console || _shimConsole();

    /**
     * Stub emit function. User must extend
     * and implement to get events.
     */
    GConfig.prototype.emit = function() {};


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
             * this.data to `getNamespace` we ensure that we
             * append to this.data.
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
    //TODO: Get rid of jquery!
}(this, 'gconfig.qstring', ['jquery'], function($) {


    var _isArray = ('isArray' in Array) ? Array.isArray : function(value) {
            return Object.prototype.toString.call(value) === '[object Array]';
        };

    var _isObject = function(obj) {
        if(!obj) return false;
        return obj.constructor.toString().indexOf('function Object') === 0;
        return typeof obj === 'object';
    };

    //TODO: Remove!! Replace with custom method
    var _each = $.each;

    /**
     * TODO: Remove!! Replace with custom method
     * Extend method.
     * @param  {Object} target Source object
     * @return {Object}        Resulting object from
     *                         meging target to params.
     */
    var _extend = $.extend;

    var encoders = {
        'encode array': {
            test: function(key, value) {
                return _isArray(value);
            },
            encode: function(key, value) {
                return [key.replace(/\[|\]/g, ''), value.join('|')];
            }
        },
        'encode object': {
            test: function(key, value) {
                return _isObject(value);
            },
            encode: function(key, value) {
                return [key, serializeObject(value, key), {
                    'skip': true
                }];
            }
        },
        'delete empty values': {
            test: function(key, value) {
                return value === '';
            },
            encode: function(key, value) {
                return false;
            }
        },
        'encode': {
            test: function(key, value) {
                return true;
            },
            encode: function(key, value) {
                return [encodeURIComponent(key), encodeURIComponent(value)];
            }
        },
        'convert spaces to +': {
            test: function(key, value) {
                return true;
            },
            encode: function(key, value) {
                return [key, value.replace(/%20/g, '+')];
            }
        },
        'convert encoded pipes to |': {
            test: function(key, value) {
                return true;
            },
            encode: function(key, value) {
                return [key, value.replace(/%7C/g, '|')];
            }
        }
    };

    var decoders = {
        'decode': {
            test: function(key, value) {
                return true;
            },
            decode: function(key, value) {
                return [decodeURIComponent(key), decodeURIComponent(value)];
            }
        },
        'decode + to space': {
            test: function(key, value) {
                return true;
            },
            decode: function(key, value) {
                return [key, value.replace(RE_PLUS, ' ')];
            }
        },
        'decode pipes to array': {
            test: function(key, value) {
                return /\|/.test(value);
            },
            decode: function(key, value) {
                return [key, value.split('|')];
            }
        },
        'decode stringified object': {
            test: function(key, value) {
                return /\[/.test(key);
            },
            decode: function(key, value) {
                return [key, unserializeObject(key, value)];
            }
        }
    };

    var RE_PLUS = /\+/g;
    var RE_PAIR = /([^&=]+)=?([^&]*)/g;

    var encodeKeyValue = function encodeKeyValue(key, value) {
        var removed;

        _each(encoders, function(desc, encoder) {
            var needsEncoding = encoder.test;
            var encode = encoder.encode;
            var encoded;

            if (needsEncoding(key, value)) {
                encoded = encode(key, value);

                if (encoded === false) {
                    removed = true;
                    return false;
                }

                key = encoded[0];
                value = encoded[1];

                if (encoded[2] && encoded[2].skip) {
                    return false;
                }
            }
        });

        if (removed) return false;

        return [key, value];
    };

    var encodeObject = function encodeObject(obj) {
        var out = {},
            encoded;

        _each(obj, function(key, value) {
            encoded = encodeKeyValue(key, value);
            if (encoded === false) return;

            if (_isObject(encoded[1])) _extend(out, encoded[1]);
            else out[encoded[0]] = encoded[1];
        });

        return out;
    };

    var serializeObject = function serializeObject(obj, prefix) {
        var flatObject = {},
            flatKey;

        prefix = prefix || '';

        _each(obj, function(key, value) {
            key = encodeKeyValue(key, 'ignore')[0];
            flatKey = prefix + '[' + key + ']';

            if (_isObject(value)) {
                _extend(flatObject, serializeObject(value, flatKey));
            } else {
                value = encodeKeyValue('ignore', value)[1];
                flatObject[flatKey] = value;
            }
        });

        return flatObject;
    };

    var unserializeObject = function unserializeObject(key, value) {
        var temp = key.split('[', 2),
            keyParts = [temp[0]].concat(temp[1].split(/\/\]\[|\]/)),
            object = {},
            tempObj = object,
            prevKeyPart;

        _each(keyParts, function(i, keyPart) {
            if (keyPart !== '') {
                tempObj[keyPart] = {};

                if (keyParts[i + 1] !== '') {
                    tempObj = tempObj[keyPart];
                }
            } else {
                tempObj[prevKeyPart] = value;
            }

            prevKeyPart = keyPart;
        });

        return object;
    };

    var objectToQueryString = function objectToQueryString(obj, startChar) {
        var out = encodeObject(obj);
        var encodedKeyValues = [];

        _each(out, function(key, value) {
            encodedKeyValues.push(key + '=' + value);
        });

        if (encodedKeyValues.length) {
            startChar = startChar || '?';
            return startChar + encodedKeyValues.join('&');
        }

        return '';
    };

    var decodeKeyValue = function decodeKeyValue(key, value) {
        _each(decoders, function(desc, decoder) {
            var needsDecoding = decoder.test;
            var decode = decoder.decode;
            var decoded;

            if (needsDecoding(key, value)) {
                decoded = decode(key, value);

                key = decoded[0];
                value = decoded[1];

                if (decoded[2] && decoded[2].skip) {
                    return false;
                }
            }
        });

        return [key, value];
    };

    var queryStringToObject = function queryStringToObject(str) {
        var decodedObject = {};
        if (!str || str.length === 0) return decodedObject;
        var match;

        if (str[0] === '?') str = str.slice(1);


        while (match = RE_PAIR.exec(str)) {
            (function(key, value) {
                var decoded = decodeKeyValue(key, value);

                if (_isObject(decoded[1])) {
                    _extend(true, decodedObject, decoded[1]);
                } else {
                    decodedObject[decoded[0]] = decoded[1];
                }
            }(match[1], match[2]));
        }

        return decodedObject;
    };

    var QueryString = {};
    QueryString.parse = queryStringToObject;
    QueryString.stringify = objectToQueryString;

    ///////////////////////////////////////////////////
    // CONSTRUCTOR
    ///////////////////////////////////////////////////

    /**
     * GConfig constructor
     *
     * @param  {object} config Configuration object.
     */
    var GConfigQS = {};
    GConfigQS.ID = 'GConfigQS';
    GConfigQS.VERSION = '0.3.0';

    GConfigQS.register = function(GConfig) {

        if(GConfig.PLUGINS[this.ID]) return true;

        /**
         * Register `loadQueryString` loader.
         */
        GConfig.CONF_LOADERS.push('loadQueryString');

        /**
         * Configuration object to query string.
         * @return {String}
         */
        GConfig.prototype.toQueryString = function() {
            return QueryString.stringify(this.data);
        };

        /**
         * Load query string into our main data object.
         * @return {void}
         */
        GConfig.prototype.loadQueryString = function(owner, search) {
            search = search || window.location.search;
            var qs = QueryString.parse(search);
            qs = this.filterAttributes(qs);
            this.merge(qs, true);
        };

        /**
         * Convenience method to filter query string.
         * @param  {Object} data Query string object.
         * @return {Object}      Filtered object.
         */
        GConfig.prototype.filterAttributes = function(data) {
            return data;
        };
    };

    /******************************************************
     * EXPOSE HELPER METHODS FOR UNIT TESTING.
    /******************************************************/
    GConfigQS.h = {};
    GConfigQS.h.isArray = _isArray;
    GConfigQS.h.isObject = _isObject;
    GConfigQS.h.each = _each;
    GConfigQS.h.extend = _extend;
    GConfigQS.h.RE_PLUS;
    GConfigQS.h.RE_PAIR;
    GConfigQS.h.encodedKeyValues;
    GConfigQS.h.decoders = decoders;
    GConfigQS.h.encoders = encoders;
    GConfigQS.h.encodeObject = encodeObject;
    GConfigQS.h.serializeObject = serializeObject;
    GConfigQS.h.unserializeObject = unserializeObject;
    GConfigQS.h.objectToQueryString = objectToQueryString;
    GConfigQS.h.decodeKeyValue = decodeKeyValue;
    GConfigQS.h.queryStringToObject = queryStringToObject;
    GConfigQS.h.QueryString = QueryString;

    return GConfigQS;
}));