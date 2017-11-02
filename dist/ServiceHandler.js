'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ServiceHandler = function () {
    function ServiceHandler(service) {
        var component = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        _classCallCheck(this, ServiceHandler);

        this.getService = function () {
            return service;
        };
        this.getComponent = function () {
            return component;
        };
        this.options = {
            append: '',
            prepend: ''
        };

        this.headers = this.getService().headers == undefined ? {} : this.getService().headers();

        if (this.getService().base == undefined) throw 'Declare base method to base URL api.';
    }

    _createClass(ServiceHandler, [{
        key: 'setHeader',
        value: function setHeader(name, value) {
            this.headers[name] = value;
            return this;
        }
    }, {
        key: 'append',
        value: function append(url) {
            this.options.append = url;
            return this;
        }
    }, {
        key: 'prepend',
        value: function prepend(url) {
            this.options.prepend = url;
            return this;
        }
    }, {
        key: 'get',
        value: function get() {
            this.method = 'get';
            return this;
        }
    }, {
        key: 'pos',
        value: function pos() {
            this.method = 'post';
            return this;
        }
    }, {
        key: 'put',
        value: function put() {
            this.method = 'put';
            return this;
        }
    }, {
        key: 'del',
        value: function del() {
            this.method = 'delete';
            return this;
        }
    }, {
        key: '_getRoute',
        value: function _getRoute() {
            if (this.getService().routes()[this.routeName] == undefined) throw 'Route ' + this.routeName + ' not found!';

            return this.getService().routes()[this.routeName];
        }
    }, {
        key: '_getMethod',
        value: function _getMethod(route) {
            var methodRoute = route.methods;

            if (route.methods.includes(',')) {
                if (!route.methods.includes(this.method)) throw 'Method not found in ' + this.routeName + '!';

                methodRoute = this.method;
            }
            return methodRoute;
        }
    }, {
        key: '_runValidation',
        value: function _runValidation(params) {
            if (this.getService().validation != undefined) {
                for (var name in params) {
                    var rule = this.getService().validation()[name];

                    if (rule == undefined) throw name + ' rule not found';

                    var message = rule.message || this.getService().defaultVMessage();

                    if (typeof rule == 'function') if (!rule(params[name])) return this.getComponent().validationError(message) || false;

                    if (typeof rule.validator == 'function') if (!rule.validator(params[name])) return this.getComponent().validationError(message) || false;
                }
            }
            return true;
        }
    }, {
        key: '_sendRequest',
        value: function _sendRequest(path, methodRoute, params) {
            var _this = this;

            var call = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;


            var request = (0, _axios2.default)({
                method: methodRoute,
                baseURL: this.getService().base(),
                timeout: 5000,
                responseType: 'json',
                url: this.options.prepend + path + this.options.append,
                data: JSON.stringify(params),
                headers: this.headers
            });

            this.options.append = '';
            this.options.prepend = '';

            return request.then(function (result) {
                if (call) return result.data;else _this._isSuccess(result);
            }).catch(function (error) {
                _this._isError(error);
            });
        }
    }, {
        key: '_isSuccess',
        value: function _isSuccess(result) {
            this.method = null;
            result.data = _typeof(result.data) != 'object' || result.data == null ? {} : result.data;
            if ('error' in result.data || result.status != 200) return this.getComponent().serviceError(result);

            this.getComponent().serviceSuccess(result.data);
        }
    }, {
        key: '_isError',
        value: function _isError(error) {
            throw error;
        }
    }, {
        key: 'call',
        value: function call(method) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var methodObj = this.getService().methods()[method];

            if (methodObj == undefined) throw method + ' method not found in your service';

            this.method = methodObj.method;
            this.isCall = true;
            var result = this.execute(methodObj.route, params);
            this.isCall = false;

            return result;
        }
    }, {
        key: 'execute',
        value: function execute(routeName) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            this._checkComponentServiceMethods();
            this.routeName = routeName.toLowerCase();

            var currentRoute = this._getRoute();
            var methodRoute = this._getMethod(currentRoute);
            var path = currentRoute.path != undefined ? currentRoute.path : this.routeName;
            path = path.toLowerCase() == 'root' ? '' : path.toLowerCase();

            if (this._runValidation(params)) return this._sendRequest(path, methodRoute, params, this.isCall);
            // throw 'Validation error'
        }
    }, {
        key: '_checkComponentServiceMethods',
        value: function _checkComponentServiceMethods() {
            var c = this.getComponent();
            var existMethods = c.serviceSuccess != undefined && c.serviceError != undefined;

            if (!existMethods && !this.isCall) throw 'Please, create serviceSuccess and serviceError methods in your ' + c.$options.name + ' component';

            if (c.validationError == undefined) throw 'Please, create validationError methods in your ' + c.$options.name + ' component';
        }
    }]);

    return ServiceHandler;
}();

exports.default = ServiceHandler;
