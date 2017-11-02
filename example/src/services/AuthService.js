'use strict'
export default class AuthService {
    base = () => 'http://localhost:8000/'

    headers = () => ({
        'Content-Type': 'application/json'
    })

    routes = () => ({
        autenticar: {
            methods: 'post'
        },
    })

    validation = () => ({
        email: {
            validator: (value) => value.includes('@'),
            message: 'Email invalid'
        },
        password: {
            validator: (value) => value.length >= 6,
            message: 'Password invalid'
        }
    })
}