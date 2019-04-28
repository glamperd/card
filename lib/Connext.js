"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var __awaiter = undefined && undefined.__awaiter || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : new P(function (resolve) {
                resolve(result.value);
            }).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
var actions = require("./state/actions");
var redux_1 = require("redux");
var events_1 = require("events");
var Web3 = require("web3");
var ChannelManagerAbi_1 = require("./contract/ChannelManagerAbi");
var networking_1 = require("./helpers/networking");
var BuyController_1 = require("./controllers/BuyController");
var DepositController_1 = require("./controllers/DepositController");
var SyncController_1 = require("./controllers/SyncController");
var StateUpdateController_1 = require("./controllers/StateUpdateController");
var WithdrawalController_1 = require("./controllers/WithdrawalController");
var Utils_1 = require("./Utils");
var validator_1 = require("./validator");
var types_2 = require("./types");
var store_1 = require("./state/store");
var middleware_1 = require("./state/middleware");
var reducers_1 = require("./state/reducers");
var utils_1 = require("./lib/utils");
var bn_1 = require("./helpers/bn");
var ExchangeController_1 = require("./controllers/ExchangeController");
var CollateralController_1 = require("./controllers/CollateralController");
var ThreadsController_1 = require("./controllers/ThreadsController");
var RedeemController_1 = require("./controllers/RedeemController");

