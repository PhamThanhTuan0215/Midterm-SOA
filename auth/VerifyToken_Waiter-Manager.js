const jwt = require('jsonwebtoken')
const { JWT_SECRET } = process.env

const { isTokenExpired } = require('../auth/expiredTokenList')

module.exports = (req, res, next) => {
    const { token } = req.query

    if (!token || token === '') {
        return res.json({ code: 1, message: "Please provide token" })
    }

    try {
        jwt.verify(token, JWT_SECRET, (err, data) => {
            if (err) {
                return res.json({ code: 1, message: "Token is invalid or expired" })
            }
            else {
                if(isTokenExpired(token)) {
                    return res.json({ code: 1, message: "Token is expired" })
                }

                const role = data.role;
                if( ! (role === 'waiter' || role === 'manager') ) {
                    return res.json({ code: 1, message: "This token has no access rights, you are not a waiter or manager" })
                }
                else {
                    next()
                }
            }
        })
    }
    catch (error) {
        return res.json({ code: 1, message: "Token decoding failed" })
    }
}