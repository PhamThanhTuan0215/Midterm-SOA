const Employee = require('../models/Employee')
const Bill = require('../models/Bill')

module.exports.get_bill_by_shift = (req, res) => {

    const shift = req.query.shift

    if (!shift) {
        return res.json({ code: 1, message: "Lack of information" })
    }

    Bill.find({shift})
        .then(listBill => {
            return res.json({ code: 0, listBill })
        })
        .catch(err => {
            return res.json({ code: 1, message: "Search bills failed" })
        })
}

module.exports.get_bill_by_date = (req, res) => {

    let {startDate, endDate} = req.query

    if (!startDate || !endDate) {
        return res.json({ code: 1, message: "Lack of information" })
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

function formatDateString(inputDateString) {
    let dateObject = new Date(inputDateString);

    let day = dateObject.getDate();
    let month = dateObject.getMonth() + 1;
    let year = dateObject.getFullYear();

    //"MM/DD/YYYY"
    let formattedDate = `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;

    return formattedDate;
}