var HubAPIClient = function () {
    function HubAPIClient(user, networking, tokenName) {
        var _this = this;

        _classCallCheck(this, HubAPIClient);

        // post to hub telling user wants to deposit
        this.requestDeposit = function (deposit, txCount, lastThreadUpdateId) {
            return __awaiter(_this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var response;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                if (deposit.sigUser) {
                                    _context.next = 2;
                                    break;
                                }

                                throw new Error("No signature detected on the deposit request. Deposit: " + deposit + ", txCount: " + txCount + ", lastThreadUpdateId: " + lastThreadUpdateId);

                            case 2:
                                _context.next = 4;
                                return this.networking.post("channel/" + this.user + "/request-deposit", {
                                    depositWei: deposit.amountWei,
                                    depositToken: deposit.amountToken,
                                    sigUser: deposit.sigUser,
                                    lastChanTx: txCount,
                                    lastThreadUpdateId: lastThreadUpdateId,
                                    authToken: document.authToken
                                });

                            case 4:
                                response = _context.sent;
                                return _context.abrupt("return", response.data);

                            case 6:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));
        };
        // post to hub telling user wants to withdraw
        this.requestWithdrawal = function (withdrawal, txCountGlobal) {
            return __awaiter(_this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var response;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.networking.post("channel/" + this.user + "/request-withdrawal", Object.assign({}, withdrawal, { lastChanTx: txCountGlobal }));

                            case 2:
                                response = _context2.sent;
                                return _context2.abrupt("return", response.data);

                            case 4:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));
        };
        // performer calls this when they wish to start a show
        // return the proposed deposit fro the hub which should then be verified and cosigned
        this.requestCollateral = function (txCountGlobal) {
            return __awaiter(_this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                var response;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.networking.post("channel/" + this.user + "/request-collateralization", {
                                    lastChanTx: txCountGlobal,
                                    authToken: document.authToken
                                });

                            case 2:
                                response = _context3.sent;
                                return _context3.abrupt("return", response.data);

                            case 4:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));
        };
        // post to hub to batch verify state updates
        this.updateHub = function (updates, lastThreadUpdateId) {
            return __awaiter(_this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                var response;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.networking.post("channel/" + this.user + "/update", {
                                    lastThreadUpdateId: lastThreadUpdateId,
                                    updates: updates,
                                    authToken: document.authToken
                                });

                            case 2:
                                response = _context4.sent;
                                return _context4.abrupt("return", response.data);

                            case 4:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));
        };
        this.user = user;
        this.networking = networking;
    }

    _createClass(HubAPIClient, [{
        key: "config",
        value: function config() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                var res;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.networking.get("config");

                            case 2:
                                res = _context5.sent;
                                return _context5.abrupt("return", res.data);

                            case 4:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));
        }
    }, {
        key: "authChallenge",
        value: function authChallenge() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
                var res;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this.networking.post("auth/challenge", {});

                            case 2:
                                res = _context6.sent;
                                return _context6.abrupt("return", res.data.nonce);

                            case 4:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));
        }
    }, {
        key: "authResponse",
        value: function authResponse(nonce, address, origin, signature) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
                var res;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.networking.post("auth/response", {
                                    nonce: nonce,
                                    address: address,
                                    origin: origin,
                                    signature: signature
                                });

                            case 2:
                                res = _context7.sent;
                                return _context7.abrupt("return", res.data.token);

                            case 4:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));
        }
    }, {
        key: "getAuthStatus",
        value: function getAuthStatus() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
                var res;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this.networking.get("auth/status");

                            case 2:
                                res = _context8.sent;
                                return _context8.abrupt("return", res.data);

                            case 4:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));
        }
    }, {
        key: "getLatestStateNoPendingOps",
        value: function getLatestStateNoPendingOps() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
                var res;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.prev = 0;
                                _context9.next = 3;
                                return this.networking.post("channel/" + this.user + "/latest-no-pending", { authToken: document.authToken });

                            case 3:
                                res = _context9.sent;

                                if (res.data) {
                                    _context9.next = 6;
                                    break;
                                }

                                return _context9.abrupt("return", null);

                            case 6:
                                return _context9.abrupt("return", res.data);

                            case 9:
                                _context9.prev = 9;
                                _context9.t0 = _context9["catch"](0);

                                if (!(_context9.t0.status == 404)) {
                                    _context9.next = 14;
                                    break;
                                }

                                console.log("Channel not found for user " + this.user);
                                return _context9.abrupt("return", null);

                            case 14:
                                console.log('Error getting latest state no pending ops:', _context9.t0);
                                throw _context9.t0;

                            case 16:
                            case "end":
                                return _context9.stop();
                        }
                    }
                }, _callee9, this, [[0, 9]]);
            }));
        }
    }, {
        key: "getLastThreadUpdateId",
        value: function getLastThreadUpdateId() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
                var res;
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.prev = 0;
                                _context10.next = 3;
                                return this.networking.post("thread/" + this.user + "/last-update-id", { authToken: document.authToken });

                            case 3:
                                res = _context10.sent;

                                if (res.data) {
                                    _context10.next = 6;
                                    break;
                                }

                                return _context10.abrupt("return", 0);

                            case 6:
                                return _context10.abrupt("return", res.data.latestThreadUpdateId);

                            case 9:
                                _context10.prev = 9;
                                _context10.t0 = _context10["catch"](0);

                                if (!(_context10.t0.status == 404)) {
                                    _context10.next = 14;
                                    break;
                                }

                                console.log("Thread update not found for user " + this.user);
                                return _context10.abrupt("return", 0);

                            case 14:
                                console.log('Error getting latest state no pending ops:', _context10.t0);
                                throw _context10.t0;

                            case 16:
                            case "end":
                                return _context10.stop();
                        }
                    }
                }, _callee10, this, [[0, 9]]);
            }));
        }
    }, {
        key: "getLatestChannelStateAndUpdate",
        value: function getLatestChannelStateAndUpdate() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
                var res;
                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                _context11.prev = 0;

                                console.log('cookie', document.cookie);
                                _context11.next = 4;
                                return this.networking.post("channel/" + this.user + "/latest-update", { authToken: document.authToken });

                            case 4:
                                res = _context11.sent;

                                if (res.data) {
                                    _context11.next = 7;
                                    break;
                                }

                                return _context11.abrupt("return", null);

                            case 7:
                                return _context11.abrupt("return", { state: res.data.state, update: types_1.channelUpdateToUpdateRequest(res.data) });

                            case 10:
                                _context11.prev = 10;
                                _context11.t0 = _context11["catch"](0);

                                if (!(_context11.t0.status == 404)) {
                                    _context11.next = 15;
                                    break;
                                }

                                console.log("Channel not found for user " + this.user);
                                return _context11.abrupt("return", null);

                            case 15:
                                console.log('Error getting latest state:', _context11.t0);
                                throw _context11.t0;

                            case 17:
                            case "end":
                                return _context11.stop();
                        }
                    }
                }, _callee11, this, [[0, 10]]);
            }));
        }
    }, {
        key: "updateThread",
        value: function updateThread(update) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
                var res;
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                _context12.prev = 0;
                                _context12.next = 3;
                                return this.networking.post("thread/" + update.state.sender + "/to/" + update.state.receiver + "/update", {
                                    update: update,
                                    authToken: document.authToken
                                });

                            case 3:
                                res = _context12.sent;
                                return _context12.abrupt("return", res.data);

                            case 7:
                                _context12.prev = 7;
                                _context12.t0 = _context12["catch"](0);

                                if (!(_context12.t0.statusCode === 404)) {
                                    _context12.next = 11;
                                    break;
                                }

                                throw new Error("Thread not found for sender " + update.state.sender + " and receiver " + update.state.receiver);

                            case 11:
                                throw _context12.t0;

                            case 12:
                            case "end":
                                return _context12.stop();
                        }
                    }
                }, _callee12, this, [[0, 7]]);
            }));
        }
    }, {
        key: "getChannelByUser",
        value: function getChannelByUser(user) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee13() {
                var res;
                return regeneratorRuntime.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                _context13.prev = 0;
                                _context13.next = 3;
                                return this.networking.get("channel/" + user);

                            case 3:
                                res = _context13.sent;
                                return _context13.abrupt("return", res.data);

                            case 7:
                                _context13.prev = 7;
                                _context13.t0 = _context13["catch"](0);

                                if (!(_context13.t0.statusCode === 404)) {
                                    _context13.next = 11;
                                    break;
                                }

                                throw new Error("Channel not found for user " + user);

                            case 11:
                                throw _context13.t0;

                            case 12:
                            case "end":
                                return _context13.stop();
                        }
                    }
                }, _callee13, this, [[0, 7]]);
            }));
        }
    }, {
        key: "getChannel",
        value: function getChannel() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee14() {
                return regeneratorRuntime.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                _context14.next = 2;
                                return this.getChannelByUser(this.user);

                            case 2:
                                return _context14.abrupt("return", _context14.sent);

                            case 3:
                            case "end":
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));
        }
        // return state at specified global nonce

    }, {
        key: "getChannelStateAtNonce",
        value: function getChannelStateAtNonce(txCountGlobal) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
                var response;
                return regeneratorRuntime.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                _context15.prev = 0;
                                _context15.next = 3;
                                return this.networking.post("channel/" + this.user + "/update/" + txCountGlobal, { authToken: document.authToken });

                            case 3:
                                response = _context15.sent;
                                return _context15.abrupt("return", response.data);

                            case 7:
                                _context15.prev = 7;
                                _context15.t0 = _context15["catch"](0);
                                throw new Error("Cannot find update for user " + this.user + " at nonce " + txCountGlobal + ", " + _context15.t0.toString());

                            case 10:
                            case "end":
                                return _context15.stop();
                        }
                    }
                }, _callee15, this, [[0, 7]]);
            }));
        }
    }, {
        key: "getThreadInitialStates",
        value: function getThreadInitialStates() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
                var response;
                return regeneratorRuntime.wrap(function _callee16$(_context16) {
                    while (1) {
                        switch (_context16.prev = _context16.next) {
                            case 0:
                                _context16.next = 2;
                                return this.networking.get("thread/" + this.user + "/initial-states");

                            case 2:
                                response = _context16.sent;

                                if (response.data) {
                                    _context16.next = 5;
                                    break;
                                }

                                return _context16.abrupt("return", []);

                            case 5:
                                return _context16.abrupt("return", response.data);

                            case 6:
                            case "end":
                                return _context16.stop();
                        }
                    }
                }, _callee16, this);
            }));
        }
    }, {
        key: "getActiveThreads",
        value: function getActiveThreads() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee17() {
                var response;
                return regeneratorRuntime.wrap(function _callee17$(_context17) {
                    while (1) {
                        switch (_context17.prev = _context17.next) {
                            case 0:
                                _context17.next = 2;
                                return this.networking.post("thread/" + this.user + "/active", { authToken: document.authToken });

                            case 2:
                                response = _context17.sent;

                                if (response.data) {
                                    _context17.next = 5;
                                    break;
                                }

                                return _context17.abrupt("return", []);

                            case 5:
                                return _context17.abrupt("return", response.data);

                            case 6:
                            case "end":
                                return _context17.stop();
                        }
                    }
                }, _callee17, this);
            }));
        }
    }, {
        key: "getAllThreads",
        value: function getAllThreads() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee18() {
                var response;
                return regeneratorRuntime.wrap(function _callee18$(_context18) {
                    while (1) {
                        switch (_context18.prev = _context18.next) {
                            case 0:
                                _context18.next = 2;
                                return this.networking.post("thread/" + this.user + "/all", { authToken: document.authToken });

                            case 2:
                                response = _context18.sent;

                                if (response.data) {
                                    _context18.next = 5;
                                    break;
                                }

                                return _context18.abrupt("return", []);

                            case 5:
                                return _context18.abrupt("return", response.data);

                            case 6:
                            case "end":
                                return _context18.stop();
                        }
                    }
                }, _callee18, this);
            }));
        }
    }, {
        key: "getIncomingThreads",
        value: function getIncomingThreads() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee19() {
                var response;
                return regeneratorRuntime.wrap(function _callee19$(_context19) {
                    while (1) {
                        switch (_context19.prev = _context19.next) {
                            case 0:
                                _context19.next = 2;
                                return this.networking.post("thread/" + this.user + "/incoming", { authToken: document.authToken });

                            case 2:
                                response = _context19.sent;

                                if (response.data) {
                                    _context19.next = 5;
                                    break;
                                }

                                return _context19.abrupt("return", []);

                            case 5:
                                return _context19.abrupt("return", response.data);

                            case 6:
                            case "end":
                                return _context19.stop();
                        }
                    }
                }, _callee19, this);
            }));
        }
        // return all threads between 2 addresses

    }, {
        key: "getThreadByParties",
        value: function getThreadByParties(partyB, userIsSender) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee20() {
                var response;
                return regeneratorRuntime.wrap(function _callee20$(_context20) {
                    while (1) {
                        switch (_context20.prev = _context20.next) {
                            case 0:
                                _context20.next = 2;
                                return this.networking.get("thread/" + (userIsSender ? this.user : partyB) + "/to/" + (userIsSender ? partyB : this.user));

                            case 2:
                                response = _context20.sent;
                                return _context20.abrupt("return", response.data);

                            case 4:
                            case "end":
                                return _context20.stop();
                        }
                    }
                }, _callee20, this);
            }));
        }
        // hits the hubs sync endpoint to return all actionable states

    }, {
        key: "sync",
        value: function sync(txCountGlobal, lastThreadUpdateId) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee21() {
                var res;
                return regeneratorRuntime.wrap(function _callee21$(_context21) {
                    while (1) {
                        switch (_context21.prev = _context21.next) {
                            case 0:
                                _context21.prev = 0;
                                _context21.next = 3;
                                return this.networking.post("channel/" + this.user + "/sync?lastChanTx=" + txCountGlobal + "&lastThreadUpdateId=" + lastThreadUpdateId, { authToken: document.authToken });

                            case 3:
                                res = _context21.sent;
                                return _context21.abrupt("return", res.data);

                            case 7:
                                _context21.prev = 7;
                                _context21.t0 = _context21["catch"](0);

                                if (!(_context21.t0.status === 404)) {
                                    _context21.next = 11;
                                    break;
                                }

                                return _context21.abrupt("return", null);

                            case 11:
                                throw _context21.t0;

                            case 12:
                            case "end":
                                return _context21.stop();
                        }
                    }
                }, _callee21, this, [[0, 7]]);
            }));
        }
    }, {
        key: "getExchangerRates",
        value: function getExchangerRates() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee22() {
                var _ref, data;

                return regeneratorRuntime.wrap(function _callee22$(_context22) {
                    while (1) {
                        switch (_context22.prev = _context22.next) {
                            case 0:
                                _context22.next = 2;
                                return this.networking.get('exchangeRate');

                            case 2:
                                _ref = _context22.sent;
                                data = _ref.data;
                                return _context22.abrupt("return", data.rates);

                            case 5:
                            case "end":
                                return _context22.stop();
                        }
                    }
                }, _callee22, this);
            }));
        }
    }, {
        key: "buy",
        value: function buy(meta, payments) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee23() {
                var _ref2, data;

                return regeneratorRuntime.wrap(function _callee23$(_context23) {
                    while (1) {
                        switch (_context23.prev = _context23.next) {
                            case 0:
                                _context23.prev = 0;
                                _context23.next = 3;
                                return this.networking.post('payments/purchase', { meta: meta, payments: payments,
                                    authToken: document.authToken
                                });

                            case 3:
                                _ref2 = _context23.sent;
                                data = _ref2.data;
                                return _context23.abrupt("return", data);

                            case 8:
                                _context23.prev = 8;
                                _context23.t0 = _context23["catch"](0);
                                throw _context23.t0;

                            case 11:
                            case "end":
                                return _context23.stop();
                        }
                    }
                }, _callee23, this, [[0, 8]]);
            }));
        }
    }, {
        key: "redeem",
        value: function redeem(secret, txCount, lastThreadUpdateId) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee24() {
                var response;
                return regeneratorRuntime.wrap(function _callee24$(_context24) {
                    while (1) {
                        switch (_context24.prev = _context24.next) {
                            case 0:
                                _context24.prev = 0;
                                _context24.next = 3;
                                return this.networking.post("payments/redeem/" + this.user, {
                                    secret: secret,
                                    lastChanTx: txCount,
                                    lastThreadUpdateId: lastThreadUpdateId
                                });

                            case 3:
                                response = _context24.sent;
                                return _context24.abrupt("return", response.data);

                            case 7:
                                _context24.prev = 7;
                                _context24.t0 = _context24["catch"](0);

                                console.log(_context24.t0.message);

                                if (!(_context24.t0.message.indexOf("Payment has been redeemed.") != -1)) {
                                    _context24.next = 12;
                                    break;
                                }

                                throw new Error("Payment has been redeemed.");

                            case 12:
                                throw _context24.t0;

                            case 13:
                            case "end":
                                return _context24.stop();
                        }
                    }
                }, _callee24, this, [[0, 7]]);
            }));
        }
    }, {
        key: "requestExchange",
        value: function requestExchange(weiToSell, tokensToSell, txCountGlobal) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee25() {
                var _ref3, data;

                return regeneratorRuntime.wrap(function _callee25$(_context25) {
                    while (1) {
                        switch (_context25.prev = _context25.next) {
                            case 0:
                                _context25.next = 2;
                                return this.networking.post("channel/" + this.user + "/request-exchange", { weiToSell: weiToSell, tokensToSell: tokensToSell, lastChanTx: txCountGlobal,
                                    authToken: document.authToken });

                            case 2:
                                _ref3 = _context25.sent;
                                data = _ref3.data;
                                return _context25.abrupt("return", data);

                            case 5:
                            case "end":
                                return _context25.stop();
                        }
                    }
                }, _callee25, this);
            }));
        }
    }]);

    return HubAPIClient;
}();

