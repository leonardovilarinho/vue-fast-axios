# Vue fast axios

> Solution to remove and simplify axios in components vue

**Dependencies:**
- Only Vue.js 2.x

## Before install

Before installing, you must install and configure some packages to make use of the plugin.

First, install the `babel-polyfill` package to allow use async and await keywords:

```shell
npm install babel-polyfill --save
```

To allow, edit the `webpack.config.js`, replacing the line:

```json
entry: './src/main.js',
```

To:

```json
entry: ['babel-polyfill', './src/main.js'],
```

If your want use arrow function in your services, please install `transform-class-properties` plugin:

```shell
npm install babel-plugin-transform-class-properties --save-dev
```

In your `.babelrc` file, register this plugin:

```json
{
  ...
  "plugins": [
    "transform-class-properties"
  ]
}
```

## Installation

To install this plugin run:

```shell
npm install vue-fast-axios --save
```

and then, register he in Vue application, in `main.js` file:

```javascript
import VueFastAxios from 'vue-fast-axios'
Vue.use(VueFastAxios)
```

## Creating services

An service is compound with follow definitions:

- **`base:function | string`** : return root url for your API
- **`headers:function | object`** : return object with headers for api, use style of axios
- **`routes:function | object`** : return object with routes for api, each route has properties 'methods' and 'path' 
- **`methods:function | object`** : return object with alias for async request to route, each method has properties 'method' and 'route'
- **`defaultVMessage:function | string`** : return default message of error to validations
- **`validation:function | object`** : return object with properties to validate, each property has properties 'validator' and 'message'

    See an example:

```javascript
'use strict'

// Export service skeleton class
export default class PeoplesService {
    // define base url to requests
    base = () => 'https://xxx.firebaseio.com/'

    headers = () => ({
        'Content-Type': 'application/json' // but vue-fast-axios use application/json as default header
    })

    // define routes
    routes = () => ({
        root: { // route name
            methods: 'get,post', // methods accepted in route
            path: 'peoples.json' // path to route, url is: base + prepend + path + append
        },
        peoples: { // route name
            methods: 'put,delete' // methods accepted in route
            // default path route is route name (peoples)
        }
    })

    // methods to call in service instance
    methods = () => ({
        list: { // method name
            method: 'get', // method to htpp request
            route: 'root' // route to call with method
        },
        create: {
            method: 'post',
            route: 'root'
        }
    })

    defaultVMessage = () => 'Error to handle peoples'

    // validations
    validation = () => ({
        name: { // property to validate
            validator: (value) => value.length > 2, // validation
            message: 'Name is invalid' // message to error case
        },
        // simple validator, the error message is 'Error to handle peoples'
        key: (value) => key > 0
    })
}
```

## Using services

In your vue componentes, use method `$serviceFactory` to create an service with skeleton created before:

```vue
<template>
  ...
</template>

<script>
import PeoplesService from './services/PeoplesService' // your service

export default {
  name: 'app',
  data: () => ({
    service: null, // store my service handler
    ...
  }),
  // create my service with PeoplesService rules and pass this to call handle methods
  mounted() {
    this.service = this.$serviceFactory(new PeoplesService, this)
  },
  ...
  }
}
</script>
```

Now you have an `service` object, you can run `call` and `execute` methods, they has an simple difference:

- **`execute(routeName, parameters = {}) | bool`** : use this to simples and manual requests. To use, you must have the methods
`serviceSuccess` and `serviceError`, they as called when promise is resolved and receive an object with error or response. 
- **`call(methodName, parameters = {}) | object`**: use this for async/await requests. Is an way for execute request and capture response in one line! Erros as exceptions are throwed in console.

To use this methods, your component must have `validationError` method, they is called when an validation has failed, and receive an `message` as parameter.

See an metaphorical example:

```vue
<template>
  <div id="app">
    <button @click="createPeople">Create people</button>

    <button @click="updatePeople">Update pople</button>

    <ul>
      <li v-for="(people, key) in peoples" :key="key">
        <button @click="deletePeople(key)">Delete</button>
        {{ people.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import PeoplesService from './services/PeoplesService'

export default {
  name: 'app',
  data: () => ({
    service: null, // store my service handler
    peoples: [], // list of peoples
    newPeople: 'Leonardo', // store name from new people
    peopleToUpdate: {key: 1, name: 'New Leonardo'} // people to update
  }),
  // create my service with PeoplesService rules and pass this to call handle methods
  mounted() {
    this.service = this.$serviceFactory(new PeoplesService, this)
    this.load()
  },
  methods: {
    // call list method from PeopleService, with route root and method get
    async load() {
      this.peoples = await this.service.call('list')
    },

    // call create method from PeopleService, with route root and method post, pass object to register
    // this object is validate with 'name' rule from PeopleService
    async createPeople() {
      await this.service.call('create', { name: this.newPeople })
      this.load()
    },

    // append key.json to url, and set delete method. Execute this settings in peoples route
    deletePeople(key) {
      this.service.append(`/${key}.json`).del().execute('peoples')
    },

    // append key.json to url, and set post method. Execute this settings in peoples route with name data to validation
    updatePeople() {
      const {key, name} = this.peopleToUpdate
      this.service.append(`/${key}.json`).put().execute('peoples', {name})
    },

    // this method is called after response rigth from request make by execute method
    serviceSuccess(data) {
      this.load()
    },

    // this method is called after response wrong from request make by execute method
    serviceError(error) {
      alert(error)
    },

    // this method is called why has valitation error, message error is pass in param
    validationError(message) {
      alert(message)
    }
  }
}
</script>
```

> Note the use from helpers methods. See follow they...

## Helpers methods

We have some methods to help you!

To `execute` method, use this methods to define type of request:

- **`this.service.get().execute(...)`** : define GET http method
- **`this.service.pos().execute(...)`** : define POST http method
- **`this.service.put().execute(...)`** : define PUT http method
- **`this.service.del().execute(...)`** : define DELETE http method

To methods `execute` ou `call`, use this methods for change url of request:
- **`this.service.append('foo').execute(...)`** : add 'foo' in url request. Result: url + path + 'foo'
- **`this.service.append('bar').execute(...)`** : add 'bar' in url request. Result: url + bar + path


## Contributing

To contribute this plugin, fork, edit and send an PR for me. Before send PR, run `npm run build` to transpile source to ES5.