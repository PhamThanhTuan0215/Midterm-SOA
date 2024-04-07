const Food = require('../models/Food')
const Order = require('../models/Order')
const OrderDetail = require('../models/OrderDetail')

module.exports.home = (req, res) => {

    const {customer, table_code} = req.body

    if (!customer || !table_code) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Order.findOne({customer, table_code, status_payment: false})
    .then(order => {
        if (!order) {
            return res.json({ code: 1, message: "Order has not been created yet" });
        }

        res.render('Customer', {customer, table_code, orderId: order._id})
    })
    .catch(err => {
        return res.json({ code: 1, message: "Login Failed", error: err });
    });
}

module.exports.login = (req, res) => {
    const {customer, table_code} = req.body

    if (!customer || !table_code) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Order.findOne({customer, table_code, status_payment: false})
        .then(order => {
            if (!order) {
                return res.json({ code: 1, message: "Order has not been created yet" });
            }

            return res.json({ code: 0, message: "Login success"});
        })
        .catch(err => {
            return res.json({ code: 1, message: "Login Failed", error: err });
        });
}

module.exports.get_order = (req, res) => {
    const {customer, table_code} = req.query

    if (!customer || !table_code) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Order.findOne({customer, table_code, status_payment: false})
        .then(order => {
            if (!order) {
                return res.json({ code: 1, message: "Order not found" });
            }

            OrderDetail.aggregate([
                { $match: { orderId: order._id } },
                { $addFields: { sortValue: { $cond: { if: { $eq: ['$status', true] }, then: 0, else: 1 } } } },
                { $sort: { sortValue: 1 } }
            ])
            .then(listFood => {
                return res.json({ code: 0, order, listFood });
            })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to get order", error: err });
        });
}

module.exports.get_by_category = (req, res) => {
    const category = req.query.category

    if (!category) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Food.find({ category: category })
        .then(listItems => {
            return res.json({ code: 0, data: listItems })
        })
        .catch(err => {
            return json({ code: 2, message: "Error retrieving food items by category", error: err })
        });
}

module.exports.add_foods_into_order = (req, res) => {
    const {orderId, listFoods} = req.body

    if (!orderId || !listFoods) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    let totalPrice = 0
    const detailOrders = listFoods.map(food => {
        const { name, quantity, totalPrice: foodTotalPrice, note } = food
        totalPrice += foodTotalPrice

        return {
            orderId: orderId,
            name: name,
            quantity: quantity,
            totalPrice: foodTotalPrice,
            note: note
        };
    });

    OrderDetail.insertMany(detailOrders)
    .then(() => {
        return Order.findById(orderId)
        .then(order => {
            order.total_price += totalPrice
            order.status_completed = false
            order.status_check = false
            order.save()
            res.json({ code: 0, message: 'Added food to order successfully', order })
        })
    })
    .catch(error => {
        res.json({ code: 1, message: 'Added food to order failed', error: error })
    });
}