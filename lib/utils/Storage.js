"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Storage = function () {
  function Storage() {
    _classCallCheck(this, Storage);

    this.map = new Map();
  }

  _createClass(Storage, [{
    key: "getItem",
    value: function getItem(key) {
      return this.map.get(key);
    }
  }, {
    key: "setItem",
    value: function setItem(key, value) {
      this.map.set(key, value);
    }
  }, {
    key: "removeItem",
    value: function removeItem(key, value) {
      this.map.delete(key);
    }
  }]);

  return Storage;
}();

exports.default = Storage;