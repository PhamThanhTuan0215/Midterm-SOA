const Order = require('../models/Order')
const OrderDetail = require('../models/OrderDetail')
const Employee = require('../models/Employee')
const Bill = require('../models/Bill');

const createTokenEmployee = require('../auth/CreateToken_Employee')

const { addToExpiredList } = require('../auth/expiredTokenList')

const connections = require('../notification/connections')

module.exports.home = (req, res) => {
    const { email, password } = req.body

    if (!email) {
        return res.json({ code: 1, message: "Please provide email" })
    }

    if (!password) {
        return res.json({ code: 1, message: "Please provide password" })
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
            return res.json({ code: 1, message: "Login Failed" });
        });
}

module.exports.login = (req, res) => {

    const { email, password } = req.body

    if (!email) {
        return res.json({ code: 1, message: "Please provide email" })
    }

    if (!password) {
        return res.json({ code: 1, message: "Please provide password" })
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
            return res.json({ code: 1, message: "Login Failed" });
        });
}

module.exports.logout = (req, res) => {
    addToExpiredList(req.session.token)
    req.session.destroy()
    res.redirect('/')
}

module.exports.get_occupied_tables = (req, res) => {

    Order.find({ status_payment: false }, { customer: 1, table_code: 1, OTP: 1 })
        .then(occupiedTables => {
            return res.json({ code: 0, occupiedTables });
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to fetch occupied table codes" });
        });
}

module.exports.add_new_order = (req, res) => {
    const {customer, customers_number, table_code} = req.body

    if(!req.dataToken) {
        return res.json({ code: 1, message: "Token not found" })
    }

    if (!customer) {
        return res.json({ code: 1, message: "Please provide customer name" })
    }

    if (!customers_number) {
        return res.json({ code: 1, message: "Please provide number of customer" })
    }

    if (!table_code) {
        return res.json({ code: 1, message: "Please provide table code" })
    }

    if(customers_number < 1) {
        return res.json({ code: 1, message: "Invalid customer number" })
    }

    Order.findOne({table_code, status_payment: false})
        .then(o => {
            if(!o) {
                const OTP = generateRandomString(4);

                let order = new Order({
                    employeeId: req.dataToken.employeeId, customer, customers_number, table_code, OTP
                })
            
                order.save()
                    .then(() => {
                        return res.json({ code: 0, message: "Opened successfully, table code: " + table_code , order })
                    })
            }
            else {
                return res.json({ code: 1, message: "The table is occupied" });
            }
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to add new order" });
        });
}

module.exports.get_order = (req, res) => {

    const {customer, table_code} = req.query

    if (!customer) {
        return res.json({ code: 1, message: "Please provide customer name" })
    }

    if (!table_code) {
        return res.json({ code: 1, message: "Please provide table code" })
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
            return res.json({ code: 1, message: "Failed to fetch order details" });
        });
}

module.exports.delete_order = (req, res) => {

    const {table_code} = req.query

    if (!table_code) {
        return res.json({ code: 1, message: "Please provide table code" })
    }

    Order.findOne({table_code, status_payment: false})
        .then(order => {
            if (!order) {
                return res.json({ code: 1, message: "Order not found or has been paid" });
            }
            if(order.total_price > 0) {
                return res.json({ code: 1, message: "The customer has ordered" })
            }

            order.deleteOne()
                .then(() => {
                    return res.json({ code: 1, message: "Delete order successfully" });
                })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Failed to delete order" });
        });
}

module.exports.payment = (req, res) => {

    const {employeeId, orderId, received} = req.body

    if(!req.dataToken) {
        return res.json({ code: 1, message: "Token not found" })
    }

    if (!employeeId) {
        return res.json({ code: 1, message: "Please provide employee Id" })
    }

    if (!orderId) {
        return res.json({ code: 1, message: "Please provide order Id" })
    }

    if (!received) {
        return res.json({ code: 1, message: "Please provide received" })
    }

    if(employeeId !== req.dataToken.employeeId) {
        return res.json({ code: 1, message: "Employee Id does not match" })
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
            return res.json({ code: 1, message: "Payment failed" });
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

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}