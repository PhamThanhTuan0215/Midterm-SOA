getListOrder()

function getListOrder() {
    const url = 'http://localhost:8888/chef/orders'
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                displayListOrder(json.listOrder)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

function displayListOrder(listOrder) {
    const listOrderTableBody = document.querySelector('#list-order tbody');
    listOrderTableBody.innerHTML = ''

    listOrder.forEach(order => {
        if(order.total_price !== 0) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                            <td>${order.customer}</td>
                            <td>${order.table_code}</td>
                            <td>${order.status_completed ? 'Completed' : 'Not yet'}</td>
                            <td class="${order.status_check ? 'checked' : 'new'}">${order.status_check ? 'Checked' : 'New'}</td>
                            <td>
                                <Button data-orderId="${order._id}" class="view-detail">View</Button>
                            </td>
                        `;
            listOrderTableBody.appendChild(newRow);
        }
    });

    addClickEventsForViewBtn()
}

function addClickEventsForViewBtn() {
    const viewButtons = document.querySelectorAll('.view-detail');

    viewButtons.forEach(button => {
        button.addEventListener('click', function () {
            const orderId = button.getAttribute('data-orderId');
            getDetailOrder(orderId)

            const parentRow = button.closest('tr');
            const statusCheckCell = parentRow.querySelector('td:nth-child(4)');
            statusCheckCell.textContent = 'Checked';
            statusCheckCell.style.color = 'black';
        });
    });
}

function getDetailOrder(orderId) {
    const url = 'http://localhost:8888/chef/detail-order?orderId=' + orderId
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                displayDetailOrder(json.order, json.listFood)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

function displayDetailOrder(order, listFood) {
    const detailtOrderTableBody = document.querySelector('#detail-order tbody');
    detailtOrderTableBody.innerHTML = ''

    listFood.forEach(food => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
                        <td>${food.name}</td>
                        <td>${food.quantity}</td>
                        <td>${food.note ?? ''}</td>
                        <td>${food.status ? '<i class="completed-icon fas fa-check-circle"></i>' : '<i class="waiting-icon fas fa-clock"></i>'}</td>
                    `;
        detailtOrderTableBody.appendChild(newRow);
    });

    const informationOrder = document.querySelector('#information-order');
    informationOrder.innerHTML = ''
    informationOrder.innerHTML = `
        <div>
            <p>Customer: <strong>${order.customer}</strong></p>
            <p>Table Code: <strong>${order.table_code}</strong></p>
            <p>Status: <strong>${order.status_completed ? 'Completed' : 'Not yet'}</strong></p>
        </div>

        <button id="btnComplete" data-orderId="${order._id}">Complete</button>
        </div>
    `

    if(!order.status_completed) {
        document.getElementById('btnComplete').addEventListener('click', function () {
            const orderId = this.dataset.orderid;
            completeOrder(orderId)
        });
    }
    else {
        document.getElementById('btnComplete').style.display = 'none'
    }
}

document.getElementById('btnManageFoods').addEventListener('click', function () {
    const url = 'http://localhost:8888/chef/food-management'
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                displayFoodsInventory(json.listFood)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
});

const inventoryModal = document.getElementById('inventoryModal');

function displayFoodsInventory(listFood) {
    inventoryModal.style.display = 'block';

    const inventoryTableBody = document.querySelector('#inventoryModal tbody');
    inventoryTableBody.innerHTML = ''

    listFood.forEach(food => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
                        <td><img src="/Image/Foods/${food.url_image}" alt=""></td>
                        <td>${food.name}</td>
                        <td>${food.category}</td>
                        <td>${food.status ? 'In stock' : 'Out of stock'}</td>
                        <td><button data-foodName="${food.name}" class="${food.status ? 'btnOn' : 'btnOff'}">${food.status ? 'On' : 'Off'}</button></td>
                    </tr>
                    `;
        inventoryTableBody.appendChild(newRow);
    });

    addClickEventsForOnOffBtn()
}

function addClickEventsForOnOffBtn() {
    const buttons = document.querySelectorAll('.btnOn, .btnOff');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            const foodName = button.getAttribute('data-foodName');
            const newState = button.textContent === 'On' ? 'Off' : 'On';
            toggleButtonState(button, newState);
            setFoodStatus(foodName, newState === 'On');
            
            const parentRow = button.closest('tr');
            const warehouseStatusCell = parentRow.querySelector('td:nth-child(4)');
            warehouseStatusCell.textContent = (newState === 'On' ? 'In stock' : 'Out of stock');

            // gửi event tới giao diện customer để cập nhật trạng thái danh sách món ăn
        });
    });
}

function toggleButtonState(button, newState) {
    if (newState === 'On') {
        button.textContent = 'On';
        button.classList.remove('btnOff');
        button.classList.add('btnOn');
    } else {
        button.textContent = 'Off';
        button.classList.remove('btnOn');
        button.classList.add('btnOff');
    }
}

function setFoodStatus(name, status) {
    const url = 'http://localhost:8888/chef/set-status-food?name=' + name + '&status=' + status
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                return true
            }
            else {
                console.log(json)
                return false
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

function completeOrder(orderId) {
    const url = 'http://localhost:8888/chef/completed-order?orderId=' + orderId
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                getDetailOrder(orderId)
                getListOrder()
            }
            else {
                console.log(json)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

const changePasswordModal = document.getElementById('changePasswordModal');
const closeChangePasswordModal = document.getElementById('closeChangePasswordModal');
const btnChangePasswordConfirm = document.getElementById('btnChangePasswordConfirm');
const changePWErrorMessage = document.getElementById('change-password-error-message');
const toggleOldPassword = document.getElementById('toggleOldPassword');
const toggleNewPassword = document.getElementById('toggleNewPassword');
const oldPasswordInput = document.getElementById('old-password');
const newPasswordInput = document.getElementById('new-password');

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

closeChangePasswordModal.addEventListener('click', function() {
    changePasswordModal.style.display = 'none';
});

btnChangePassword.addEventListener('click', function() {
    changePasswordModal.style.display = 'block';
});

btnChangePasswordConfirm.addEventListener('click', function() {
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;

    hashMultipleTimes(oldPassword, 10).then(hashOldPassword => {
        hashMultipleTimes(newPassword, 10).then(hashNewPassword => {
            changePassword(hashOldPassword, hashNewPassword)
        });
    });
});

function changePassword(oldPassword, newPassword) {

    const url = 'http://localhost:8888/chef/change-password?id=' + '660942e963278e5b966308d3'
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