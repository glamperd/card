"use strict";
exports.__esModule = true;
var chai_1 = require("chai");
var toFinney_1 = require("./toFinney");
var bn_js_1 = require("bn.js");
describe('toFinney', function () {
    it('should work', function () {
        chai_1.expect(toFinney_1["default"](20.99).eq(new bn_js_1["default"]('20990000000000000'))).eq(true);
    });
});
