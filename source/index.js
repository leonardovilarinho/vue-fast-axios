'use strict'

import ServiceHandler from './ServiceHandler'

let MyPlugin = {}

MyPlugin.install = (Vue) => {

    try {
        const axios = require('axios')
    } catch (e) {
        throw "Axios is not found"
    }

    Vue.prototype.$serviceFactory = (service, component) => {
        const instance = new ServiceHandler(service, component)
        return instance
    }
}

export default MyPlugin