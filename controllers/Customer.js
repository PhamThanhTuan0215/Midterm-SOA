const Food = require('../models/Food')
const Order = require('../models/Order')
const OrderDetail = require('../models/OrderDetail')

const createTokenCustomer = require('../auth/CreateToken_Customer')

const { addToExpiredList } = require('../auth/expiredTokenList')

const connections = require('../notification/connections')

module.exports.home = (req, res) => {

    const {customer, table_code} = req.body

    if (!req.dataToken) {
        return res.json({ code: 1, message: "Token not found" })
    }

    if (!customer) {
        return res.json({ code: 1, message: "Please provide customer name" })
    }

    if (!table_code) {
        return res.json({ code: 1, message: "Please provide table code" })
    }

    if (req.dataToken.customer !== customer) {
        return res.json({ code: 1, message: "Customer name does not match" })
    }

    if (req.dataToken.table_code != table_code) {
        return res.json({ code: 1, message: "Table code does not match" })
    }

    Order.findOne({customer, table_code, status_payment: false})
    .then(order => {
        if (!order) {
            return res.json({ code: 1, message: "Order has not been created yet" });
        }

        const token = req.query.token
        res.render('Customer', {customer, table_code, orderId: order._id, token})
    })
    .catch(err => {
        return res.json({ code: 1, message: "Login Failed" });
    });
}

module.exports.login = (req, res) => {
    const {customer, table_code, OTP} = req.body

    if (!customer) {
        return res.json({ code: 1, message: "Please provide customer name" })
    }

    if (!table_code) {
        return res.json({ code: 1, message: "Please provide table code" })
    }

    if (!OTP) {
        return res.json({ code: 1, message: "Please provide OTP code" })
    }

    Order.findOne({customer, table_code, status_payment: false})
        .then(order => {
            if (!order) {
                return res.json({ code: 1, message: "Order has not been created yet" });
            }

            if(order.OTP !== OTP) {
                return res.json({ code: 1, message: "Incorrect OTP code" });
            }

            req.session.order = order
            const token = createTokenCustomer(customer, table_code, order._id)
            req.session.token = token
            return res.json({ code: 0, message: "Login success", token});
        })
        .catch(err => {
            return res.json({ code: 1, message: "Login Failed"});
        });
}

module.exports.logout = (req, res) => {
    addToExpiredList(req.session.token)
    req.session.destroy()
    res.redirect('/')
}

module.exports.get_order = (req, res) => {
    const {customer, table_code} = req.query

    if (!req.dataToken) {
        return res.json({ code: 1, message: "Token not found" })
    }

    if (!customer) {
        return res.json({ code: 1, message: "Please provide customer name" })
    }

    if (!table_code) {
        return res.json({ code: 1, message: "Please provide table code" })
    }

    if (req.dataToken.customer !== customer) {
        return res.json({ code: 1, message: "Customer name does not match" })
    }

    if (req.dataToken.table_code != table_code) {
        return res.json({ code: 1, message: "Table code does not match" })
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
            return res.json({ code: 1, message: "Failed to get order" });
        });
}

module.exports.get_by_category = (req, res) => {
    const category = req.query.category

    if (!category) {
        return res.json({ code: 1, message: "Please provide category" })
    }

    Food.find({ category: category })
        .then(listFood => {
            return res.json({ code: 0, listFood })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Error retrieving food items by category" })
        });
}

module.exports.add_foods_into_order = (req, res) => {
    const {orderId, listFoods} = req.body

    if (!req.dataToken) {
        return res.json({ code: 1, message: "Token not found" })
    }

    if (!orderId) {
        return res.json({ code: 1, message: "Please provide order Id" })
    }

    if (!listFoods) {
        return res.json({ code: 1, message: "Please provide list food" })
    }

    if(req.dataToken.orderId !== orderId) {
        return res.json({ code: 1, message: "Order Id does not match" })
    }

    let error = false

    let totalPrice = 0
    const detailOrders = listFoods.map(food => {
        const { name, quantity, totalPrice: foodTotalPrice, note } = food

        if(!name || !quantity || !foodTotalPrice) {
            error = true
        }

        if (!(typeof quantity === 'number' && quantity > 0)) {
            error = true
        }

        if (!(typeof foodTotalPrice === 'number' && foodTotalPrice > 0)) {
            error = true
        }

        totalPrice += foodTotalPrice

        return {
            orderId: orderId,
            name: name,
            quantity: quantity,
            totalPrice: foodTotalPrice,
            note: note
        };
    });

    if(error) {
        return res.json({ code: 1, message: 'FoodItem is not in the correct format' })
    }

    Order.findById(orderId)
        .then(order => {
            if(order) {
                OrderDetail.insertMany(detailOrders)
                order.total_price += totalPrice
                order.status_completed = false
                order.status_check = false
                order.save()
                
                connections.sentOrderToChef()

                return res.json({ code: 0, message: 'Added food to order successfully', order, listFood: listFoods })
            }
            else {
                res.json({ code: 1, message: 'Order not found' })
            }
        })
        .catch(error => {
            res.json({ code: 1, message: 'Added food to order failed' })
        });
}