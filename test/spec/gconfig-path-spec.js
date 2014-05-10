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

    describe('just checking', function() {

        beforeEach(function() {
            GCPPath.register(GConfig);
            $('head').append(html);
        });

        it('GConfig should have one extra method added by path plugin', function() {
            var config = new GConfig();
            expect(config).toHaveMethods(['resolve']);
        });

        it('GConfig should resolve dot notation paths', function() {
            var config = new GConfig();
            expect(config.resolve('app.name')).toMatch(config.get('name'));
        });

        it('GConfig should set dot notation paths', function() {
            var config = new GConfig();
            config.set('app.test.value', 'NewValue');
            window.config = config;
            // expect(config.data.app.test.value).toMatch('NewValue');
            expect(config.resolve('app.test.value')).toMatch('NewValue');
        });
    });
});