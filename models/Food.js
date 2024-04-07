const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FoodSchema = new Schema({
    name: { type: String, unique: true },
    price: Number,
    category: String,
    url_image: String,
    status: { type: Boolean, default: true }
})

module.exports = mongoose.model('Food', FoodSchema)