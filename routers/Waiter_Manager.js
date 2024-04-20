const express = require('express')
const Router = express.Router()

const WaiterController = require('../controllers/Waiter')

const ManagerController = require('../controllers/Manager')

const AccountController = require('../controllers/Account')

const Waiter_Manager_Verify = require('../auth/VerifyToken_Waiter-Manager')

const Manager_Verify = require('../auth/VerifyToken_Manager')

Router.post('/', Waiter_Manager_Verify, WaiterController.home)

Router.post('/login', WaiterController.login)

Router.get('/logout', WaiterController.logout)

Router.get('/occupied-tables', Waiter_Manager_Verify, WaiterController.get_occupied_tables)

Router.post('/new-order', Waiter_Manager_Verify, WaiterController.add_new_order)

Router.get('/search-order', Waiter_Manager_Verify, WaiterController.get_order)

Router.get('/delete-order', Waiter_Manager_Verify, WaiterController.delete_order)

Router.post('/payment', Waiter_Manager_Verify, WaiterController.payment)

Router.get('/bills-shift/', Manager_Verify, ManagerController.get_bill_by_shift)

Router.get('/bills-date/', Manager_Verify, ManagerController.get_bill_by_date)

Router.get('/detail-bill/', Manager_Verify, ManagerController.get_detail_bill)

Router.get('/employees/', Manager_Verify, ManagerController.get_list_employee)

Router.post('/employees/add', Manager_Verify, ManagerController.add_employee)

Router.get('/employees/delete', Manager_Verify, ManagerController.delete_employee)

Router.post('/employees/edit', Manager_Verify, ManagerController.edit_employee)

Router.post('/change-password', Waiter_Manager_Verify, AccountController.change_password)

module.exports = Router