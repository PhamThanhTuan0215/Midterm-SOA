const employeeData = document.getElementById('employeeData');
const token = employeeData.getAttribute('data-token');
const employeeId = employeeData.getAttribute('data-employeeid');
const id = employeeData.getAttribute('data-id');

const btnNewOrder = document.getElementById('btnNewOrder');
const btnPayment = document.getElementById('btnPayment');
const btnCurrentShift = document.getElementById('btnCurrentShift');
const btnHistory = document.getElementById('btnHistory');
const btnAccountManage = document.getElementById('btnAccountManage');

const newOrderContent = document.getElementById('newOrderContent');
const paymentContent = document.getElementById('paymentContent');
const currentShiftContent = document.getElementById('currentShiftContent');
const historyContent = document.getElementById('historyContent');
const accountManageContent = document.getElementById('accountManageContent');

if(btnNewOrder) {
    btnNewOrder.addEventListener('click', function() {
        showContent(newOrderContent);
    
        getOccupiedTables()
    });
}

if(btnPayment) {
    btnPayment.addEventListener('click', function() {
        showContent(paymentContent);
    });
}

if(btnCurrentShift) {
    btnCurrentShift.addEventListener('click', function() {
        showContent(currentShiftContent);
    
        getBillsCurrentShift()
    });
}

if(btnHistory) {
    btnHistory.addEventListener('click', function() {
        showContent(historyContent);

        let startDate = new Date()
        let endDate = new Date()
        startDate = formatDateString(startDate)
        endDate = formatDateString(endDate)

        getBills(startDate, endDate)
    });
}

if(btnAccountManage) {
    btnAccountManage.addEventListener('click', function() {
        showContent(accountManageContent);

        getListEmployee()
    });
}

document.addEventListener('DOMContentLoaded', function() {
    btnNewOrder.click();
});

function showContent(contentElement) {
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => {
        content.style.display = 'none';
    });

    contentElement.style.display = 'block';
}

document.getElementById('tableQuantity').addEventListener('keydown', function(event) {
    event.preventDefault();
});

document.getElementById('tableQuantity').addEventListener('wheel', function(event) {
    if (event.deltaY < 0) {
        this.stepUp();
    } else {
        this.stepDown();
    }
});

document.getElementById('tableQuantity').addEventListener('change', function() {
    getOccupiedTables()
})

// new order
function getOccupiedTables() {
    const url = '/waiter-manager/occupied-tables?token=' + token
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                displayGridTable(json.occupiedTables)
            }
            else {
                alert(json.message)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

const openTableModal = document.getElementById('openTableModal');
const btnOpen = document.getElementById('btnOpen');
const tableCodeInput = document.getElementById('table_code');
const customerNameInput = document.getElementById('customer');
const customerNumberInput = document.getElementById('customer_number');
const closeOpenTableModal = document.getElementById('closeOpenTableModal');
const gridItems = document.querySelectorAll('.grid-item');

gridItems.forEach(item => {
    item.addEventListener('click', function() {
        const tableCode = item.textContent.trim();
        tableCodeInput.value = tableCode;
        openTableModal.style.display = 'block';
    });
});

function displayGridTable(occupiedTables) {
    const gridContainer = document.getElementById('grid-container');

    gridContainer.innerHTML = ''

    let tableQuantity = parseInt(document.getElementById('tableQuantity').value) ?? 30

    const maxOccupiedTableCode = Math.max(...occupiedTables.map(table => table.table_code));
    tableQuantity = Math.max(tableQuantity, maxOccupiedTableCode);

    for (let i = 1; i <= tableQuantity; i++) {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.textContent = i;
        
        const tableInfo = occupiedTables.find(table => table.table_code === i);
        if (tableInfo) {
            gridItem.classList.add('occupied');
            gridItem.addEventListener('click', function() {
                alert(`customer: ${tableInfo.customer}\nOTP: ${tableInfo.OTP}`)
            });
        } else {
            gridItem.classList.add('unoccupied');
            gridItem.addEventListener('click', function() {
                openTableModal.style.display = 'block';
                tableCodeInput.value = i;
            });
        }

        gridContainer.appendChild(gridItem);
    }
}

closeOpenTableModal.addEventListener('click', function() {
    openTableModal.style.display = 'none';
});

btnOpen.addEventListener('click', function() {
    const customer = customerNameInput.value;
    const customers_number = customerNumberInput.value;
    const table_code = tableCodeInput.value;

    openTable(customer, customers_number, table_code)

    openTableModal.style.display = 'none';
});

function openTable(customer, customers_number, table_code) {
    const url = '/waiter-manager/new-order?token=' + token
    const data = {
        customer: customer,
        customers_number: customers_number,
        table_code: table_code
    };
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(json => {
        if (json.code == 0) {
            getOccupiedTables()
            tableCodeInput.value = 0
            customerNameInput.value = ''
            customerNumberInput.value = ''
            alert(json.message)
        }
        else {
            alert(json.message)
        }
      })
      .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
      });
}

