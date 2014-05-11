/*global define:true*/
/*global describe:true */
/*global it:true */
/*global expect:true */
/*global beforeEach:true */
/* jshint strict: false */


define(['gconfig', 'gconfig.path', 'jquery'], function(GConfig, GCPPath, $) {
    var html = [
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
        '<meta name="description" content="">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="app:name" content="GConfig Tester">',
        '<meta name="app:baseurl" content="http://localhost:9030">',
        '<meta name="app:default-controller" content="Controller">',
        '<meta name="widget:id" content="widgetId">'
    ].join('');

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

    describe('GCPPath plugin...', function() {

        beforeEach(function() {
            GConfig.extend(GCPPath);
            $('head').append(html);
        });

        afterEach(function(){
            $('meta').remove();
        });

        it('should have an ID class property', function() {
            expect(GCPPath.ID).toBeTruthy();
        });

        it('should have an VERSION class property', function() {
            expect(GCPPath.VERSION).toBeTruthy();
        });

        it('should be tracked by GConfig', function() {
            expect(GConfig.PLUGINS).toHaveProperties(GCPPath.ID);
            expect(GConfig.PLUGINS[GCPPath.ID]).toMatch(GCPPath.VERSION);
        });

        it('GConfig should load expected meta', function(){
            var config = new GConfig();
            expect(config.data).toMatchObject(meta);
        });

        it('should have one extra method added by path plugin', function() {
            var config = new GConfig();
            expect(config).toHaveMethods(['resolve']);
        });

        it('should resolve dot notation paths', function() {
            var config = new GConfig();
            expect(config.resolve('app.name')).toMatch(config.get('name'));
        });

        it('should set dot notation paths', function() {
            var config = new GConfig();
            config.set('app.test.value', 'NewValue');
            expect(config.data.app.test.value).toMatch('NewValue');
            expect(config.resolve('app.test.value')).toMatch('NewValue');
        });

        it('if key is not a path it should behave like before extension', function() {
            var config = new GConfig();
            config.set('value', 'NewValue');
            expect(config.data.app.value).toMatch('NewValue');
            expect(config.get('value')).toMatch('NewValue');
        });

        it('set method should handle undefined keys', function() {
            var config = new GConfig();
            expect(config.set(undefined)).toBeTruthy();
        });

        it('if we provide the namespace in the path and as an argument', function() {
            var config = new GConfig();
            config.set('app.test.value', 'NewValue', 'app');
            expect(config.resolve('app.test.value')).toMatch('NewValue');
        });

        it('should append right namespace', function() {
            var config = new GConfig();
            config.set('test.value', 'NewValue', 'app');
            expect(config.resolve('app.test.value')).toMatch('NewValue');
        });

        it('given an inexistent path return default value', function() {
            var config = new GConfig();
            expect(config.resolve('nothing', 'DefaultValue')).toMatch('DefaultValue');
        });
    });

    describe('GCPPath helper methods', function() {
        it('setPropertyChain', function() {
            var source = {},
                path = 'app.test.value',
                value = 'NewValue';
            GCPPath.h.setPropertyChain(source, path, value);
            expect(source.app.test.value).toMatch(value);
        });

        it('setPropertyChain can handle undefined targets', function() {
            var output = GCPPath.h.setPropertyChain();
            expect(output).toMatch(false);
        });

        it('resolvePropertyChain can handle undefined targets', function() {
            var output = GCPPath.h.resolvePropertyChain();
            expect(output).toMatch(false);
        });

        it('resolvePropertyChain', function() {
            var source = {
                app: {
                    test: {
                        value: 'NewValue'
                    }
                }
            };
            var path = 'app.test.value',
                expected = 'NewValue',
                result = GCPPath.h.resolvePropertyChain(source, path);
            expect(result).toMatch(expected);
        });
    });
});