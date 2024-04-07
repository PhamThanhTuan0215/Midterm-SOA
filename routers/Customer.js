const express = require('express')
const Router = express.Router()

const CustomerController = require('../controllers/Customer')

Router.post('/', CustomerController.home)

Router.post('/login', CustomerController.login)

Router.get('/order', CustomerController.get_order)

Router.get('/food', CustomerController.get_by_category)

Router.post('/add-food', CustomerController.add_foods_into_order)

module.exports = Router