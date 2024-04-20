const Employee = require('../models/Employee')
const Bill = require('../models/Bill')
const OrderDetail = require('../models/OrderDetail')

function formatDateString(inputDateString) {
    let dateObject = new Date(inputDateString);

    let day = dateObject.getDate();
    let month = dateObject.getMonth() + 1;
    let year = dateObject.getFullYear();

    //"MM/DD/YYYY"
    let formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;

    return formattedDate;
}

function validateEmployeeId(employeeId, role) {
    let regex;
    switch (role) {
        case 'waiter':
            regex = /^W\d{3}$/; // Định dạng S + 3 số
            break;
        case 'manager':
            regex = /^M\d{3}$/; // Định dạng M + 3 số
            break;
        case 'chef':
            regex = /^C\d{3}$/; // Định dạng C + 3 số
            break;
        default:
            // Xử lý cho các trường hợp khác
            return false;
    }
    return regex.test(employeeId);
}

module.exports.get_bill_by_shift = (req, res) => {

    const shift = req.query.shift

    if (!shift) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    let currentDate = new Date()
    currentDate = formatDateString(currentDate.toLocaleDateString());


    Bill.find({ shift, date: currentDate })
        .then(listBill => {
            return res.json({ code: 0, listBill })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Search bills failed" })
        })
}

module.exports.get_bill_by_date = (req, res) => {

    let { startDate, endDate } = req.query

    if (!startDate || !endDate) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/\d{4}$/;

    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.json({ code: 1, message: "Invalid date format, date format should be (MM/DD/YYYY, M/DD/YYYY, MM/D/YYYY)" });
    }

    fromDate = new Date(startDate);
    toDate = new Date(endDate);
    fromDate = formatDateString(fromDate.toLocaleDateString());
    toDate = formatDateString(toDate.toLocaleDateString());
    dateCondition = { date: { $gte: fromDate, $lte: toDate } };

    Bill.find(dateCondition)
        .then(listBill => {
            return res.json({ code: 0, listBill })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Search bills failed" })
        })
}

module.exports.get_detail_bill = (req, res) => {
    const billId = req.query.billId

    if (!billId) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Bill.findById(billId)
        .then(bill => {
            OrderDetail.find({ orderId: bill.orderId })
                .then(listFood => {
                    return res.json({ code: 0, bill, listFood });
                })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Search bill failed" })
        })
}

module.exports.get_list_employee = (req, res) => {

    Employee.find()
        .then(listEmployee => {
            return res.json({ code: 0, listEmployee })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Search accounts failed" })
        })
}

module.exports.add_employee = (req, res) => {
    const { employeeId, name, role, email, password } = req.body

    if (!employeeId || !name || !role || !email || !password) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    if (name.length < 4) {
        return res.json({ code: 1, message: "Name is too short" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.json({ code: 1, message: "Invalid email" });
    }

    if (!(role == 'waiter' || role == 'manager' || role == 'chef')) {
        return res.json({ code: 1, message: "Invalid role" });
    }

    if (!validateEmployeeId(employeeId, role)) {
        return res.json({ code: 1, message: "Invalid employeeId format for the specified role" });
    }

    let employee = new Employee({
        employeeId, name, role, email, password
    })

    employee.save()
        .then(() => {
            return res.json({ code: 0, message: 'Add employee successfully' })
        })
        .catch(e => {
            if (e.message.includes('employeeId')) {
                return res.json({ code: 1, message: 'Employee Id already exists' })
            }
            else if (e.message.includes('name')) {
                return res.json({ code: 1, message: 'Name already exists' })
            }
            else if (e.message.includes('email')) {
                return res.json({ code: 1, message: 'Email already exists' })
            }

            return res.json({ code: 1, message: 'Add failed, an error has occurred' })
        })
}

module.exports.delete_employee = (req, res) => {
    const id = req.query.id

    if (!id) {
        return res.json({ code: 1, message: "Please provide employee id" })
    }

    Employee.findByIdAndDelete(id)
        .then(employee => {
            if (!employee) {
                return res.json({ code: 1, message: "Id not found" })
            }

            return res.json({ code: 0, message: "Delete employee successfully", employeeId: employee.employeeId })
        })
        .catch(e => {
            if (e.message.includes('Cast to ObjectId failed')) {
                return res.json({ code: 1, message: "Invalid Id" })
            }
            return res.json({ code: 1, message: "Delete failed, An error has occurred" })
        })
}

module.exports.edit_employee = (req, res) => {
    const id = req.query.id
    const { employeeId, name, email, role } = req.body

    if (!id) {
        return res.json({ code: 1, message: "Please provide employee id" })
    }

    if (name && name.length < 4) {
        return res.json({ code: 1, message: "Name is too short" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        return res.json({ code: 1, message: "Invalid email" });
    }

    if (role && !(role == 'waiter' || role == 'manager' || role == 'chef')) {
        return res.json({ code: 1, message: "Invalid role" });
    }

    let dataUpdate = {
        employeeId, name, email, role
    }
    let supportedFields = ['employeeId', 'name', 'email', 'role']

    for (field in dataUpdate) {
        if (!supportedFields.includes(field)) {
            delete dataUpdate[field]
        }
    }

    Employee.findById(id)
        .then(employee => {

            if (!employee) {
                return res.json({ code: 1, message: "Id not found" })
            }

            if (employeeId && role) {
                if (!validateEmployeeId(employeeId, role)) {
                    return res.json({ code: 1, message: "Invalid employeeId format for the specified role" })
                }
            }
            else if (employeeId && (!role)) {
                if (!validateEmployeeId(employeeId, employee.role)) {
                    return res.json({ code: 1, message: "Invalid employeeId format for the specified role" })
                }
            }
            else if ((!employeeId) && role) {
                if (!validateEmployeeId(employee.employeeId, role)) {
                    return res.json({ code: 1, message: "Invalid employeeId format for the specified role" })
                }
            }

            if (employeeId) employee.employeeId = employeeId
            if (name) employee.name = name
            if (email) employee.email = email
            if (role) employee.role = role

            employee.save()
                .then(() => {
                    return res.json({ code: 0, message: 'Update employee successfully' })
                })
                .catch(e => {
                    if (e.message.includes('employeeId')) {
                        return res.json({ code: 1, message: 'Employee Id already exists' })
                    }
                    else if (e.message.includes('name')) {
                        return res.json({ code: 1, message: 'Name already exists' })
                    }
                    else if (e.message.includes('email')) {
                        return res.json({ code: 1, message: 'Email already exists' })
                    }
                    return res.json({ code: 1, message: "Update failed, An error has occurred" })
                })

        })
        .catch(e => {
            if (e.message.includes('Cast to ObjectId failed')) {
                return res.json({ code: 1, message: "Invalid Id" })
            }
            return res.json({ code: 1, message: "Update failed, An error has occurred" })
        })
}