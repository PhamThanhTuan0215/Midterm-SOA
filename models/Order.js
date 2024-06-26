const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema({
    employeeId: String,
    customer: String,
    customers_number: Number,
    table_code: Number,
    OTP: String,
    status_completed: { type: Boolean, default: false },
    status_payment: { type: Boolean, default: false },
    total_price: { type: Number, default: 0.00 },
    status_check: { type: Boolean, default: false },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Order', OrderSchema)