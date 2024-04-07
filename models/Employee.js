const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EmployeeSchema = new Schema({
    employeeId: String,
    name: { type: String, unique: true },
    role: { type: String, default: 'staff' },
    email: { type: String, unique: true },
    password: String,
})

module.exports = mongoose.model('Employee', EmployeeSchema)