// payment
const btnSearchOrder = document.getElementById('btnSearchOrder')
const btnDeleteOrder = document.getElementById('btnDeleteOrder')
const tableCodeInput2 = document.getElementById('table_code_2');
const customerNameInput2 = document.getElementById('customer_2');
const searchResultOrder = document.getElementById('searchResultOrder');

btnSearchOrder.addEventListener('click', function() {
    const customer = customerNameInput2.value;
    const table_code = tableCodeInput2.value;

    searchOrder(customer, table_code)
});

btnDeleteOrder.addEventListener('click', function() {
    const table_code = tableCodeInput2.value;

    deleteOrder(table_code)
});

function searchOrder(customer, table_code) {
    const url = '/waiter-manager/search-order?customer=' + customer +'&table_code=' + table_code + '&token=' + token
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                displayResultOrder(json.order, json.listFood)
            }
            else {
                alert(json.message)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

function deleteOrder(table_code) {
    const url = '/waiter-manager/delete-order?table_code=' + table_code + '&token=' + token
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                displayResultOrder(json.order, json.listFood)
            }
            else {
                alert(json.message)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

function displayResultOrder(order, listFood) {
    const searchResultOrder = document.getElementById('searchResultOrder');
    searchResultOrder.style.display = 'flex'

    const informationOrder = document.getElementById('informationOrder');
    const detailOrderTableBody = document.querySelector('#detailOrder tbody');

    informationOrder.innerHTML = `
        <h2>Information of order</h2>
        <p>Customer: <strong>${order.customer}</strong></p>
        <p>Table Code: <strong>${order.table_code}</strong></p>
        <p>Status complete: <strong>${order.status_completed ? 'Completed' : 'Not yet'}</strong></p>
        <p>Status payment: <strong>${order.status_payment ? 'Paid' : 'Not yet'}</strong></p>
        <p>Total price: <strong>$${order.total_price.toFixed(2)}</strong></p>
        <button data-orderId="${order._id}" data-totalPrice="${order.total_price}" id="btnPay">Pay</button>
    `;

    detailOrderTableBody.innerHTML = '';

    listFood.forEach(food => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${food.name}</td>
            <td>${food.quantity}</td>
            <div>$${food.totalPrice.toFixed(2)}</div>
            <td>${food.status ? '<i class="completed-icon fas fa-check-circle"></i>' : '<i class="waiting-icon fas fa-clock"></i>'}</td>
        `;
        detailOrderTableBody.appendChild(newRow);
    });

    const btnPay = document.getElementById('btnPay')
    btnPay.addEventListener('click', function() {
        const paymentModal = document.getElementById('paymentModal');
        paymentModal.style.display = 'block';
    });
}

const closePaymentModal = document.getElementById('closePaymentModal');

closePaymentModal.addEventListener('click', function() {
    const searchResultOrder = document.getElementById('searchResultOrder');
    searchResultOrder.style.display = 'none'
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.style.display = 'none';
    document.getElementById('btnConfirmPayment').style.display = 'block'
    document.getElementById('errMessagePayment').style.display = 'none'
    document.getElementById('employeeId').value = ''
    document.getElementById('received').value = ''
});

const btnConfirmPayment = document.getElementById('btnConfirmPayment');

btnConfirmPayment.addEventListener('click', function() {
    const _employeeId = document.getElementById('employeeId').value;
    const received = parseFloat(document.getElementById('received').value);
    const btnPay = document.getElementById('btnPay')
    const orderId = btnPay.dataset.orderid
    const totalPrice = parseFloat(btnPay.dataset.totalprice);

    const errorMessage = document.getElementById('errMessagePayment')

    if(!_employeeId) {
        errorMessage.innerHTML = 'Please enter employee id'
        errorMessage.style.display = 'block'
        errorMessage.style.color = 'red'
        return
    }

    if(!received) {
        errorMessage.innerHTML = 'Please enter received'
        errorMessage.style.display = 'block'
        errorMessage.style.color = 'red'
        return
    }

    if(_employeeId !== employeeId) {
        errorMessage.innerHTML = 'Invalid employee id'
        errorMessage.style.display = 'block'
        errorMessage.style.color = 'red'
        return
    }
    else if(received < totalPrice) {
        errorMessage.innerHTML = 'Balance not enough'
        errorMessage.style.display = 'block'
        errorMessage.style.color = 'red'
        return
    }

    payment(_employeeId, orderId, received)

});


function payment(employeeId, orderId, received) {
    const url = '/waiter-manager/payment?token=' + token
    const data = {
        employeeId: employeeId,
        orderId: orderId,
        received: received
    };
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(json => {
        const errorMessage = document.getElementById('errMessagePayment')
        if(json.code == 0) {
            errorMessage.innerHTML = json.message + ', refund: $' + json.refund.toFixed(2)
            errorMessage.style.display = 'block'
            errorMessage.style.color = 'green'
            btnConfirmPayment.style.display = 'none'
        }
        else {
            errorMessage.innerHTML = json.message
            errorMessage.style.display = 'block'
            errorMessage.style.color = 'red'
        }
      })
      .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
      });
}

// current shift
const detailBillModal = document.getElementById('detailBillModal');
const closeDetailBillModal = document.getElementById('closeDetailBillModal');

function getBillsCurrentShift() {
    const shift = getCurrentShift()

    const url = '/waiter-manager/bills-shift?shift=' + shift + '&token=' + token
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                displayBillsCurrentShift(json.listBill)
            }
            else {
                alert(json.message)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        }); 
}

function getCurrentShift() {
    const date = new Date();
    const currentHour = date.getHours()

    if (currentHour >= 6 && currentHour < 12) {
        return 1;
    } else if (currentHour >= 12 && currentHour < 18) {
        return 2;
    } else {
        return 3;
    }
}

function displayBillsCurrentShift(listBill) {
    const currentShiftTableBody = document.querySelector('#currentShiftContent tbody');
    currentShiftTableBody.innerHTML = '';

    listBill.forEach(bill => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${bill.employeeId}</td>
            <td>${bill.customer}</td>
            <td>${bill.table_code}</td>
            <td>$${bill.total_price.toFixed(2)}</td>
            <td>$${bill.received.toFixed(2)}</td>
            <td>$${bill.refund.toFixed(2)}</td>
            <td>${bill.date}</td>
            <td>${bill.shift}</td>
            <td><button class="view-detail" data-billId="${bill._id}">View</button></td>
        `;
        currentShiftTableBody.appendChild(newRow);
    });

    document.getElementById('totalBillCurrentShift').innerHTML = listBill.length

    addClickEventsForViewBtn()
}

closeDetailBillModal.addEventListener('click', function() {
    detailBillModal.style.display = 'none';
});

function addClickEventsForViewBtn() {
    const viewButtons = document.querySelectorAll('.view-detail');

    viewButtons.forEach(button => {
        button.addEventListener('click', function () {
            const billId = button.getAttribute('data-billId');
            getDetailBill(billId)
        });
    });
}

function getDetailBill(billId) {
    const url = '/waiter-manager/detail-bill?billId=' + billId + '&token=' + token
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                const bill = json.bill
                const listFood = json.listFood

                displayDetailBill(bill, listFood)
            }
            else {
                alert(json.message)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        }); 
}