var IWeb3TxWrapper = function IWeb3TxWrapper() {
    _classCallCheck(this, IWeb3TxWrapper);
};

exports.IWeb3TxWrapper = IWeb3TxWrapper;
/**
 * A wrapper around the Web3 PromiEvent
 * (https://web3js.readthedocs.io/en/1.0/callbacks-promises-events.html#promievent)
 * that makes the different `await` behaviors explicit.
 *
 * For example:
 *
 *   > const tx = channelManager.userAuthorizedUpdate(...)
 *   > await tx.awaitEnterMempool()
 */

var Web3TxWrapper = function (_IWeb3TxWrapper) {
    _inherits(Web3TxWrapper, _IWeb3TxWrapper);

    function Web3TxWrapper(address, name, tx) {
        _classCallCheck(this, Web3TxWrapper);

        var _this2 = _possibleConstructorReturn(this, (Web3TxWrapper.__proto__ || Object.getPrototypeOf(Web3TxWrapper)).call(this));

        _this2.onTxHash = new utils_1.ResolveablePromise();
        _this2.onFirstConfirmation = new utils_1.ResolveablePromise();
        _this2.address = address;
        _this2.name = name;
        _this2.tx = tx;
        tx.once('transactionHash', function (hash) {
            console.log("Sending " + _this2.name + " to " + _this2.address + ": in mempool: " + hash);
            _this2.onTxHash.resolve();
        });
        tx.once('confirmation', function (confirmation, receipt) {
            console.log("Sending " + _this2.name + " to " + _this2.address + ": confirmed:", receipt);
            _this2.onFirstConfirmation.resolve();
        });
        return _this2;
    }

    _createClass(Web3TxWrapper, [{
        key: "awaitEnterMempool",
        value: function awaitEnterMempool() {
            return this.onTxHash;
        }
    }, {
        key: "awaitFirstConfirmation",
        value: function awaitFirstConfirmation() {
            return this.onFirstConfirmation;
        }
    }]);

    return Web3TxWrapper;
}(IWeb3TxWrapper);

exports.Web3TxWrapper = Web3TxWrapper;

