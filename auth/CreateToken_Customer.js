const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env

function createTokenCustomer(customer, table_code, orderId) {
    return jwt.sign({
        customer: customer,
        table_code: table_code,
        orderId: orderId,
        role: 'customer'
    }, JWT_SECRET, {
        expiresIn: '6h' // 6 hours
    });
}

module.exports = createTokenCustomer