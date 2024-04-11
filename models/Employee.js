const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EmployeeSchema = new Schema({
    employeeId: { type: String, unique: true },
    name: { type: String, unique: true },
    role: { type: String, default: 'waiter' },
    email: { type: String, unique: true },
    password: String,
})

module.exports = mongoose.model('Employee', EmployeeSchema)