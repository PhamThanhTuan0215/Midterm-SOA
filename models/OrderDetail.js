const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderDetailSchema = new Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    name: String,
    quantity: Number,
    totalPrice: Number,
    note: String,
    status: { type: Boolean, default: false }
});

module.exports = mongoose.model('OrderDetail', OrderDetailSchema)