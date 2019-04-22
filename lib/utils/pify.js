"use strict";

exports.__esModule = true;
function pify(fn) {
    return new Promise(function (resolve, reject) {
        var handler = function handler(err, res) {
            if (err) {
                return reject(err);
            }
            return resolve(res);
        };
        fn(handler);
    });
}
exports["default"] = pify;