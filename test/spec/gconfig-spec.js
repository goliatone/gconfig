/*global define:true*/
/*global describe:true */
/*global it:true */
/*global expect:true */
/* jshint strict: false */
define(['gconfig', 'jquery'], function(GConfig, $) {

    describe('just checking', function() {

        it('expect GConfig to be fucking there', function() {
            expect(GConfig).toBeTruthy();
            var config = new GConfig();
            expect(config).toBeTruthy();
        });
    });

});