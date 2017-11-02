'use strict'

// Export skeleton service class
export default class PeoplesService {
    // define base url to requests
    base = () => 'https://vuefastaxios.firebaseio.com/'

    // define routes
    routes = () => ({
        root: { //route name
            methods: 'get,post', // methods accepts in route
            path: 'peoples.json' // path to route, url is: base + prepend + path + append
        },
        peoples: { //route name
            methods: 'put,delete' // methods accepts in 
            // default path route is route name: peoples
        }
    })

    // methos to call in service instance
    methods = () => ({
        list: { // method name
            method: 'get', // method to request
            route: 'root' // route to call with method
        },
        create: {
            method: 'post',
            route: 'root'
        }
    })

    // validations
    validation = () => ({
        name: { // property to validate
            validator: (value) => value.length > 2, // validation
            message: 'Name is invalid' // message to error case
        }
    })
}