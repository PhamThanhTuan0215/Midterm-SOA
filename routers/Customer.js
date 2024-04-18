const express = require('express')
const Router = express.Router()

const CustomerController = require('../controllers/Customer')

const Customer_Verify = require('../auth/VerifyToken_Customer')

Router.post('/', Customer_Verify, CustomerController.home)

Router.post('/login', CustomerController.login)

Router.get('/logout', CustomerController.logout)

Router.get('/get-order', Customer_Verify, CustomerController.get_order)

Router.get('/food', Customer_Verify, CustomerController.get_by_category)

Router.post('/order-food', Customer_Verify, CustomerController.add_foods_into_order)

module.exports = Router