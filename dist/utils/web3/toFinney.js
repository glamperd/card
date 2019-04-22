"use strict";
exports.__esModule = true;
var bignumber_js_1 = require("bignumber.js");
var bn_js_1 = require("bn.js");
bignumber_js_1.BigNumber.config({ DECIMAL_PLACES: 200 });
var FINNEY = new bignumber_js_1.BigNumber('1000000000000000'); // this will not work with decimal finney amounts with BN
function toFinney(n) {
    return new bn_js_1["default"](FINNEY.times(n).toFixed(0));
}
exports["default"] = toFinney;