var ChannelManager = function () {
    function ChannelManager(web3, address, gasMultiple) {
        _classCallCheck(this, ChannelManager);

        this.address = address;
        this.cm = new web3.eth.Contract(ChannelManagerAbi_1.default.abi, address);
        this.gasMultiple = gasMultiple;
    }

    _createClass(ChannelManager, [{
        key: "getPastEvents",
        value: function getPastEvents(user, eventName, fromBlock) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee26() {
                var events;
                return regeneratorRuntime.wrap(function _callee26$(_context26) {
                    while (1) {
                        switch (_context26.prev = _context26.next) {
                            case 0:
                                _context26.next = 2;
                                return this.cm.getPastEvents(eventName, {
                                    filter: { user: user },
                                    fromBlock: fromBlock,
                                    toBlock: "latest"
                                });

                            case 2:
                                events = _context26.sent;
                                return _context26.abrupt("return", events);

                            case 4:
                            case "end":
                                return _context26.stop();
                        }
                    }
                }, _callee26, this);
            }));
        }
    }, {
        key: "userAuthorizedUpdate",
        value: function userAuthorizedUpdate(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee27() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee27$(_context27) {
                    while (1) {
                        switch (_context27.prev = _context27.next) {
                            case 0:
                                // deposit on the contract
                                call = this.cm.methods.userAuthorizedUpdate(state.recipient, // recipient
                                [state.balanceWeiHub, state.balanceWeiUser], [state.balanceTokenHub, state.balanceTokenUser], [state.pendingDepositWeiHub, state.pendingWithdrawalWeiHub, state.pendingDepositWeiUser, state.pendingWithdrawalWeiUser], [state.pendingDepositTokenHub, state.pendingWithdrawalTokenHub, state.pendingDepositTokenUser, state.pendingWithdrawalTokenUser], [state.txCountGlobal, state.txCountChain], state.threadRoot, state.threadCount, state.timeout, state.sigHub);
                                sendArgs = {
                                    from: state.user,
                                    value: state.pendingDepositWeiUser
                                };
                                _context27.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context27.sent;

                                sendArgs.gas = bn_1.toBN(Math.ceil(gasEstimate * this.gasMultiple));
                                return _context27.abrupt("return", new Web3TxWrapper(this.address, 'userAuthorizedUpdate', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context27.stop();
                        }
                    }
                }, _callee27, this);
            }));
        }
    }, {
        key: "startExit",
        value: function startExit(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee28() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee28$(_context28) {
                    while (1) {
                        switch (_context28.prev = _context28.next) {
                            case 0:
                                call = this.cm.methods.startExit(state.user);
                                sendArgs = {
                                    from: state.user,
                                    value: 0
                                };
                                _context28.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context28.sent;

                                sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
                                return _context28.abrupt("return", new Web3TxWrapper(this.address, 'startExit', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context28.stop();
                        }
                    }
                }, _callee28, this);
            }));
        }
    }, {
        key: "startExitWithUpdate",
        value: function startExitWithUpdate(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee29() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee29$(_context29) {
                    while (1) {
                        switch (_context29.prev = _context29.next) {
                            case 0:
                                call = this.cm.methods.startExitWithUpdate([state.user, state.recipient], [state.balanceWeiHub, state.balanceWeiUser], [state.balanceTokenHub, state.balanceTokenUser], [state.pendingDepositWeiHub, state.pendingWithdrawalWeiHub, state.pendingDepositWeiUser, state.pendingWithdrawalWeiUser], [state.pendingDepositTokenHub, state.pendingWithdrawalTokenHub, state.pendingDepositTokenUser, state.pendingWithdrawalTokenUser], [state.txCountGlobal, state.txCountChain], state.threadRoot, state.threadCount, state.timeout, state.sigHub, state.sigUser);
                                sendArgs = {
                                    from: state.user,
                                    value: 0
                                };
                                _context29.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context29.sent;

                                sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
                                return _context29.abrupt("return", new Web3TxWrapper(this.address, 'startExitWithUpdate', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context29.stop();
                        }
                    }
                }, _callee29, this);
            }));
        }
    }, {
        key: "emptyChannelWithChallenge",
        value: function emptyChannelWithChallenge(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee30() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee30$(_context30) {
                    while (1) {
                        switch (_context30.prev = _context30.next) {
                            case 0:
                                call = this.cm.methods.emptyChannelWithChallenge([state.user, state.recipient], [state.balanceWeiHub, state.balanceWeiUser], [state.balanceTokenHub, state.balanceTokenUser], [state.pendingDepositWeiHub, state.pendingWithdrawalWeiHub, state.pendingDepositWeiUser, state.pendingWithdrawalWeiUser], [state.pendingDepositTokenHub, state.pendingWithdrawalTokenHub, state.pendingDepositTokenUser, state.pendingWithdrawalTokenUser], [state.txCountGlobal, state.txCountChain], state.threadRoot, state.threadCount, state.timeout, state.sigHub, state.sigUser);
                                sendArgs = {
                                    from: state.user,
                                    value: 0
                                };
                                _context30.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context30.sent;

                                sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
                                return _context30.abrupt("return", new Web3TxWrapper(this.address, 'emptyChannelWithChallenge', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context30.stop();
                        }
                    }
                }, _callee30, this);
            }));
        }
    }, {
        key: "emptyChannel",
        value: function emptyChannel(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee31() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee31$(_context31) {
                    while (1) {
                        switch (_context31.prev = _context31.next) {
                            case 0:
                                call = this.cm.methods.emptyChannel(state.user);
                                sendArgs = {
                                    from: state.user,
                                    value: 0
                                };
                                _context31.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context31.sent;

                                sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
                                return _context31.abrupt("return", new Web3TxWrapper(this.address, 'emptyChannel', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context31.stop();
                        }
                    }
                }, _callee31, this);
            }));
        }
    }, {
        key: "startExitThread",
        value: function startExitThread(state, threadState, proof) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee32() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee32$(_context32) {
                    while (1) {
                        switch (_context32.prev = _context32.next) {
                            case 0:
                                call = this.cm.methods.startExitThread(state.user, threadState.sender, threadState.receiver, threadState.threadId, [threadState.balanceWeiSender, threadState.balanceWeiReceiver], [threadState.balanceTokenSender, threadState.balanceTokenReceiver], proof, threadState.sigA);
                                sendArgs = {
                                    from: state.user,
                                    value: 0
                                };
                                _context32.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context32.sent;

                                sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
                                return _context32.abrupt("return", new Web3TxWrapper(this.address, 'startExitThread', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context32.stop();
                        }
                    }
                }, _callee32, this);
            }));
        }
    }, {
        key: "startExitThreadWithUpdate",
        value: function startExitThreadWithUpdate(state, threadInitialState, threadUpdateState, proof) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee33() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee33$(_context33) {
                    while (1) {
                        switch (_context33.prev = _context33.next) {
                            case 0:
                                call = this.cm.methods.startExitThreadWithUpdate(state.user, [threadInitialState.sender, threadInitialState.receiver], threadInitialState.threadId, [threadInitialState.balanceWeiSender, threadInitialState.balanceWeiReceiver], [threadInitialState.balanceTokenSender, threadInitialState.balanceTokenReceiver], proof, threadInitialState.sigA, [threadUpdateState.balanceWeiSender, threadUpdateState.balanceWeiReceiver], [threadUpdateState.balanceTokenSender, threadUpdateState.balanceTokenReceiver], threadUpdateState.txCount, threadUpdateState.sigA);
                                sendArgs = {
                                    from: state.user,
                                    value: 0
                                };
                                _context33.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context33.sent;

                                sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
                                return _context33.abrupt("return", new Web3TxWrapper(this.address, 'startExitThreadWithUpdate', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context33.stop();
                        }
                    }
                }, _callee33, this);
            }));
        }
    }, {
        key: "challengeThread",
        value: function challengeThread(state, threadState) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee34() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee34$(_context34) {
                    while (1) {
                        switch (_context34.prev = _context34.next) {
                            case 0:
                                call = this.cm.methods.challengeThread(threadState.sender, threadState.receiver, threadState.threadId, [threadState.balanceWeiSender, threadState.balanceWeiReceiver], [threadState.balanceTokenSender, threadState.balanceTokenReceiver], threadState.txCount, threadState.sigA);
                                sendArgs = {
                                    from: state.user,
                                    value: 0
                                };
                                _context34.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context34.sent;

                                sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
                                return _context34.abrupt("return", new Web3TxWrapper(this.address, 'challengeThread', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context34.stop();
                        }
                    }
                }, _callee34, this);
            }));
        }
    }, {
        key: "emptyThread",
        value: function emptyThread(state, threadState, proof) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee35() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee35$(_context35) {
                    while (1) {
                        switch (_context35.prev = _context35.next) {
                            case 0:
                                call = this.cm.methods.emptyThread(state.user, threadState.sender, threadState.receiver, threadState.threadId, [threadState.balanceWeiSender, threadState.balanceWeiReceiver], [threadState.balanceTokenSender, threadState.balanceTokenReceiver], proof, threadState.sigA);
                                sendArgs = {
                                    from: state.user,
                                    value: 0
                                };
                                _context35.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context35.sent;

                                sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
                                return _context35.abrupt("return", new Web3TxWrapper(this.address, 'emptyThread', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context35.stop();
                        }
                    }
                }, _callee35, this);
            }));
        }
    }, {
        key: "nukeThreads",
        value: function nukeThreads(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee36() {
                var call, sendArgs, gasEstimate;
                return regeneratorRuntime.wrap(function _callee36$(_context36) {
                    while (1) {
                        switch (_context36.prev = _context36.next) {
                            case 0:
                                call = this.cm.methods.nukeThreads(state.user);
                                sendArgs = {
                                    from: state.user,
                                    value: 0
                                };
                                _context36.next = 4;
                                return call.estimateGas(sendArgs);

                            case 4:
                                gasEstimate = _context36.sent;

                                sendArgs.gas = bn_1.toBN(gasEstimate * this.gasMultiple);
                                return _context36.abrupt("return", new Web3TxWrapper(this.address, 'nukeThreads', call.send(sendArgs)));

                            case 7:
                            case "end":
                                return _context36.stop();
                        }
                    }
                }, _callee36, this);
            }));
        }
    }, {
        key: "getChannelDetails",
        value: function getChannelDetails(user) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee37() {
                var res;
                return regeneratorRuntime.wrap(function _callee37$(_context37) {
                    while (1) {
                        switch (_context37.prev = _context37.next) {
                            case 0:
                                _context37.next = 2;
                                return this.cm.methods.getChannelDetails(user).call({ from: user });

                            case 2:
                                res = _context37.sent;
                                return _context37.abrupt("return", {
                                    txCountGlobal: +res[0],
                                    txCountChain: +res[1],
                                    threadRoot: res[2],
                                    threadCount: +res[3],
                                    exitInitiator: res[4],
                                    channelClosingTime: +res[5],
                                    status: res[6]
                                });

                            case 4:
                            case "end":
                                return _context37.stop();
                        }
                    }
                }, _callee37, this);
            }));
        }
    }]);

    return ChannelManager;
}();

