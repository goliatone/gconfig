/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': 'jquery/jquery',
        'gconfig': 'gconfig',
        'gconfig.path' :'gconfig.path'
    }
});

define(['gconfig', 'gconfig.path', 'jquery'], function (GConfig, GCPPath, $) {
    console.log('Loading');
	var config = new GConfig();

    config.use(GCPPath);

	config.use({'watch':function(){
		//To make this cross browser safe, for IE < 8 we should
		//check if appendChild is function. Else, poll
		var head = document.getElementsByTagName('head')[0];
        var __appendChild = head.appendChild;
        var self = this;
        head.appendChild = function(){
            self.generateMeta();
            __appendChild.apply(head, arguments);
        };
	}});

	config.watch();

	var config2 = new GConfig();
	config2.set('config2', 'just-addeed');

	config.log(config.get('name'));
	config.log(config.get('baseurl'));
	config.log(config.get('default-controller'));

	var widget  = {'template':'widget-template'};
	var service = {'serviceUrl':'http://api.example.com/v1/'};
	console.log('-----');
	config.log('cf ', config.data);
	config.log('serviceUrl ', config.get('serviceUrl', 'note-set'));
	config.merge(service);
	config.merge(widget, 'widget');
	config.log('serviceUrl ', config.get('serviceUrl', 'note-set'));
	config.log('widget template ', config.get('template', 'note-set', 'widget'));
	config.log('cf ', config.data);
	console.log('-----');
	config.log('cf2 ', config2.data);
	console.log('-----');

	var vo = {};
	config.configure(vo);
	config.log('Configured: %o', vo);
	config.log('Namespace: %o', config.configure({}, 'widget'));


    console.log('------------');
    config.set('app.path', 'some-path');
    config.log(config.resolve('app.path'));

	window.config = config;
});