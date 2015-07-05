'use strict'

var data = require('./data.js')
var Vue = require('vue')

// http://vuejs.org/examples/grid-component.html
var vm = new Vue({
  el: '#page',
  data: {
    time: data.time,
    rows: data.list,
    query: '',
    sortKey: '',
    reversed: {
      name: false,
      date: false
    },
    filterKey: 'name'
  },
  methods: {
    sortBy: function (key) {
      this.sortKey = key
      this.reversed[key] = !this.reversed[key]
    }
  }
})
