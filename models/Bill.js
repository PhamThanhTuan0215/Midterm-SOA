const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BillSchema = new Schema({
    employeeId: String,
    customer: String,
    table_code: Number,
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    total_price: { type: Number, default: 0.00 },
    received: Number,
    refund: Number,
    date: String,
    shift: Number
})

module.exports = mongoose.model('Bill', BillSchema)