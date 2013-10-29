/*global define:true*/
/*global describe:true */
/*global it:true */
/*global expect:true */
/*global beforeEach:true */
/* jshint strict: false */
define(['gconfig', 'jquery'], function(GConfig, $) {
    var html = ['<meta name="app:name" content="GConfig Tester">',
        '<meta name="app:baseurl" content="http://localhost:9030">',
        '<meta name="app:default-controller" content="Controller">',
        '<meta name="widget:id" content="widgetId">'].join();

    var meta = {
        name:'GConfig Tester',
        baseurl:'http://localhost:9030',
        'default-controller':'Controller'
    };

    describe('just checking', function() {

        beforeEach(function(){
            $('head').append(html);
        });

        it('GConfig shold be loaded', function() {
            expect(GConfig).toBeTruthy();
            var config = new GConfig();
            expect(config).toBeTruthy();
        });

        it('should get all meta keys', function(){
            var config = new GConfig();
            Object.keys(meta).map(function(key){
                expect(meta[key]).toEqual(config.get(key));
                expect(meta[key]).toEqual(config.getMeta(key));
            });
        });

        it('if no key matches should return default parameter', function(){
            var config = new GConfig();
            expect(config.get('nothing','defaultValue')).toEqual('defaultValue');
            expect(config.getMeta('nothing','defaultValue')).toEqual('defaultValue');
        });

        it('addMeta should update config', function(){
            var config = new GConfig();
            config.addMeta('added','addedMeta');
            expect(config.get('added')).toEqual('addedMeta');
            expect(config.getMeta('added')).toEqual('addedMeta');
        });

        it('getNamespace by defualt should return config object', function(){
            var config = new GConfig();
            expect(config.getNamespace()).toMatch(meta);
        });

        it('should namespace correctly.', function() {
            var config = new GConfig();
            expect(config.get('id',null, 'widget')).toEqual('widgetId');
            expect(config.getMeta('id',null, 'widget')).toEqual('widgetId');
        });

        it('if no key matches for the given namespace should return default parameter', function() {
            var config = new GConfig();
            expect(config.get('nothing','defaultValue', 'widget')).toEqual('defaultValue');
            expect(config.getMeta('nothing','defaultValue', 'widget')).toEqual('defaultValue');
        });

        it('if the given namespace does not exists should return default parameter', function() {
            var config = new GConfig();
            expect(config.getMeta('nothing','defaultValue', 'nothing')).toEqual('defaultValue');
        });

        it('should configure passed in objects.', function() {
            var config = new GConfig();
            var configured = config.configure({});
            expect(configured).toMatch(meta);
        });

    });

});