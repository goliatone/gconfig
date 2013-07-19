/*global define:true*/
/* jshint strict: false */
define('gconfig', ['jquery'], function($) {

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
        $.extend(options, config || {});

        this.meta = {};
        this.namespaces = [];
        this.options = options;
        this.namespace = options.namespace;

        var addMetaCallback = $.proxy(this.addMeta, this);
        _generateMeta(addMetaCallback);
        console.log('META: ', this.meta);
    };

///////////////////////////////////////////////////
// PRIVATE METHODS
///////////////////////////////////////////////////

    /**
     * Parse metadata
     * @param  {[type]} attribute [description]
     * @return {[type]}           [description]
     */
    var _generateMeta = function( addMetaCallback )
    {
        var key = null, val = null, nsp = null;

        var meta = this.meta || (this.meta = document.getElementsByTagName('meta'));
        console.log('--------');
        console.log(meta);
        console.log('total, ', meta.length);

        // search desired tag
        for( var i = 0, l = meta.length; i < l; i++ )
        {
            key = meta[i].name || meta[i].getAttribute('property');
            // console.log('meta name: %s :: %s ', key, meta[i].content);

            //no key?
            if( !key ) continue;

            //we have a regular meta, skip
            if( key.indexOf(':') === -1 ) return;

            nsp = key.split(':')[0];
            key = key.split(':')[1];
            val = meta[i].content;

            //trigger callback
            addMetaCallback(key, val, nsp);
        }

    };

    GConfig.prototype.init = function(){
        //we dont really need init right now
        /*
        // namespace = namespace || (namespace = options.namespace);
        namespace = namespace || options.namespace;

        return;
        var selector = options.selector.replace('::NAMESPACE::', namespace);
        var self = this;
        // console.log('Selector is %s', selector);
        $(selector).each(function(index, el){
            self.addMeta(el.name.replace( namespace +'-',''), el.content, namespace);
            // self.config[ element.name.replace('app-','') ] = element.content;
        });*/
    };

    GConfig.prototype.configure = function(object, namespace){
        return $.extend(object, this.getNamespace(namespace));
    };

    GConfig.prototype.addMeta = function(key, value, namespace){
        console.log('Adding: %s::%s under %s.', key, value, namespace);

        namespace = namespace || this.namespace;
        if(!(namespace in this.meta)) this.meta[namespace] = {};
        this.meta[namespace][key] = value;
        return this;
    };

    GConfig.prototype.getMeta = function(key, defaultValue, namespace){
        namespace = namespace || this.namespace;
        if(!(namespace in this.meta) || !(key in this.meta[namespace]))
            return defaultValue;
        return this.meta[namespace][key];
    };

    GConfig.prototype.getNamespace = function(namespace){
        namespace = namespace || this.namespace;
        if(!(namespace in this.meta)) return {};
        return this.meta[namespace];
    };


    // exports['GConfig'] = GConfig;
    return GConfig;
});