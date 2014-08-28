/*global define:true*/
/*global describe:true */
/*global it:true */
/*global expect:true */
/*global beforeEach:true */
/* jshint strict: false */


define(['gconfig', 'gconfig.typed', 'jquery'], function(GConfig, GCTyped, $) {
    var html = [
        '<meta name="app:asBoolTrue" content="true">',
        '<meta name="app:asBoolTrueUppercase" content="TRUE">',
        '<meta name="app:asBoolFalse" content="false">',
        '<meta name="app:asInt" content="9090">',
        '<meta name="app:asNumber" content="3.14159">',
        '<meta name="app:asArray" content="[1,2,\"tres\",true]">',
        '<meta name="app:asObject" content=\'{"a":1,"b":2,"c":3}\'>'
    ].join('');

    var meta = {
        app:{
            asBoolTrue:true,
            asBoolTrueUppercase:true,
            asBoolFalse:false,
            asInt:9090,
            asNumber:3.1415,
            asArray:[1,2,"tres", true],
            asObject:{
                a:1,
                b:2,
                c:3
            }
        }
    };

    GConfig.extend(GCTyped);

    describe('GCTyped plugin...', function() {

        beforeEach(function() {
            $('head').append(html);
        });

        afterEach(function(){
            $('meta').remove();
        });

        it('should have an ID class property', function() {
            expect(GCTyped.ID).toBeTruthy();
        });

        it('should have an VERSION class property', function() {
            expect(GCTyped.VERSION).toBeTruthy();
        });

        it('should be tracked by GConfig', function() {
            expect(GConfig.PLUGINS).toHaveProperties(GCTyped.ID);
            expect(GConfig.PLUGINS[GCTyped.ID]).toMatch(GCTyped.VERSION);
        });

        it('GConfig should load expected meta', function(){
            var config = new GConfig();
            expect(config.data).toMatchObject(meta);
        });
    });

    describe('GCTyped conversion methods', function() {
        var config;

        beforeEach(function() {
            $('head').append(html);
            config = new GConfig();
        });

        afterEach(function(){
            $('meta').remove();
        });

        it('asBool, return boolean from string', function(){
            expect(config.asBool('asBoolTrue')).toEqual(true);
        });

        it('asBool, return boolean from string', function(){
            expect(config.asBool('asBoolTrueUppercase')).toEqual(true);
        });

        it('asBool, return boolean from string', function(){
            expect(config.asBool('asInt')).toEqual(false);
        });

        it('asBool, defaults to false', function(){
            expect(config.asBool('asBoolDefault')).toEqual(false);
        });

        it('asBool, defaults to false', function(){
            expect(config.asBool('asBoolDefault', true, 'nonthing')).toEqual(true);
        });

        it('asBool, defaults to false', function(){
            expect(config.asBool('asBoolDefault', false, 'nonthing')).toEqual(false);
        });

        it('asInt, return integer from string', function(){
            expect(config.asBool('asInt')).toEqual(meta.app.asInt);
        });

        it('asNumber, return integer from string', function(){
            expect(config.asBool('asNumber')).toEqual(meta.app.asNumber);
        });

        it('asArray, return integer from string', function(){
            expect(config.asBool('asArray')).toMatchObject(meta.app.asArray);
        });

        it('asObject, return integer from string', function(){
            expect(config.asBool('asObject')).toMatchObject(meta.app.asObject);
        });
    });
});