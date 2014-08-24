/*global define:true*/
/*global describe:true */
/*global it:true */
/*global expect:true */
/*global beforeEach:true */
/* jshint strict: false */


define(['gconfig', 'gconfig.interpolate', 'jquery'], function(GConfig, GCInterpolate, $) {
    var html = [
        '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
        '<meta name="description" content="">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        '<meta name="app:name" content="GConfig Tester">',
        '<meta name="app:port" content="9090">',
        '<meta name="app:host" content="localhost">',
        '<meta name="widget:id" content="widgetId">',
        '<meta name="url:endpoint" content="http://@{app.host}:@{app.port}">'
    ].join('');

    var meta = {
        app:{
            name: 'GConfig Tester',
            'port': '9090',
            'host':'localhost'
        },
        widget:{
            id:'widgetId'
        },
        url:{
            endpoint:'http://@{app.host}:@{app.port}'
        }
    };

    GConfig.extend(GCInterpolate);

    describe('GCInterpolate plugin...', function() {

        beforeEach(function() {
            $('head').append(html);
        });

        afterEach(function(){
            $('meta').remove();
        });

        it('should have an ID class property', function() {
            expect(GCInterpolate.ID).toBeTruthy();
        });

        it('should have an VERSION class property', function() {
            expect(GCInterpolate.VERSION).toBeTruthy();
        });

        it('should be tracked by GConfig', function() {
            expect(GConfig.PLUGINS).toHaveProperties(GCInterpolate.ID);
            expect(GConfig.PLUGINS[GCInterpolate.ID]).toMatch(GCInterpolate.VERSION);
        });

        it('GConfig should load expected meta', function(){
            var config = new GConfig();
            expect(config.data).toMatchObject(meta);
        });
    });

    describe('helper methods', function() {
        var template = GCInterpolate.h.template;
        var needsInterpolation = GCInterpolate.h.needsInterpolation;
        var resolvePropertyChain = GCInterpolate.h.resolvePropertyChain;

        it('needsInterpolation', function(){
            expect(needsInterpolation('NOT_A_TEMPLATE')).toBeFalsy();
        });

        it('needsInterpolation', function(){
            expect(needsInterpolation('http://@{template}/@{here}')).toBeTruthy();
        });

        it('resolvePropertyChain', function(){
            var source = {
                test:{
                    path:{
                        target:'SomeValue'
                    }
                }
            };
            var path = 'test.path.target',
                expected = 'SomeValue';
            expect(resolvePropertyChain(source, path)).toMatchObject(expected);
        });

        it('resolvePropertyChain default value', function(){
            var expected = 'DefaultValue';
            expect(resolvePropertyChain({}, '', expected)).toEqual(expected);
        });

        it('resolvePropertyChain default value', function(){
            var expected = 'DefaultValue';
            expect(resolvePropertyChain({}, null, expected)).toEqual(expected);
        });

        it('resolvePropertyChain default value', function(){
            var expected = 'DefaultValue';
            expect(resolvePropertyChain(null, 'path', expected)).toEqual(expected);
        });

        it('template', function(){
            var t = 'http://@{ip}:@{port}',
                source = {ip:'localhost', port:'9090'},
                expected = 'http://localhost:9090';

            expect(template(t, source)).toEqual(expected);
        });

        it('template', function(){
            var t = null,
                source = {ip:'localhost', port:'9090'},
                expected = '';
            expect(template(t, source)).toEqual(expected);
        });

        it('template', function(){
            var t = 'http://@{ip}:@{port}',
                source = null,
                expected = t;
            expect(template(t, source)).toEqual(expected);
        });

        it('template', function(){
            var t = 'http://@{ip}:@{port}',
                source = {a:{b:3}},
                expected = t;
            expect(template(t, source)).toEqual(expected);
        });
    });

    describe('interpolation', function(){
        beforeEach(function() {
            $('head').append(html);
        });

        afterEach(function(){
            $('meta').remove();
        });

        it('override get to solve templates', function(){
            var config = new GConfig();
            var expected = 'http://localhost:9090';
            expect(config.get('endpoint', null, 'url')).toEqual(expected);
        });

        it('should add an interpolate method', function(){
            var config = new GConfig();
            expect(config).toHaveMethods(['interpolate']);
        });

        it('should add a solveDependencies method', function(){
            var config = new GConfig();
            expect(config).toHaveMethods(['solveDependencies']);
        });

        it('interpolate should solve template strings', function(){
            var config = new GConfig();
            var data = {
                url:{
                    base:'localhost',
                    port:'9000'
                },
                app:{
                    clientId:'123456'
                }
            };
            var expected = 'http://localhost:9000/123456';
            var template = 'http://@{url.base}:@{url.port}/@{app.clientId}';
            var result = config.interpolate(template, data);
            expect(result).toEqual(expected);
            console.warn('PEPERONE', result);
        })
    });
});