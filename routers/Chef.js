const express = require('express')
const Router = express.Router()

const ChefController = require('../controllers/Chef')

const AccountController = require('../controllers/Account')

Router.post('/', ChefController.home)

Router.post('/login', ChefController.login)

Router.get('/logout', ChefController.logout)

Router.get('/food-management', ChefController.get_foods)

Router.get('/set-status-food', ChefController.set_status_food)

Router.get('/orders', ChefController.get_all_orders)

Router.get('/detail-order', ChefController.detail_order)

Router.get('/completed-order', ChefController.set_completed_order)

Router.post('/change-password', AccountController.change_password)

module.exports = Router