const express = require('express')
const Router = express.Router()

const WaiterController = require('../controllers/Waiter')

const ManagerController = require('../controllers/Manager')

const AccountController = require('../controllers/Account')

Router.post('/', WaiterController.home)

Router.post('/login', WaiterController.login)

Router.get('/logout', WaiterController.logout)

Router.get('/occupied-tables', WaiterController.get_occupied_tables)

Router.post('/new-order', WaiterController.add_new_order)

Router.get('/search-order', WaiterController.get_order)

Router.post('/payment', WaiterController.payment)

Router.get('/bills-shift/', ManagerController.get_bill_by_shift)

Router.get('/bills-date/', ManagerController.get_bill_by_date)

Router.get('/detail-bill/', ManagerController.get_detail_bill)

Router.get('/employees/', ManagerController.get_list_employee)

Router.post('/employees/add', ManagerController.add_employee)

Router.get('/employees/delete', ManagerController.delete_employee)

Router.post('/employees/edit', ManagerController.edit_employee)

Router.post('/change-password', AccountController.change_password)

module.exports = Router