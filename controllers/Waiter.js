const Order = require('../models/Order')
const OrderDetail = require('../models/OrderDetail')
const Employee = require('../models/Employee')
const Bill = require('../models/Bill');

const createTokenEmployee = require('../auth/CreateToken_Employee')

const { addToExpiredList } = require('../auth/expiredTokenList')

const connections = require('../notification/connections')

module.exports.home = (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Employee.findOne({ email, $or: [{ role: 'waiter' }, { role: 'manager' }] })
        .then(employee => {
            if (!employee) {
                return res.json({ code: 1, message: "Employee account does not exist" });
            }

            if (employee.password !== password) {
                return res.json({ code: 1, message: "Incorrect password" });
            }

            const token = req.query.token
            res.render('Waiter_Manager', { employee, token })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Login Failed", error: err });
        });
}

module.exports.login = (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Employee.findOne({ email, $or: [{ role: 'waiter' }, { role: 'manager' }] })
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
            return res.json({ code: 1, message: "Login Failed", error: err });
        });
}

module.exports.logout = (req, res) => {
    addToExpiredList(req.session.token)
    req.session.destroy()
    res.redirect('/')
}

module.exports.get_occupied_tables = (req, res) => {

    Order.distinct("table_code", {status_payment: false})
        .then(tableCodes => {
            return res.json({ code: 0, tableCodes});
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to fetch occupied table codes", error: err });
        });
}

module.exports.add_new_order = (req, res) => {
    const {customer, customers_number, table_code} = req.body

    if (!customer || !customers_number || !table_code) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Order.findOne({customer, table_code, status_payment: false})
        .then(o => {
            if(!o) {
                let order = new Order({
                    employeeId: req.session.employee.employeeId, customer, customers_number, table_code
                })
            
                order.save()
                    .then(() => {
                        return res.json({ code: 0, orderId: order._id })
                    })
            }
            else {
                return res.json({ code: 1, message: "The table is occupied" });
            }
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to add new order", err });
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
                return res.json({ code: 1, message: "Order not found or has been paid" });
            }
            if(order.status_completed === false) {
                return res.json({ code: 1, message: "Order not completed" })
            }

            OrderDetail.find({ orderId: order._id })
                .then(listFood => {
                    return res.json({ code: 0, order, listFood });
                })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to fetch order details", error: err });
        });
}

module.exports.payment = async (req, res) => {

    const {employeeId, orderId, received} = req.body

    if (!employeeId || !orderId || !received) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return res.json({ code: 1, message: "Order not found" });
            }
            if(order.status_completed === false) {
                res.json({ code: 1, message: "Order not completed" })
            }
            else if(order.status_payment === true) {
                res.json({ code: 1, message: "Order has been paid" })
            }
            else {
                order.status_payment = true

                const receivedAmount = parseFloat(received).toFixed(2);
                const refundAmount = receivedAmount - order.total_price;

                if(refundAmount < 0) {
                    return res.json({ code: 1, message: "Balance not enough" });
                }

                let date = new Date();
                let shift = getShift(date.getHours());
                date = formatDateString(date.toLocaleDateString());

                let newBill = new Bill({
                    employeeId: employeeId,
                    customer: order.customer,
                    table_code: order.table_code,
                    orderId: orderId,
                    total_price: order.total_price,
                    received: receivedAmount,
                    refund: refundAmount,
                    date: date,
                    shift: shift
                });

                newBill.save()
                    .then(bill => {
                        order.save()

                        connections.completedPaymentToCustomer(order._id)

                        return res.json({ code: 0, message: "Payment successfully", refund: refundAmount, bill: bill});
                    })
            }
        })
        .catch(error => {
            return res.json({ code: 1, message: "Payment failed", error });
        });
}

function getShift(currentHour) {
    if (currentHour >= 6 && currentHour < 12) {
        return 1;
    } else if (currentHour >= 12 && currentHour < 18) {
        return 2;
    } else {
        return 3;
    }
}

function formatDateString(inputDateString) {
    let dateObject = new Date(inputDateString);

    let day = dateObject.getDate();
    let month = dateObject.getMonth() + 1;
    let year = dateObject.getFullYear();

    //"MM/DD/YYYY"
    let formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;

    return formattedDate;
}