function displayDetailBill(bill, listFood) {
    document.getElementById('bill-employeeId').textContent = bill.employeeId;
    document.getElementById('bill-customer').textContent = bill.customer;
    document.getElementById('bill-tableCode').textContent = bill.table_code;
    document.getElementById('bill-totalPrice').textContent = `$${bill.total_price.toFixed(2)}`;
    document.getElementById('bill-received').textContent = `$${bill.received.toFixed(2)}`;
    document.getElementById('bill-refund').textContent = `$${bill.refund.toFixed(2)}`;
    document.getElementById('bill-date').textContent = bill.date;
    document.getElementById('bill-shift').textContent = bill.shift;

    const foodItemsTable = document.getElementById('foodItems');
    foodItemsTable.innerHTML = '';

    listFood.forEach(food => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${food.name}</td>
            <td>${food.quantity}</td>
            <td>$${food.totalPrice.toFixed(2)}</td>
        `;
        foodItemsTable.appendChild(newRow);
    });

    detailBillModal.style.display = 'block'
}

//history
const searchFix = document.getElementById('searchFix');
const searchFlex = document.getElementById('searchFlex');

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${month}/${day}/${year}`;
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

searchFix.addEventListener('click', function() {
    const timeRange = document.getElementById('timeRange');
    const valueTimeRange = timeRange.value

    if(!valueTimeRange) {
        return alert('Please select date')
    }
    
    let startDate = new Date()
    let endDate = new Date()

    if(valueTimeRange === 'yesterday') {
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() -1);

        startDate = formatDateString(startDate)
        endDate = formatDateString(endDate)
    }
    else {
        endDate = formatDateString(endDate)
        const [month, day, year] = endDate.split('/');

        if(valueTimeRange === 'today') {
            startDate = endDate
        }
        else if(valueTimeRange === 'thismonth') {
            startDate = `${month}/01/${year}`
        }
        else if(valueTimeRange === 'thisyear') {
            startDate = `01/01/${year}`
        }
    }

    getBills(startDate, endDate)

});

searchFlex.addEventListener('click', function() {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    if(!startDateInput.value) {
        return alert('Please select date start')
    }
    else if(!endDateInput.value) {
        return alert('Please select date end')
    }

    const startDate = formatDate(startDateInput.value)
    const endDate = formatDate(endDateInput.value)

    getBills(startDate, endDate)
});

function getBills(startDate, endDate) {

    const url = '/waiter-manager/bills-date?startDate=' + startDate + '&endDate=' + endDate + '&token=' + token
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                displayBills(json.listBill)
            }
            else {
                alert(json.message)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        }); 
}