exports.ChannelManager = ChannelManager;
function hubConfigToClientOpts(config) {
    return {
        contractAddress: config.channelManagerAddress.toLowerCase(),
        hubAddress: config.hubWalletAddress.toLowerCase(),
        tokenAddress: config.tokenAddress.toLowerCase(),
        ethNetworkId: config.ethNetworkId.toLowerCase()
    };
}
/**
 * Used to get an instance of ConnextClient.
 */
function getConnextClient(opts) {
    return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee38() {
        var hub, hubOpts, merged, k;
        return regeneratorRuntime.wrap(function _callee38$(_context38) {
            while (1) {
                switch (_context38.prev = _context38.next) {
                    case 0:
                        // create a new hub and pass into the client
                        hub = opts.hub;

                        if (!hub) {
                            hub = new HubAPIClient(opts.user, new networking_1.Networking(opts.hubUrl));
                        }
                        _context38.t0 = hubConfigToClientOpts;
                        _context38.next = 5;
                        return hub.config();

                    case 5:
                        _context38.t1 = _context38.sent;
                        hubOpts = (0, _context38.t0)(_context38.t1);
                        merged = Object.assign({}, opts);
                        _context38.t2 = regeneratorRuntime.keys(hubOpts);

                    case 9:
                        if ((_context38.t3 = _context38.t2()).done) {
                            _context38.next = 16;
                            break;
                        }

                        k = _context38.t3.value;

                        if (!opts[k]) {
                            _context38.next = 13;
                            break;
                        }

                        return _context38.abrupt("continue", 9);

                    case 13:
                        merged[k] = hubOpts[k];
                        _context38.next = 9;
                        break;

                    case 16:
                        return _context38.abrupt("return", new ConnextInternal(Object.assign({}, merged)));

                    case 17:
                    case "end":
                        return _context38.stop();
                }
            }
        }, _callee38, this);
    }));
}
exports.getConnextClient = getConnextClient;
/**
 * The external interface to the Connext client, used by the Wallet.
 *
 * Create an instance with:
 *
 *  > const client = getConnextClient({...})
 *  > client.start() // start polling
 *  > client.on('onStateChange', state => {
 *  .   console.log('Connext state changed:', state)
 *  . })
 *
 */

var ConnextClient = function (_events_1$EventEmitte) {
    _inherits(ConnextClient, _events_1$EventEmitte);

    function ConnextClient(opts) {
        _classCallCheck(this, ConnextClient);

        var _this3 = _possibleConstructorReturn(this, (ConnextClient.__proto__ || Object.getPrototypeOf(ConnextClient)).call(this));

        _this3.opts = opts;
        _this3.internal = _this3;
        return _this3;
    }
    /**
     * Starts the stateful portions of the Connext client.
     *
     * Note: the full implementation lives in ConnextInternal.
     */


    _createClass(ConnextClient, [{
        key: "start",
        value: function start() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee39() {
                return regeneratorRuntime.wrap(function _callee39$(_context39) {
                    while (1) {
                        switch (_context39.prev = _context39.next) {
                            case 0:
                            case "end":
                                return _context39.stop();
                        }
                    }
                }, _callee39, this);
            }));
        }
        /**
         * Stops the stateful portions of the Connext client.
         *
         * Note: the full implementation lives in ConnextInternal.
         */

    }, {
        key: "stop",
        value: function stop() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee40() {
                return regeneratorRuntime.wrap(function _callee40$(_context40) {
                    while (1) {
                        switch (_context40.prev = _context40.next) {
                            case 0:
                            case "end":
                                return _context40.stop();
                        }
                    }
                }, _callee40, this);
            }));
        }
    }, {
        key: "deposit",
        value: function deposit(payment) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee41() {
                return regeneratorRuntime.wrap(function _callee41$(_context41) {
                    while (1) {
                        switch (_context41.prev = _context41.next) {
                            case 0:
                                _context41.next = 2;
                                return this.internal.depositController.requestUserDeposit(payment);

                            case 2:
                            case "end":
                                return _context41.stop();
                        }
                    }
                }, _callee41, this);
            }));
        }
    }, {
        key: "exchange",
        value: function exchange(toSell, currency) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee42() {
                return regeneratorRuntime.wrap(function _callee42$(_context42) {
                    while (1) {
                        switch (_context42.prev = _context42.next) {
                            case 0:
                                _context42.next = 2;
                                return this.internal.exchangeController.exchange(toSell, currency);

                            case 2:
                            case "end":
                                return _context42.stop();
                        }
                    }
                }, _callee42, this);
            }));
        }
    }, {
        key: "buy",
        value: function buy(purchase) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee43() {
                return regeneratorRuntime.wrap(function _callee43$(_context43) {
                    while (1) {
                        switch (_context43.prev = _context43.next) {
                            case 0:
                                _context43.next = 2;
                                return this.internal.buyController.buy(purchase);

                            case 2:
                                return _context43.abrupt("return", _context43.sent);

                            case 3:
                            case "end":
                                return _context43.stop();
                        }
                    }
                }, _callee43, this);
            }));
        }
    }, {
        key: "withdraw",
        value: function withdraw(withdrawal) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee44() {
                return regeneratorRuntime.wrap(function _callee44$(_context44) {
                    while (1) {
                        switch (_context44.prev = _context44.next) {
                            case 0:
                                _context44.next = 2;
                                return this.internal.withdrawalController.requestUserWithdrawal(withdrawal);

                            case 2:
                            case "end":
                                return _context44.stop();
                        }
                    }
                }, _callee44, this);
            }));
        }
    }, {
        key: "requestCollateral",
        value: function requestCollateral() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee45() {
                return regeneratorRuntime.wrap(function _callee45$(_context45) {
                    while (1) {
                        switch (_context45.prev = _context45.next) {
                            case 0:
                                _context45.next = 2;
                                return this.internal.collateralController.requestCollateral();

                            case 2:
                            case "end":
                                return _context45.stop();
                        }
                    }
                }, _callee45, this);
            }));
        }
    }, {
        key: "redeem",
        value: function redeem(secret) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee46() {
                return regeneratorRuntime.wrap(function _callee46$(_context46) {
                    while (1) {
                        switch (_context46.prev = _context46.next) {
                            case 0:
                                _context46.next = 2;
                                return this.internal.redeemController.redeem(secret);

                            case 2:
                                return _context46.abrupt("return", _context46.sent);

                            case 3:
                            case "end":
                                return _context46.stop();
                        }
                    }
                }, _callee46, this);
            }));
        }
    }]);

    return ConnextClient;
}(events_1.EventEmitter);

exports.ConnextClient = ConnextClient;
/**
 * The "actual" implementation of the Connext client. Internal components
 * should use this type, as it provides access to the various controllers, etc.
 */

