const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env

function createTokenEmployee(employee) {
    return jwt.sign({
        employeeId: employee.employeeId,
        name: employee.name,
        role: employee.role,
        email: employee.email
    }, JWT_SECRET, {
        expiresIn: '6h' // 6 hours
    });
}

module.exports = createTokenEmployee