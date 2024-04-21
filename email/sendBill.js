const nodemailer = require('nodemailer');
const {EMAIL_USER, EMAIL_PASS} = process.env

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
});

function sendBillToEmail(bill, listFood, email) {
    const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: 'Bill confirming payment',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bill</title>
                <style>
                    table {
                        border-collapse: collapse;
                        width: 100%;
                    }
                    th, td {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 8px;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h2>Bill</h2>
                <table>
                    <tr>
                        <th>Employee ID</th>
                        <td>${bill.employeeId}</td>
                    </tr>
                    <tr>
                        <th>Customer</th>
                        <td>${bill.customer}</td>
                    </tr>
                    <tr>
                        <th>Table Code</th>
                        <td>${bill.table_code}</td>
                    </tr>
                    <tr>
                        <th>Total Price</th>
                        <td>$${bill.total_price.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <th>Received</th>
                        <td>$${bill.received.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <th>Refund</th>
                        <td>$${bill.refund.toFixed(2)}</td>
                    </tr>
                    <tr>
                        <th>Date</th>
                        <td>${bill.date}</td>
                    </tr>
                    <tr>
                        <th>Shift</th>
                        <td>${bill.shift}</td>
                    </tr>
                </table>
                <h2>Food List</h2>
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Total Price</th>
                        <th>Note</th>
                    </tr>
                    ${listFood.map(food => `
                        <tr>
                            <td>${food.name}</td>
                            <td>${food.quantity}</td>
                            <td>$${food.totalPrice.toFixed(2)}</td>
                            <td>${food.note ?? ''}</td>
                        </tr>
                    `).join('')}
                </table>
            </body>
            </html>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports = sendBillToEmail