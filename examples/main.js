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
	config.use({'log':function(){
			var args = Array.prototype.slice.call(arguments);
			args.unshift('GConfig:: ');
			console.log.apply(console, args);
		}
	});
	var config2 = new GConfig();
	config2.set('config2', 'just-addeed');

	config.log(config.get('name'));
	config.log(config.get('baseurl'));
	config.log(config.get('default-controller'));

	var widget  = {'template':'widget-template'}; 
	var service = {'serviceUrl':'http://api.example.com/v1/'};
	console.log('-----');
	config.log('cf ', config.meta);
	config.log('serviceUrl ', config.get('serviceUrl', 'note-set'));
	config.merge(service);
	config.merge(widget, 'widget');
	config.log('serviceUrl ', config.get('serviceUrl', 'note-set'));
	config.log('widget template ', config.get('template', 'note-set', 'widget'));
	config.log('cf ', config.meta);
	console.log('-----');
	config.log('cf2 ', config2.meta);
	console.log('-----');

	var vo = {};
	config.configure(vo);
	config.log('Configured: %o', vo);
	config.log('Namespace: %o', config.configure({}, 'widget'));
});