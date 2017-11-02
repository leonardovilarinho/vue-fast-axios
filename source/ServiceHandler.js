'use strict'

import axios from 'axios'

class ServiceHandler {
    constructor(service, component = null) {
        this.getService = () => service
        this.getComponent = () => component
        this.options = {
            append: '',
            prepend: '',
        }

        this.headers = this.getService().headers == undefined ? {} : this.getService().headers()

        if(this.getService().base == undefined)
            throw 'Declare base method to base URL api.'
        
    }

    setHeader(name, value) {
        this.headers[name] = value
        return this
    }

    append(url) {
        this.options.append = url
        return this
    }

    prepend(url) {
        this.options.prepend = url
        return this
    }

    get() {
        this.method = 'get'
        return this
    }

    pos() {
        this.method = 'post'
        return this
    }

    put() {
        this.method = 'put'
        return this
    }

    del() {
        this.method = 'delete'
        return this
    }

    _getRoute() {
        if (this.getService().routes()[this.routeName] == undefined)
            throw `Route ${this.routeName} not found!`

        return this.getService().routes()[this.routeName]
    }

    _getMethod(route) {
        let methodRoute = route.methods

        if (route.methods.includes(',')) {
            if (!route.methods.includes(this.method))
                throw `Method not found in ${this.routeName}!`
            
            methodRoute = this.method
        }
        return methodRoute
    }

    _runValidation(params) {
        if (this.getService().validation != undefined) {
            for (let name in params) {
                const rule = this.getService().validation()[name]

                if (rule == undefined)
                    throw `${name} rule not found`

                const message = rule.message || this.getService().defaultVMessage()

                

                if(typeof rule == 'function')
                    if(!rule(params[name]))
                        return this.getComponent().validationError(message) || false

                if(typeof rule.validator == 'function')
                    if (!rule.validator(params[name]))
                        return this.getComponent().validationError(message) || false
                
            }
        }
        return true
    }   

    _sendRequest(path, methodRoute, params, call = false) {

        
        const request = axios({
            method: methodRoute,
            baseURL: this.getService().base(),
            timeout: 5000,
            responseType: 'json',
            url: this.options.prepend + path + this.options.append,
            data: JSON.stringify(params),
            headers: this.headers,
        })
        
        this.options.append = ''
        this.options.prepend = ''

        return request.then(result => {
            if(call)
                return result.data
            else
                this._isSuccess(result)
        }).catch(error => {
            this._isError(error)
        })
    }

    _isSuccess(result) {
        this.method = null
        result.data = typeof result.data != 'object' || result.data == null ? {} : result.data
        if (('error' in result.data) || result.status != 200)
            return this.getComponent().serviceError(result)
    
        this.getComponent().serviceSuccess(result.data)
    }

    _isError(error) {
        throw error
    }

    call(method, params = {}) {
        const methodObj = this.getService().methods()[method]
        
        if(methodObj == undefined)
            throw `${method} method not found in your service`

        this.method = methodObj.method
        this.isCall = true
        const result = this.execute(methodObj.route, params)
        this.isCall = false

        return result
    }

    execute(routeName, params = {}) {
        this._checkComponentServiceMethods()
        this.routeName = routeName.toLowerCase()

        const currentRoute = this._getRoute()
        const methodRoute = this._getMethod(currentRoute)
        let path = currentRoute.path != undefined ? currentRoute.path : this.routeName
        path = path.toLowerCase() == 'root' ? '' : path.toLowerCase()


        if (this._runValidation(params))
            return this._sendRequest(path, methodRoute, params, this.isCall)
        // throw 'Validation error'
    }

    _checkComponentServiceMethods()
    {
        let c = this.getComponent()
        const existMethods = c.serviceSuccess != undefined && c.serviceError != undefined

        if (!existMethods && !this.isCall)
            throw `Please, create serviceSuccess and serviceError methods in your ${c.$options.name} component`

        if (c.validationError == undefined)
            throw `Please, create validationError methods in your ${c.$options.name} component`
    }
}

export default ServiceHandler