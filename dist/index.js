'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _ServiceHandler = require('./ServiceHandler');

var _ServiceHandler2 = _interopRequireDefault(_ServiceHandler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MyPlugin = {};

MyPlugin.install = function (Vue) {

    try {
        var axios = require('axios');
    } catch (e) {
        throw "Axios is not found";
    }

    Vue.prototype.$serviceFactory = function (service, component) {
        var instance = new _ServiceHandler2.default(service, component);
        return instance;
    };
};

exports.default = MyPlugin;
