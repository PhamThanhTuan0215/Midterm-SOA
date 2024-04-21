const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env

function createTokenEmployee(employee) {
    return jwt.sign({
        accountId: employee._id,
        employeeId: employee.employeeId,
        name: employee.name,
        role: employee.role,
        email: employee.email,
        password: employee.password
    }, JWT_SECRET, {
        expiresIn: '6h' // 6 hours
    });
}

module.exports = createTokenEmployee