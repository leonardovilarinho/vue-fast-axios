<template>
  <section>
    <h2 v-if="loading">Loading...</h2>
    <div v-else-if="!loading && update == null">
      <input v-model="category">
      <button @click="createCategory">Create</button>
    </div>
    <div v-else>
      <input v-model="update.name">
      <button @click="updateCategory">Update</button>
    </div>
    <hr>
    <ul>
      <li v-for="item in list.categories" :key="item.id">
        <button @click="removeCategory(item.id)">Delete</button>
        <button @click="update = {id: item.id, name: item.name}">Update</button>
        {{ item.name }}
      </li>
    </ul>
    
  </section>
</template>

<script>
import CategoriesService from '../services/CategoriesService'

export default {
    name: 'CategoriesList',
    props: ['token'],
    data: () => ({
        service: null,
        list: [],
        loading: false,
        category: '',
        update: null
    }),
    mounted() {
        this.service = this.$serviceFactory(new CategoriesService, this)
    },
    watch: {
        token(value) {
            this.service.setHeader('x-access-token', value)
        }
    },
    methods: {
        async load() {
            this.loading = true
            this.list = await this.service.call('list')
            this.loading = false
        },
        async createCategory() {
            await this.callService('create', {name: this.category})
        },
        async removeCategory(id) {
            await this.callService('remove', {id})
        },
        async updateCategory() {
            await this.callService('update', this.update)
            this.update = null
        },
        async callService(method, params = {}) {
            this.loading = true
            await this.service.call(method, params)
            this.loading = false
            this.load()
        },
        validationError(error) {
            this.$emit('changeMsg', error)
        }
    }
}
</script>
