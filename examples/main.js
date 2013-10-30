/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': '../lib/jquery/jquery',
        'gconfig': '../src/gconfig'
    }
});

define(['gconfig', 'jquery'], function (GConfig, $) {
    console.log('Loading');
	var config = new GConfig();
	var config2 = new GConfig();
	config2.set('config2', 'just-addeed');

	console.log(config.get('name'));
	console.log(config.get('baseurl'));
	console.log(config.get('default-controller'));

	var widget  = {'template':'widget-template'}; 
	var service = {'serviceUrl':'http://api.example.com/v1/'};
	console.log('-----');
	console.log('cf ', config.meta);
	console.log('serviceUrl ', config.get('serviceUrl', 'note-set'));
	config.merge(service);
	config.merge(widget, 'widget');
	console.log('serviceUrl ', config.get('serviceUrl', 'note-set'));
	console.log('widget template ', config.get('template', 'note-set', 'widget'));
	console.log('cf ', config.meta);
	console.log('-----');
	console.log('cf2 ', config2.meta);
	console.log('-----');

	var vo = {};
	config.configure(vo);
	console.log('Configured: %o', vo);
	console.log('Namespace: %o', config.configure({}, 'widget'));
});