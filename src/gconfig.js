/*global define:true*/
/* jshint strict: false */
define(['jquery'], function($) {

    var options = {
        //http://stackoverflow.com/questions/7602410/how-do-i-find-elements-that-contain-a-data-attribute-matching-a-prefix-using-j
        selector:'meta[name^="::NAMESPACE::-"]',
        namespace:'app'
    };

    var GConfig = function(config){
        $.extend(options, config || {});

        this.meta = {};
    };


    GConfig.prototype.init = function(namespace){
        // namespace = namespace || (namespace = options.namespace);
        namespace = namespace || options.namespace;
        var selector = options.selector.replace('::NAMESPACE::', namespace);
        var self = this;
        console.log('Selector is %s', selector);
        $(selector).each(function(index, el){
            self.addMeta(el.name.replace( namespace +'-',''), el.content, namespace);
            // self.config[ element.name.replace('app-','') ] = element.content;
        });
    };

    GConfig.prototype.configure = function(object, namespace){
        return $.extend(object, this.getNamespace(namespace));
    };

    GConfig.prototype.addMeta = function(key, value, namespace){
        namespace = namespace || options.namespace;
        if(!(namespace in this.meta)) this.meta[namespace] = {};
        this.meta[namespace][key] = value;
        return this;
    };

    GConfig.prototype.getMeta = function(key, defaultValue, namespace){
        namespace = namespace || options.namespace;
        if(!(namespace in this.meta) || !(key in this.meta[namespace]))
            return defaultValue;
        return this.meta[namespace][key];
    };

    GConfig.prototype.getNamespace = function(namespace){
        namespace = namespace || options.namespace;
        if(!(namespace in this.meta)) return {};
        return this.meta[namespace];
    };


    // exports['GConfig'] = GConfig;
    return GConfig;
});