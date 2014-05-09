/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': 'jquery/jquery',
        'gconfig': 'gconfig',
        'gconfig.path': 'gconfig.path',
        'gconfig.qstring': 'gconfig.qstring'
    }
});

define(function(require) {
    var GConfig = require('gconfig'),
        $ = require('jquery');

    var QString = require('gconfig.qstring'),
        Path = require('gconfig.path');
    GConfig.extend(QString, Path);
    // GConfig.require('gconfig.path', 'gconfig.qstring');
    console.log('Loading', require('jquery'));

    /**
     * Example of a configuration loader.
     * The method get executed in an object that
     * has an `async` method, when called we get a
     * callback as return. That callback is the next
     * step in the queue.
     * idyllic
     * @param  {GConfig} gconfig GConfig instance
     * @return {void}
     */
    var jsonLoader = function(gconfig) {
        var done = this.async();
        $.ajax({
            url: "config.json"
        }).done(function(data) {
            window.cjson = data;
            gconfig.merge(data, true);
            done();
        }).fail(function() {
            done();
        });
    };

    var config = new GConfig({
        loaders: [jsonLoader]
    });

    /**
     * This is a rather silly implementation to showcase
     * the use method.
     * From the console, type:
     * `$('head').append('<meta name="pepe:rone" content="OYEAH">');`
     */
    config.use({
        'watch': function() {
            //To make this cross browser safe, for IE < 8 we should
            //check if appendChild is function. Else, poll
            var head = document.getElementsByTagName('head')[0];
            var __appendChild = head.appendChild;
            var self = this;
            head.appendChild = function() {
                self.loadMedatada();
                __appendChild.apply(head, arguments);
            };
        }
    });

    config.watch();

    var config2 = new GConfig();
    window.config2 = config2;
    config2.set('config2', 'just-addeed');

    config.logger.log(config.get('name'));
    config.logger.log(config.get('baseurl'));
    config.logger.log(config.get('default-controller'));

    var widget = {
        'template': 'widget-template'
    };
    var service = {
        'serviceUrl': 'http://api.example.com/v1/'
    };
    console.log('-----');
    config.logger.log('cf ', config.data);
    config.logger.log('serviceUrl ', config.get('serviceUrl', 'note-set'));
    config.merge(service, 'app');
    config.merge(widget, 'widget');
    config.logger.log('serviceUrl ', config.get('serviceUrl', 'note-set'));
    config.logger.log('widget template ', config.get('template', 'note-set', 'widget'));
    config.logger.log('cf ', config.data);
    console.log('-----');

    config.logger.log('cf2 ', config2.data);
    console.log('-----');

    var vo = {};
    config.configure(vo);
    config.logger.log('Configured: %o', vo);
    config.logger.log('Namespace: %o', config.configure({}, 'widget'));

    console.log('------------');
    config.set('app.path', 'some-path');
    config.logger.log(config.resolve('app.path'));

    /***********************************
|  DEBUG: Make config available    |
***********************************/
    window.config = config;
});