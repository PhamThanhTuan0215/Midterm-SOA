const express = require('express')
const Router = express.Router()

const StaffController = require('../controllers/Staff')

const ManagerController = require('../controllers/Manager')

Router.post('/', StaffController.home)

Router.post('/login', StaffController.login)

Router.get('/logout', StaffController.logout)

Router.get('/occupied-tables', StaffController.get_occupied_tables)

Router.post('/new-order', StaffController.add_new_order)

Router.get('/search-order', StaffController.get_order)

Router.post('/payment', StaffController.payment)

Router.get('/bills-shift/', ManagerController.get_bill_by_shift)

Router.get('/bills-date/', ManagerController.get_bill_by_date)

module.exports = Router