var ConnextInternal = function (_ConnextClient) {
    _inherits(ConnextInternal, _ConnextClient);

    function ConnextInternal(opts) {
        _classCallCheck(this, ConnextInternal);

        var _this4 = _possibleConstructorReturn(this, (ConnextInternal.__proto__ || Object.getPrototypeOf(ConnextInternal)).call(this, opts));

        _this4.utils = new Utils_1.Utils();
        _this4._latestState = null;
        _this4._saving = Promise.resolve();
        _this4._savePending = false;
        // Internal things
        // The store shouldn't be used by anything before calling `start()`, so
        // leave it null until then.
        _this4.store = null;
        console.log('Using hub', opts.hub ? 'provided by caller' : "at " + _this4.opts.hubUrl);
        _this4.hub = opts.hub || new HubAPIClient(_this4.opts.user, new networking_1.Networking(_this4.opts.hubUrl), _this4.opts.tokenName);
        opts.user = opts.user.toLowerCase();
        opts.hubAddress = opts.hubAddress.toLowerCase();
        opts.contractAddress = opts.contractAddress.toLowerCase();
        _this4.validator = new validator_1.Validator(opts.web3, opts.hubAddress);
        _this4.contract = opts.contract || new ChannelManager(opts.web3, opts.contractAddress, opts.gasMultiple || 1.5);
        // Controllers
        _this4.exchangeController = new ExchangeController_1.ExchangeController('ExchangeController', _this4);
        _this4.syncController = new SyncController_1.default('SyncController', _this4);
        _this4.depositController = new DepositController_1.default('DepositController', _this4);
        _this4.buyController = new BuyController_1.default('BuyController', _this4);
        _this4.withdrawalController = new WithdrawalController_1.default('WithdrawalController', _this4);
        _this4.stateUpdateController = new StateUpdateController_1.default('StateUpdateController', _this4);
        _this4.collateralController = new CollateralController_1.default('CollateralController', _this4);
        _this4.threadsController = new ThreadsController_1.default('ThreadsController', _this4);
        _this4.redeemController = new RedeemController_1.RedeemController('RedeemController', _this4);
        return _this4;
    }

    _createClass(ConnextInternal, [{
        key: "getControllers",
        value: function getControllers() {
            var res = [];
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = Object.keys(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var key = _step.value;

                    var val = this[key];
                    var isController = val && utils_1.isFunction(val['start']) && utils_1.isFunction(val['stop']) && val !== this;
                    if (isController) res.push(val);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            return res;
        }
    }, {
        key: "withdrawal",
        value: function withdrawal(params) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee47() {
                return regeneratorRuntime.wrap(function _callee47$(_context47) {
                    while (1) {
                        switch (_context47.prev = _context47.next) {
                            case 0:
                                _context47.next = 2;
                                return this.withdrawalController.requestUserWithdrawal(params);

                            case 2:
                            case "end":
                                return _context47.stop();
                        }
                    }
                }, _callee47, this);
            }));
        }
    }, {
        key: "auth",
        value: function auth(origin) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee48() {
                var status, nonce, preamble, web3, hash, signature, auth, cookie;
                return regeneratorRuntime.wrap(function _callee48$(_context48) {
                    while (1) {
                        switch (_context48.prev = _context48.next) {
                            case 0:
                                _context48.next = 2;
                                return this.hub.getAuthStatus();

                            case 2:
                                status = _context48.sent;

                                if (!(status.success && status.address && status.address == this.opts.user)) {
                                    _context48.next = 6;
                                    break;
                                }

                                // TODO: what if i want to get this cookie?
                                console.log('address already authed');
                                return _context48.abrupt("return", null);

                            case 6:
                                _context48.next = 8;
                                return this.hub.authChallenge();

                            case 8:
                                nonce = _context48.sent;

                                // create hash and sign
                                preamble = "SpankWallet authentication message:";
                                web3 = this.opts.web3;
                                hash = web3.utils.sha3(preamble + " " + web3.utils.sha3(nonce) + " " + web3.utils.sha3(origin));
                                _context48.next = 14;
                                return web3.eth.personal.sign(hash, this.opts.user);

                            case 14:
                                signature = _context48.sent;
                                _context48.next = 17;
                                return this.hub.authResponse(nonce, this.opts.user, origin, signature);

                            case 17:
                                auth = _context48.sent;
                                cookie = "hub.sid=" + auth;

                                document.cookie = cookie;
                                document.authToken = auth;
                                return _context48.abrupt("return", null);

                            case 22:
                            case "end":
                                return _context48.stop();
                        }
                    }
                }, _callee48, this);
            }));
        }
    }, {
        key: "recipientNeedsCollateral",
        value: function recipientNeedsCollateral(recipient, amount) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee49() {
                var channel, chanBN, amtBN;
                return regeneratorRuntime.wrap(function _callee49$(_context49) {
                    while (1) {
                        switch (_context49.prev = _context49.next) {
                            case 0:
                                // get recipients channel
                                channel = void 0;
                                _context49.prev = 1;
                                _context49.next = 4;
                                return this.hub.getChannelByUser(recipient);

                            case 4:
                                channel = _context49.sent;
                                _context49.next = 12;
                                break;

                            case 7:
                                _context49.prev = 7;
                                _context49.t0 = _context49["catch"](1);

                                if (!(_context49.t0.status == 404)) {
                                    _context49.next = 11;
                                    break;
                                }

                                return _context49.abrupt("return", "Recipient channel does not exist. Recipient: " + recipient + ".");

                            case 11:
                                throw _context49.t0;

                            case 12:
                                // check if hub can afford payment
                                chanBN = types_1.convertChannelState("bn", channel.state);
                                amtBN = types_1.convertPayment("bn", amount);

                                if (!(chanBN.balanceWeiHub.lt(amtBN.amountWei) || chanBN.balanceTokenHub.lt(amtBN.amountToken))) {
                                    _context49.next = 16;
                                    break;
                                }

                                return _context49.abrupt("return", "Recipient needs collateral to facilitate payment.");

                            case 16:
                                return _context49.abrupt("return", null);

                            case 17:
                            case "end":
                                return _context49.stop();
                        }
                    }
                }, _callee49, this, [[1, 7]]);
            }));
        }
    }, {
        key: "syncConfig",
        value: function syncConfig() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee50() {
                var config, opts, adjusted;
                return regeneratorRuntime.wrap(function _callee50$(_context50) {
                    while (1) {
                        switch (_context50.prev = _context50.next) {
                            case 0:
                                _context50.next = 2;
                                return this.hub.config();

                            case 2:
                                config = _context50.sent;
                                opts = this.opts;
                                adjusted = Object.keys(opts).map(function (k) {
                                    if (k || Object.keys(opts).indexOf(k) == -1) {
                                        // user supplied, igonore
                                        return opts[k];
                                    }
                                    return config[k];
                                });
                                return _context50.abrupt("return", adjusted);

                            case 6:
                            case "end":
                                return _context50.stop();
                        }
                    }
                }, _callee50, this);
            }));
        }
    }, {
        key: "start",
        value: function start() {
            var _this5 = this;

            var _super = Object.create(null, {
                start: { get: function get() {
                        return _get(ConnextInternal.prototype.__proto__ || Object.getPrototypeOf(ConnextInternal.prototype), "start", _this5);
                    } }
            });
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee52() {
                var _this6 = this;

                var authRes, channelAndUpdate, latestValid, lastThreadUpdateId, threadHistoryDuplicates, threadHistory, initialStates, threadRows, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, controller;

                return regeneratorRuntime.wrap(function _callee52$(_context52) {
                    while (1) {
                        switch (_context52.prev = _context52.next) {
                            case 0:
                                _context52.next = 2;
                                return this.getStore();

                            case 2:
                                this.store = _context52.sent;

                                this.store.subscribe(function () {
                                    return __awaiter(_this6, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee51() {
                                        var state;
                                        return regeneratorRuntime.wrap(function _callee51$(_context51) {
                                            while (1) {
                                                switch (_context51.prev = _context51.next) {
                                                    case 0:
                                                        state = this.store.getState();

                                                        this.emit('onStateChange', state);
                                                        _context51.next = 4;
                                                        return this._saveState(state);

                                                    case 4:
                                                    case "end":
                                                        return _context51.stop();
                                                }
                                            }
                                        }, _callee51, this);
                                    }));
                                });
                                // before starting controllers, sync values
                                _context52.next = 6;
                                return this.syncConfig();

                            case 6:
                                _context52.next = 8;
                                return this.auth(this.opts.origin);

                            case 8:
                                authRes = _context52.sent;

                                if (!authRes) {
                                    _context52.next = 12;
                                    break;
                                }

                                console.warn('Error authing, cannot start');
                                return _context52.abrupt("return");

                            case 12:
                                _context52.next = 14;
                                return this.hub.getLatestChannelStateAndUpdate();

                            case 14:
                                channelAndUpdate = _context52.sent;

                                console.log('Found latest double signed state:', JSON.stringify(channelAndUpdate, null, 2));

                                if (!channelAndUpdate) {
                                    _context52.next = 48;
                                    break;
                                }

                                this.store.dispatch(actions.setChannelAndUpdate(channelAndUpdate));
                                // update the latest valid state
                                _context52.next = 20;
                                return this.hub.getLatestStateNoPendingOps();

                            case 20:
                                latestValid = _context52.sent;

                                console.log('latestValid:', latestValid);
                                if (latestValid) {
                                    this.store.dispatch(actions.setLatestValidState(latestValid));
                                }
                                // unconditionally update last thread update id, thread history
                                _context52.next = 25;
                                return this.hub.getLastThreadUpdateId();

                            case 25:
                                lastThreadUpdateId = _context52.sent;

                                console.log('lastThreadUpdateId:', lastThreadUpdateId);
                                this.store.dispatch(actions.setLastThreadUpdateId(lastThreadUpdateId));
                                // extract thread history, sort by descending threadId
                                _context52.next = 30;
                                return this.hub.getAllThreads();

                            case 30:
                                _context52.t0 = function (t) {
                                    return {
                                        sender: t.sender,
                                        receiver: t.receiver,
                                        threadId: t.threadId
                                    };
                                };

                                _context52.t1 = function (a, b) {
                                    return b.threadId - a.threadId;
                                };

                                threadHistoryDuplicates = _context52.sent.map(_context52.t0).sort(_context52.t1);

                                console.log('threadHistoryDuplicates', threadHistoryDuplicates);
                                // filter duplicates
                                threadHistory = threadHistoryDuplicates.filter(function (thread, i) {
                                    var search = JSON.stringify({
                                        sender: thread.sender,
                                        receiver: thread.receiver
                                    });
                                    var elts = threadHistoryDuplicates.map(function (t) {
                                        return JSON.stringify({ sender: t.sender, receiver: t.receiver });
                                    });
                                    return elts.indexOf(search) == i;
                                });

                                console.log('threadHistory:', threadHistory);
                                this.store.dispatch(actions.setThreadHistory(threadHistory));
                                // if thread count is greater than 0, update
                                // activeThreads, initial states

                                if (!(channelAndUpdate.state.threadCount > 0)) {
                                    _context52.next = 48;
                                    break;
                                }

                                _context52.next = 40;
                                return this.hub.getThreadInitialStates();

                            case 40:
                                initialStates = _context52.sent;

                                console.log('initialStates:', initialStates);
                                this.store.dispatch(actions.setActiveInitialThreadStates(initialStates));
                                _context52.next = 45;
                                return this.hub.getActiveThreads();

                            case 45:
                                threadRows = _context52.sent;

                                console.log('threadRows:', threadRows);
                                this.store.dispatch(actions.setActiveThreads(threadRows));

                            case 48:
                                // Start all controllers
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context52.prev = 51;
                                _iterator2 = this.getControllers()[Symbol.iterator]();

                            case 53:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context52.next = 62;
                                    break;
                                }

                                controller = _step2.value;

                                console.log('Starting:', controller.name);
                                _context52.next = 58;
                                return controller.start();

                            case 58:
                                console.log('Done!', controller.name, 'started.');

                            case 59:
                                _iteratorNormalCompletion2 = true;
                                _context52.next = 53;
                                break;

                            case 62:
                                _context52.next = 68;
                                break;

                            case 64:
                                _context52.prev = 64;
                                _context52.t2 = _context52["catch"](51);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context52.t2;

                            case 68:
                                _context52.prev = 68;
                                _context52.prev = 69;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 71:
                                _context52.prev = 71;

                                if (!_didIteratorError2) {
                                    _context52.next = 74;
                                    break;
                                }

                                throw _iteratorError2;

                            case 74:
                                return _context52.finish(71);

                            case 75:
                                return _context52.finish(68);

                            case 76:
                                _context52.next = 78;
                                return _super.start.call(this);

                            case 78:
                            case "end":
                                return _context52.stop();
                        }
                    }
                }, _callee52, this, [[51, 64, 68, 76], [69,, 71, 75]]);
            }));
        }
    }, {
        key: "stop",
        value: function stop() {
            var _this7 = this;

            var _super = Object.create(null, {
                stop: { get: function get() {
                        return _get(ConnextInternal.prototype.__proto__ || Object.getPrototypeOf(ConnextInternal.prototype), "stop", _this7);
                    } }
            });
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee53() {
                var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, controller;

                return regeneratorRuntime.wrap(function _callee53$(_context53) {
                    while (1) {
                        switch (_context53.prev = _context53.next) {
                            case 0:
                                // Stop all controllers
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context53.prev = 3;
                                _iterator3 = this.getControllers()[Symbol.iterator]();

                            case 5:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context53.next = 12;
                                    break;
                                }

                                controller = _step3.value;
                                _context53.next = 9;
                                return controller.stop();

                            case 9:
                                _iteratorNormalCompletion3 = true;
                                _context53.next = 5;
                                break;

                            case 12:
                                _context53.next = 18;
                                break;

                            case 14:
                                _context53.prev = 14;
                                _context53.t0 = _context53["catch"](3);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context53.t0;

                            case 18:
                                _context53.prev = 18;
                                _context53.prev = 19;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 21:
                                _context53.prev = 21;

                                if (!_didIteratorError3) {
                                    _context53.next = 24;
                                    break;
                                }

                                throw _iteratorError3;

                            case 24:
                                return _context53.finish(21);

                            case 25:
                                return _context53.finish(18);

                            case 26:
                                _context53.next = 28;
                                return _super.stop.call(this);

                            case 28:
                            case "end":
                                return _context53.stop();
                        }
                    }
                }, _callee53, this, [[3, 14, 18, 26], [19,, 21, 25]]);
            }));
        }
    }, {
        key: "dispatch",
        value: function dispatch(action) {
            this.store.dispatch(action);
        }
    }, {
        key: "generateSecret",
        value: function generateSecret() {
            return Web3.utils.soliditySha3({
                type: 'bytes32', value: Web3.utils.randomHex(32)
            });
        }
    }, {
        key: "sign",
        value: function sign(hash, user) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee54() {
                return regeneratorRuntime.wrap(function _callee54$(_context54) {
                    while (1) {
                        switch (_context54.prev = _context54.next) {
                            case 0:
                                _context54.next = 2;
                                return this.opts.web3.eth.personal ? this.opts.web3.eth.personal.sign(hash, user) : this.opts.web3.eth.sign(hash, user);

                            case 2:
                                return _context54.abrupt("return", _context54.sent);

                            case 3:
                            case "end":
                                return _context54.stop();
                        }
                    }
                }, _callee54, this);
            }));
        }
    }, {
        key: "signChannelState",
        value: function signChannelState(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee55() {
                var hash, _opts, user, hubAddress, sig;

                return regeneratorRuntime.wrap(function _callee55$(_context55) {
                    while (1) {
                        switch (_context55.prev = _context55.next) {
                            case 0:
                                if (!(state.user.toLowerCase() != this.opts.user.toLowerCase() || state.contractAddress.toLowerCase() != this.opts.contractAddress.toLowerCase())) {
                                    _context55.next = 2;
                                    break;
                                }

                                throw new Error("Refusing to sign channel state update which changes user or contract: " + ("expected user: " + this.opts.user + ", expected contract: " + this.opts.contractAddress + " ") + ("actual state: " + JSON.stringify(state)));

                            case 2:
                                hash = this.utils.createChannelStateHash(state);
                                _opts = this.opts, user = _opts.user, hubAddress = _opts.hubAddress;
                                _context55.next = 6;
                                return this.sign(hash, user);

                            case 6:
                                sig = _context55.sent;

                                console.log("Signing channel state " + state.txCountGlobal + ": " + sig, state);
                                return _context55.abrupt("return", types_2.addSigToChannelState(state, sig, true));

                            case 9:
                            case "end":
                                return _context55.stop();
                        }
                    }
                }, _callee55, this);
            }));
        }
    }, {
        key: "signThreadState",
        value: function signThreadState(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee56() {
                var userInThread, hash, sig;
                return regeneratorRuntime.wrap(function _callee56$(_context56) {
                    while (1) {
                        switch (_context56.prev = _context56.next) {
                            case 0:
                                userInThread = state.sender == this.opts.user || state.receiver == this.opts.user;

                                if (!(!userInThread || state.contractAddress != this.opts.contractAddress)) {
                                    _context56.next = 3;
                                    break;
                                }

                                throw new Error("Refusing to sign thread state update which changes user or contract: " + ("expected user: " + this.opts.user + ", expected contract: " + this.opts.contractAddress + " ") + ("actual state: " + JSON.stringify(state)));

                            case 3:
                                hash = this.utils.createThreadStateHash(state);
                                _context56.next = 6;
                                return this.sign(hash, this.opts.user);

                            case 6:
                                sig = _context56.sent;

                                console.log("Signing thread state " + state.txCount + ": " + sig, state);
                                return _context56.abrupt("return", types_1.addSigToThreadState(state, sig));

                            case 9:
                            case "end":
                                return _context56.stop();
                        }
                    }
                }, _callee56, this);
            }));
        }
    }, {
        key: "signDepositRequestProposal",
        value: function signDepositRequestProposal(args) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee57() {
                var hash, sig;
                return regeneratorRuntime.wrap(function _callee57$(_context57) {
                    while (1) {
                        switch (_context57.prev = _context57.next) {
                            case 0:
                                hash = this.utils.createDepositRequestProposalHash(args);
                                _context57.next = 3;
                                return this.sign(hash, this.opts.user);

                            case 3:
                                sig = _context57.sent;

                                console.log("Signing deposit request " + JSON.stringify(args, null, 2) + ". Sig: " + sig);
                                return _context57.abrupt("return", Object.assign({}, args, { sigUser: sig }));

                            case 6:
                            case "end":
                                return _context57.stop();
                        }
                    }
                }, _callee57, this);
            }));
        }
    }, {
        key: "getContractEvents",
        value: function getContractEvents(eventName, fromBlock) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee58() {
                return regeneratorRuntime.wrap(function _callee58$(_context58) {
                    while (1) {
                        switch (_context58.prev = _context58.next) {
                            case 0:
                                return _context58.abrupt("return", this.contract.getPastEvents(this.opts.user, eventName, fromBlock));

                            case 1:
                            case "end":
                                return _context58.stop();
                        }
                    }
                }, _callee58, this);
            }));
        }
    }, {
        key: "_saveState",
        value: function _saveState(state) {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee60() {
                var _this8 = this;

                return regeneratorRuntime.wrap(function _callee60$(_context60) {
                    while (1) {
                        switch (_context60.prev = _context60.next) {
                            case 0:
                                if (this.opts.saveState) {
                                    _context60.next = 2;
                                    break;
                                }

                                return _context60.abrupt("return");

                            case 2:
                                if (!(this._latestState === state.persistent)) {
                                    _context60.next = 4;
                                    break;
                                }

                                return _context60.abrupt("return");

                            case 4:
                                this._latestState = state.persistent;

                                if (!this._savePending) {
                                    _context60.next = 7;
                                    break;
                                }

                                return _context60.abrupt("return");

                            case 7:
                                this._savePending = true;
                                this._saving = new Promise(function (res, rej) {
                                    // Only save the state after all the currently pending operations have
                                    // completed to make sure that subsequent state updates will be atomic.
                                    setTimeout(function () {
                                        return __awaiter(_this8, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee59() {
                                            var err;
                                            return regeneratorRuntime.wrap(function _callee59$(_context59) {
                                                while (1) {
                                                    switch (_context59.prev = _context59.next) {
                                                        case 0:
                                                            err = null;
                                                            _context59.prev = 1;
                                                            _context59.next = 4;
                                                            return this._saveLoop();

                                                        case 4:
                                                            _context59.next = 9;
                                                            break;

                                                        case 6:
                                                            _context59.prev = 6;
                                                            _context59.t0 = _context59["catch"](1);

                                                            err = _context59.t0;

                                                        case 9:
                                                            // Be sure to set `_savePending` to `false` before resolve/reject
                                                            // in case the state changes during res()/rej()
                                                            this._savePending = false;
                                                            return _context59.abrupt("return", err ? rej(err) : res());

                                                        case 11:
                                                        case "end":
                                                            return _context59.stop();
                                                    }
                                                }
                                            }, _callee59, this, [[1, 6]]);
                                        }));
                                    }, 1);
                                });

                            case 9:
                            case "end":
                                return _context60.stop();
                        }
                    }
                }, _callee60, this);
            }));
        }
        /**
         * Because it's possible that the state will continue to be updated while
         * a previous state is saving, loop until the state doesn't change while
         * it's being saved before we return.
         */

    }, {
        key: "_saveLoop",
        value: function _saveLoop() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee61() {
                var result, state, _ref4, _ref5, timeout, _;

                return regeneratorRuntime.wrap(function _callee61$(_context61) {
                    while (1) {
                        switch (_context61.prev = _context61.next) {
                            case 0:
                                result = null;

                            case 1:
                                if (!true) {
                                    _context61.next = 15;
                                    break;
                                }

                                state = this._latestState;

                                result = this.opts.saveState(JSON.stringify(state));
                                // Wait for any current save to finish, but ignore any error it might raise
                                _context61.next = 6;
                                return utils_1.timeoutPromise(result.then(null, function () {
                                    return null;
                                }), 10 * 1000);

                            case 6:
                                _ref4 = _context61.sent;
                                _ref5 = _slicedToArray(_ref4, 2);
                                timeout = _ref5[0];
                                _ = _ref5[1];

                                if (timeout) {
                                    console.warn('Timeout (10 seconds) while waiting for state to save. ' + 'This error will be ignored (which may cause data loss). ' + 'User supplied function that has not returned:', this.opts.saveState);
                                }

                                if (!(this._latestState == state)) {
                                    _context61.next = 13;
                                    break;
                                }

                                return _context61.abrupt("break", 15);

                            case 13:
                                _context61.next = 1;
                                break;

                            case 15:
                            case "end":
                                return _context61.stop();
                        }
                    }
                }, _callee61, this);
            }));
        }
        /**
         * Waits for any persistent state to be saved.
         *
         * If the save fails, the promise will reject.
         */

    }, {
        key: "awaitPersistentStateSaved",
        value: function awaitPersistentStateSaved() {
            return this._saving;
        }
    }, {
        key: "getStore",
        value: function getStore() {
            return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee62() {
                var state, loadedState;
                return regeneratorRuntime.wrap(function _callee62$(_context62) {
                    while (1) {
                        switch (_context62.prev = _context62.next) {
                            case 0:
                                if (!this.opts.store) {
                                    _context62.next = 2;
                                    break;
                                }

                                return _context62.abrupt("return", this.opts.store);

                            case 2:
                                state = new store_1.ConnextState();

                                state.persistent.channel = Object.assign({}, state.persistent.channel, { contractAddress: this.opts.contractAddress || '', user: this.opts.user, recipient: this.opts.user });
                                state.persistent.latestValidState = state.persistent.channel;

                                if (!this.opts.loadState) {
                                    _context62.next = 10;
                                    break;
                                }

                                _context62.next = 8;
                                return this.opts.loadState();

                            case 8:
                                loadedState = _context62.sent;

                                if (loadedState) state.persistent = JSON.parse(loadedState);

                            case 10:
                                return _context62.abrupt("return", redux_1.createStore(reducers_1.reducers, state, redux_1.applyMiddleware(middleware_1.handleStateFlags)));

                            case 11:
                            case "end":
                                return _context62.stop();
                        }
                    }
                }, _callee62, this);
            }));
        }
    }, {
        key: "getLogger",
        value: function getLogger(name) {
            return {
                source: name,
                logToApi: function logToApi() {
                    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                        args[_key] = arguments[_key];
                    }

                    return __awaiter(this, void 0, void 0, /*#__PURE__*/regeneratorRuntime.mark(function _callee63() {
                        var _console;

                        return regeneratorRuntime.wrap(function _callee63$(_context63) {
                            while (1) {
                                switch (_context63.prev = _context63.next) {
                                    case 0:
                                        (_console = console).log.apply(_console, [name + ":"].concat(args));

                                    case 1:
                                    case "end":
                                        return _context63.stop();
                                }
                            }
                        }, _callee63, this);
                    }));
                }
            };
        }
    }]);

    return ConnextInternal;
}(ConnextClient);

exports.ConnextInternal = ConnextInternal;
//# sourceMappingURL=Connext.js.map