const Employee = require('../models/Employee')
const Food = require('../models/Food')
const Order = require('../models/Order')
const OrderDetail = require('../models/OrderDetail')

const createTokenEmployee = require('../auth/CreateToken_Employee')

const { addToExpiredList } = require('../auth/expiredTokenList')

const connections = require('../notification/connections')

module.exports.home = (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Employee.findOne({ email, role: 'chef'})
        .then(employee => {
            if (!employee) {
                return res.json({ code: 1, message: "Employee account does not exist" });
            }

            if (employee.password !== password) {
                return res.json({ code: 1, message: "Incorrect password" });
            }

            const token = req.query.token
            res.render('Chef', { employee, token })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Login Failed"});
        });
}

module.exports.login = (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Employee.findOne({ email, role: 'chef' })
        .then(employee => {
            if (!employee) {
                return res.json({ code: 1, message: "Employee account does not exist" });
            }

            if (employee.password !== password) {
                return res.json({ code: 1, message: "Incorrect password" });
            }

            req.session.employee = employee
            const token = createTokenEmployee(employee)
            req.session.token = token
            return res.json({ code: 0, message: "Login success", token });
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

module.exports.get_foods = (req, res) => {
    Food.find()
        .then(listFood => {
            return res.json({ code: 0, listFood});
        })
        .catch(e => {
            return res.json({ code: 1, message: "Failed to fetch foods" });
        })
}

module.exports.set_status_food = (req, res) => {

    const { name, status } = req.query

    if (!name || !status) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Food.findOneAndUpdate(
        { name: name },
        { status: status },
        { new: true }
    )
        .then(updatedFood => {
            if (!updatedFood) {
                return res.json({ code: 1, message: "Food not found" });
            }

            connections.changeStatusFoodToCustomer()

            return res.json({ code: 0, updatedFood });
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to update food status" });
        });
}

module.exports.get_all_orders = (req, res) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Order.aggregate([
        {
            $match: {
                timestamp: {
                    $gte: today,
                    $lt: new Date(today.getTime() + 86400000) // 86400000 là tổng số mili giây trong 1 ngày
                }
            }
        },
        {
            $sort: { status_check: 1, status_completed: 1, timestamp: -1 }
        }
    ])
        .then(listOrder => {
            res.json({ code: 0, listOrder });
        })
        .catch(error => {
            res.json({ code: 1, message: 'Error fetching orders' });
        });

}

module.exports.detail_order = (req, res) => {

    const orderId = req.query.orderId

    if (!orderId) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return res.json({ code: 1, message: "Order not found" });
            }

            order.status_check = true
            order.save()

            OrderDetail.find({ orderId: orderId })
                .then(listFood => {
                    return res.json({ code: 0, order, listFood });
                })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to fetch order details" });
        });
}

module.exports.set_completed_order = (req, res) => {

    const { orderId } = req.query

    if (!orderId) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    OrderDetail.updateMany(
        { orderId: orderId },
        { status: true }
    )
        .then(() => {
            Order.findByIdAndUpdate(orderId, { status_completed: true }, { new: true })
                .then(updatedOrder => {
                    if (!updatedOrder) {
                        return res.json({ code: 1, message: "Order not found" });
                    }

                    connections.completedOrderToCustomer(updatedOrder._id)
                    return res.json({ code: 0, updatedOrder });
                })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to update order" });
        });
}