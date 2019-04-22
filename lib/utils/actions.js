"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var setWallet = exports.setWallet = function setWallet(state, action) {
  switch (action.type) {
    case "SET_WALLET":
      return [action.text];
    default:
      return state;
  }
};