function displayBills(listBill) {
    const tableBody = document.querySelector('#historyContent tbody');
    tableBody.innerHTML = '';

    listBill.forEach(bill => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${bill.employeeId}</td>
            <td>${bill.customer}</td>
            <td>${bill.table_code}</td>
            <td>$${bill.total_price.toFixed(2)}</td>
            <td>$${bill.received.toFixed(2)}</td>
            <td>$${bill.refund.toFixed(2)}</td>
            <td>${bill.date}</td>
            <td>${bill.shift}</td>
            <td><button class="view-detail" data-billId="${bill._id}">View</button></td>
        `;
        tableBody.appendChild(newRow);
    });

    document.getElementById('totalBillHistory').innerHTML = listBill.length

    addClickEventsForViewBtn()
}

//account manage
function getListEmployee() {
    const url = '/waiter-manager/employees?token=' + token
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                displayListEmployee(json.listEmployee)
            }
            else {
                alert(json.message)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        }); 
}

function displayListEmployee(listEmployee) {
    const tableBody = document.querySelector('#accountManageContent tbody');
    tableBody.innerHTML = '';

    listEmployee.forEach(employee => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${employee.employeeId}</td>
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td>${employee.role}</td>
            <td>
                <button class="btnEdit" 
                    data-id="${employee._id}"
                    data-employeeid="${employee.employeeId}"
                    data-name="${employee.name}"
                    data-email="${employee.email}"
                    data-role="${employee.role}"
                >Edit</button>
                <button class="btnDelete" data-id="${employee._id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(newRow);
    });

    addClickEventsForDeleteBtn()
    addClickEventsForEditBtn()
}

const btnAdd = document.getElementById('btnAdd');
const btnChangePassword = document.getElementById('btnChangePassword');
const addEmployeeModal = document.getElementById('addEmployeeModal');
const deleteEmployeeModal = document.getElementById('deleteEmployeeModal');
const editEmployeeModal = document.getElementById('editEmployeeModal');
const changePasswordModal = document.getElementById('changePasswordModal');
const closeAddEmployeeModal = document.getElementById('closeAddEmployeeModal');
const closeDeleteEmployeeModal = document.getElementById('closeDeleteEmployeeModal');
const closeEditEmployeeModal = document.getElementById('closeEditEmployeeModal');
const closeChangePasswordModal = document.getElementById('closeChangePasswordModal');
const btnAddConfirm = document.getElementById('btnAddConfirm');
const btnDeleteConfirm = document.getElementById('btnDeleteConfirm');
const btnEditConfirm = document.getElementById('btnEditConfirm');
const btnChangePasswordConfirm = document.getElementById('btnChangePasswordConfirm');
const addErrorMessage = document.getElementById('add-error-message');
const deleteErrorMessage = document.getElementById('delete-error-message');
const editErrorMessage = document.getElementById('edit-error-message');
const changePWErrorMessage = document.getElementById('change-password-error-message');

const togglePassword = document.getElementById('togglePassword');
const toggleOldPassword = document.getElementById('toggleOldPassword');
const toggleNewPassword = document.getElementById('toggleNewPassword');
const passwordInput = document.getElementById('add-password');
const oldPasswordInput = document.getElementById('old-password');
const newPasswordInput = document.getElementById('new-password');

togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePassword.classList.toggle('fa-eye');
    togglePassword.classList.toggle('fa-eye-slash');
});

toggleOldPassword.addEventListener('click', function() {
    const type = oldPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    oldPasswordInput.setAttribute('type', type);
    toggleOldPassword.classList.toggle('fa-eye');
    toggleOldPassword.classList.toggle('fa-eye-slash');
});

toggleNewPassword.addEventListener('click', function() {
    const type = newPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    newPasswordInput.setAttribute('type', type);
    toggleNewPassword.classList.toggle('fa-eye');
    toggleNewPassword.classList.toggle('fa-eye-slash');
});

closeAddEmployeeModal.addEventListener('click', function() {
    addEmployeeModal.style.display = 'none';
});

closeDeleteEmployeeModal.addEventListener('click', function() {
    deleteEmployeeModal.style.display = 'none';
});

closeEditEmployeeModal.addEventListener('click', function() {
    editEmployeeModal.style.display = 'none';
});

closeChangePasswordModal.addEventListener('click', function() {
    changePasswordModal.style.display = 'none';
});

btnAdd.addEventListener('click', function() {
    addEmployeeModal.style.display = 'block';
});

btnChangePassword.addEventListener('click', function() {
    changePasswordModal.style.display = 'block';
});

function addClickEventsForDeleteBtn() {
    const buttons = document.querySelectorAll('.btnDelete');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const id = button.getAttribute('data-id');
            deleteEmployeeModal.style.display = 'block'
            btnDeleteConfirm.setAttribute('data-id', id);
        });
    });
}

function addClickEventsForEditBtn() {
    const buttons = document.querySelectorAll('.btnEdit');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const id = button.getAttribute('data-id');
            editEmployeeModal.style.display = 'block'
            btnEditConfirm.setAttribute('data-id', id);

            document.getElementById('edit-employeeId').value = button.getAttribute('data-employeeid');
            document.getElementById('edit-name').value = button.getAttribute('data-name');
            document.getElementById('edit-email').value = button.getAttribute('data-email');
            document.getElementById('edit-role').value = button.getAttribute('data-role');
        });
    });
}

btnAddConfirm.addEventListener('click', function() {
    const employeeId = document.getElementById('add-employeeId').value;
    const name = document.getElementById('add-name').value;
    const email = document.getElementById('add-email').value;
    const role = document.getElementById('add-role').value;
    const password_old = document.getElementById('add-password').value;

    if(!employeeId || !name || !email || !role || !password_old) {
        addErrorMessage.style.display = 'block'
        addErrorMessage.innerHTML = 'Please provide full information'
        return
    }

    hashMultipleTimes(password_old, 10).then(password => {
        addEmployee(employeeId, name, email, role, password)
    });
});

btnDeleteConfirm.addEventListener('click', function() {
    const id = this.dataset.id
    deleteEmployee(id)
});

btnEditConfirm.addEventListener('click', function() {
    const id = this.dataset.id
    const employeeId = document.getElementById('edit-employeeId').value;
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    const role = document.getElementById('edit-role').value;

    if(!employeeId || !name || !email || !role) {
        editErrorMessage.style.display = 'block'
        editErrorMessage.innerHTML = 'Please provide full information'
        return
    }

    editEmployee(id, employeeId, name, email, role)
});

btnChangePasswordConfirm.addEventListener('click', function() {
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;

    if(!oldPassword) {
        changePWErrorMessage.style.display = 'block'
        changePWErrorMessage.innerHTML = 'enter your password'
        return
    }
    if(!newPassword) {
        changePWErrorMessage.style.display = 'block'
        changePWErrorMessage.innerHTML = 'enter new password'
        return
    }

    hashMultipleTimes(oldPassword, 10).then(hashOldPassword => {
        hashMultipleTimes(newPassword, 10).then(hashNewPassword => {
            changePassword(hashOldPassword, hashNewPassword)
        });
    });
});

function addEmployee(employeeId, name, email, role, password) {
    const url = '/waiter-manager/employees/add?token=' + token
    const data = {
        employeeId, name, email, role, password
      };
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                addEmployeeModal.style.display = 'none'
                getListEmployee()
            }
            else {
                addErrorMessage.style.display = 'block'
                addErrorMessage.innerHTML = json.message
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        }); 
}

function deleteEmployee(id) {
    const url = '/waiter-manager/employees/delete?id=' + id + '&token=' + token
      fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                deleteEmployeeModal.style.display = 'none'
                getListEmployee()
            }
            else {
                deleteErrorMessage.style.display = 'block'
                deleteErrorMessage.innerHTML = json.message
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        }); 
}

function editEmployee(id, employeeId, name, email, role) {
    const url = '/waiter-manager/employees/edit?id=' + id + '&token=' + token
    const data = {
        employeeId, name, email, role
      };
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                editEmployeeModal.style.display = 'none'
                getListEmployee()
            }
            else {
                editErrorMessage.style.display = 'block'
                editErrorMessage.innerHTML = json.message
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        }); 
}

function changePassword(oldPassword, newPassword) {

    const url = '/waiter-manager/change-password?id=' + id + '&token=' + token
    const data = {
        oldPassword, newPassword
      };
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                changePWErrorMessage.style.display = 'none'
                document.getElementById('old-password').value = ''
                document.getElementById('new-password').value = ''
                changePasswordModal.style.display = 'none'
            }
            else {
                changePWErrorMessage.style.display = 'block'
                changePWErrorMessage.innerHTML = json.message
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        }); 
}

async function sha256(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function hashMultipleTimes(str, times) {
    let hash = str;
    for (let i = 0; i < times; i++) {
        hash = await sha256(hash);
    }
    return hash;
}