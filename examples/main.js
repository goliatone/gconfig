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
	config.init();
	console.log(config.getMeta('name'));
	console.log(config.getMeta('baseurl'));
	console.log(config.getMeta('default-controller'));

	var vo = {};
	config.configure(vo);
	console.log('Configured: %o', vo);
});