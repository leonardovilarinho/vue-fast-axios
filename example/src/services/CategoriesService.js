'use strict'

export default class CategoriesService {
    base = () => 'http://localhost:8000/categoria/'
    
    headers = () => ({
        'Content-Type': 'application/json'
    })
    routes = () => ({
        root: {
            methods: 'get,post,put,delete'
        },
    })

    methods = () => ({
        list: {
            method: 'get',
            route: 'root'
        },
        remove: {
            method: 'delete',
            route: 'root'
        },
        create: {
            method: 'post',
            route: 'root'
        },
        update: {
            method: 'put',
            route: 'root'
        },
    })

    defaultVMessage = () => 'Error to handle categories'

    validation = () => ({
        token: {
            validator: (value) => typeof value == 'string',
            message: 'Token invalid'
        },
        id: (value) => value > 0,
        name: (value) => value.length >= 3,
    })
}