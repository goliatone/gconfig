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

        // if(GConfig.PLUGINS[this.ID]) return true;

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
        GConfig.prototype.loadQueryString = function(search) {
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