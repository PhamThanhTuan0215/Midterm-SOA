const Employee = require('../models/Employee')

module.exports.change_password = (req, res) => {
    const id = req.query.id
    const {oldPassword, newPassword} = req.body

    if(!id) {
        return res.json({ code: 1, message: "Please provide employee id" })
    }

    if(!oldPassword) {
        return res.json({ code: 1, message: "Please provide password" })
    }
    if(!newPassword) {
        return res.json({ code: 1, message: "Please provide new password" })
    }

    Employee.findById(id)
        .then(employee => {
            if(!employee) {
                return res.json({ code: 1, message: "Id not found" })
            }

            if(employee.password !== oldPassword) {
                return res.json({ code: 1, message: "Incorrect password" })
            }

            employee.password = newPassword
            employee.save()
            return res.json({ code: 0, message: "Change password successfully" })
        })
        .catch(e => {
            if (e.message.includes('Cast to ObjectId failed')) {
                return res.json({ code: 1, message: "Invalid Id" })
            }
            return res.json({ code: 1, message: "Change password failed, An error has occurred" })
        })
}