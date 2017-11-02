<template>
  <div id="app">
    <!-- Status Bar -->
    <strong v-if="loading">Loading...</strong>
    <strong v-else>{{ message }}</strong>

    <!-- New people form -->
    <section v-if="peopleToUpdate == null && !loading">
      <input v-model="newPeople" placeholder="Add new people..." />
      <button @click="createPeople">Create</button>
    </section>

    <!-- Update people form -->
    <section v-else-if="peopleToUpdate != null && !loading">
      <input v-model="peopleToUpdate.name" placeholder="Update this people..." />
      <button @click="updatePeople">Update</button>
    </section>

    <!-- List all peoples -->
    <ul>
      <li v-for="(people, key) in peoples" :key="key">
        <button @click="deletePeople(key)">Delete</button>
        <button @click="peopleToUpdate = { key, name: people.name }">Update</button>
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
    message: '', // message of status
    peoples: [], // list of peoples
    loading: false, // status loading
    newPeople: '', // store name from new people
    peopleToUpdate: null // people to update
  }),
  // create my service with PeoplesService rules and pass this to call handle methods
  mounted() {
    this.service = this.$serviceFactory(new PeoplesService, this)
    this.load()
  },
  methods: {
    // call list method from PeopleService, with route root and method get
    async load() {
      this.loading = true
      this.peoples = await this.service.call('list')
      this.loading = false
    },
    // call create method from PeopleService, with route root and method post, pass object to register
    // this object is validate with 'name' rule from PeopleService
    async createPeople() {
      this.loading = true
      await this.service.call('create', { name: this.newPeople })
      this.loading = false
      this.message = 'People saved!'
      this.load()
    },
    // appens key.json to url, and set delete method. Execute this settings in peoples route
    deletePeople(key) {
      this.loading = true
      this.service.append(`/${key}.json`).del().execute('peoples')
    },
    // appens key.json to url, and set post method. Execute this settings in peoples route with name data to validation
    updatePeople() {
      const {key, name} = this.peopleToUpdate
      this.loading = true
      this.service.append(`/${key}.json`).put().execute('peoples', {name})
    },
    // this method is called after response rigth from request make by execute method
    serviceSuccess(data) {
      this.message = 'Peoples updated!'
      this.loading = false
      this.load()
      this.peopleToUpdate = null
    },
    // this method is called after response wrong from request make by execute method
    serviceError(error) {
      this.msg = 'Error'
      this.loading = false
    },
    // this method is called why has valitation error, message error is pass in param
    validationError(message) {
      this.message = message
      this.loading = false
    }
  }
}
</script>
