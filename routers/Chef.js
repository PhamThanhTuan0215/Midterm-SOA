const express = require('express')
const Router = express.Router()

const ChefController = require('../controllers/Chef')

const AccountController = require('../controllers/Account')

const Chef_Verify = require('../auth/VerifyToken_Chef')

Router.post('/', Chef_Verify, ChefController.home)

Router.post('/login', ChefController.login)

Router.get('/logout', ChefController.logout)

Router.get('/food-management', Chef_Verify, ChefController.get_foods)

Router.get('/set-status-food', Chef_Verify, ChefController.set_status_food)

Router.get('/orders', Chef_Verify, ChefController.get_all_orders)

Router.get('/detail-order', Chef_Verify, ChefController.detail_order)

Router.get('/completed-order', Chef_Verify, ChefController.set_completed_order)

Router.post('/change-password', Chef_Verify, AccountController.change_password)

module.exports = Router