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
    ].join();

    var meta = {
        name: 'GConfig Tester',
        baseurl: 'http://localhost:9030',
        'default-controller': 'Controller'
    };

    describe('GCPPath plugin...', function() {

        beforeEach(function() {
            GConfig.extend(GCPPath);
            $('head').append(html);
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
    });

    describe('GCPPath helper methods', function() {
        it('setPropertyChain', function() {
            var source = {},
                path = 'app.test.value',
                value = 'NewValue';
            GCPPath.h.setPropertyChain(source, path, value);
            expect(source.app.test.value).toMatch(value);
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