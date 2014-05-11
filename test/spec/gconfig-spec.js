/*global define:true*/
/*global describe:true */
/*global it:true */
/*global expect:true */
/*global beforeEach:true */
/* jshint strict: false */
define('gconfig-spec', ['gconfig', 'jquery'], function(GConfig, $) {
    var html = [
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
        '<meta name="description" content="">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="app:name" content="GConfig Tester">',
        '<meta name="app:baseurl" content="http://localhost:9030">',
        '<meta name="app:default-controller" content="Controller">',
        '<meta name="widget:id" content="widgetId">'].join('');

    var meta = {
        app:{
            name: 'GConfig Tester',
            baseurl: 'http://localhost:9030',
            'default-controller': 'Controller'
        },
        widget:{
            id:'widgetId'
        }
    };

    describe('just checking', function() {

        beforeEach(function(){
            $('head').append(html);
        });

        afterEach(function(){
            $('meta').remove();
        });

        it('GConfig should be loaded', function() {
            expect(GConfig).toBeTruthy();
            var config = new GConfig();
            expect(config).toBeTruthy();
        });

        it('should initialize only once', function(){
            var config = new GConfig();
            expect(config.initialized).toBe(true);
            expect(config.init()).toBe(false);
        });

        it('GConfig should load expected meta', function(){
            var config = new GConfig();
            expect(config.data).toMatchObject(meta);
        });

        it('it should return the same content for different instances', function(){
            var config1 = new GConfig();
            var config2 = new GConfig();
            expect(config1.data).toMatchObject(config2.data);
        });

        it('generateMeta should parse DOM correctly', function(){

        });

        it('should have a default namespace',function(){
            var config = new GConfig();
            //TODO: We should not have to fuck with namespace this way, make configurable
            expect(config.options.namespace).toMatch('app');
        });

        it('should set a key value in default namespace',function(){
            var config = new GConfig();
            config.set('key', 'value');
            expect(config.data[config.options.namespace].key).toMatch('value');
        });

        /*it('changes to one instance should not modify others.', function(){
            var config1 = new GConfig();
            var config2 = new GConfig();
            config1.set('added','addedMeta');
            expect(config2.data).toMatchObject(config1.data);
        });*/

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

        it('should namespace correctly.', function() {
            var config = new GConfig();
            expect(config.get('id', null, 'widget')).toEqual('widgetId');
            expect(config.getMeta('id', null, 'widget')).toEqual('widgetId');
        });

        it('if no key matches for the given namespace should return default parameter', function() {
            var config = new GConfig();
            expect(config.get('nothing','defaultValue', 'widget')).toEqual('defaultValue');
            expect(config.getMeta('nothing','defaultValue', 'widget')).toEqual('defaultValue');
        });

        it('if the given namespace does not exists should return default parameter', function() {
            var config = new GConfig();
            expect(config.get('nothing','defaultValue', 'nothing')).toEqual('defaultValue');
            expect(config.getMeta('nothing','defaultValue', 'nothing')).toEqual('defaultValue');
        });

        it('should configure passed in objects.', function() {
            var config = new GConfig();
            var configured = config.configure({});
            var expected = meta[config.namespace];
            expect(configured).toMatch(expected);
        });

        it('should configure passed in objects.', function() {
            var config = new GConfig();
            var configured = config.configure({});
            var expected = meta[config.namespace];
            expect(configured).toMatch(expected);
        });

        it('should configure passed in objects by namespace.', function() {
            var config = new GConfig();
            var configured = config.configure({}, 'widget');
            expect(configured).toMatch({id:"widgetId"});
        });

        it('should merge object to config', function(){
            var config = new GConfig();
            var cplus  = {a:1,b:'c'};
            config.merge(cplus);
            for(var key in cplus) expect(config.get(key)).toEqual(cplus[key]);
        });

        it('should merge object to namespaced config', function(){
            var config = new GConfig();
            var cplus  = {a:1,b:'c'};
            var namespace = 'widget';
            config.merge(cplus, namespace);
            for(var key in cplus)
                expect(config.get(key, 'default', namespace)).toEqual(cplus[key]);
        });

        it('can be extended by plugins with the use method', function(){
            var expected = 'something';
            var plugin = {ext:function(){return expected;}};
            var config = new GConfig().use(plugin);
            expect(config).toHaveMethods('ext');
            expect(config.ext()).toEqual(expected);
        });

        it('api addMeta and set should be same method', function(){
            var config = new GConfig();
            expect(config.addMeta).toMatchObject(config.set);
        });

        it('api getMeta and get should be same method', function(){
            var config = new GConfig();
            expect(config.getMeta).toMatchObject(config.get);
        });
    });

    describe('methods', function(){
        it('should have a stub emit method', function(){
            expect(GConfig.prototype.emit).toEqual(function(){});
        });

        it('should have a logger method that defaults to console object', function(){
            expect(GConfig.prototype.logger).toEqual(console);
        });

        it('getNamespace by default should return config object', function(){
            var config = new GConfig();
            var expected = meta[config.namespace];
            expect(config.getNamespace()).toMatch(expected);
        });

        it('getNamespace by default should return default namespace object', function(){
            var config = new GConfig(),
                expected = config.data[conifg.namespace];
            expect(config.getNamespace()).toBe(expected);
        });

        it('getNamespace', function(){
            var config = new GConfig(),
                expected = config.data[conifg.namespace];
            expect(config.getNamespace(null, true )).toMatch(expected);

        });
    });

});