const customerDataDiv = document.getElementById('customerData');
const customer = customerDataDiv.getAttribute('data-customer');
const table_code = customerDataDiv.getAttribute('data-table_code');
const orderId = customerDataDiv.getAttribute('data-orderId');

getListFoodOrdered(customer, table_code)

getFoodByCategory('main food')

titleFood = document.getElementById('title-food')

function displayItems(listItems) {

    let items = document.querySelector('.items');
    items.innerHTML = '';

    listItems.forEach(item => {
        const itemHTML = `
                        <div class="item">
                            <div>
                                <img src="/Image/Foods/${item.url_image}" alt="">
                            </div>
                            <h3>${item.name}</h3>
                            <div class="price">$${item.price.toFixed(2)}</div>
                            <div class="btn">
                                ${item.status ? `<button data-id="${item._id}" class="btnMinus">-</button>
                                                  <button data-id="${item._id}" class="btnAdd">+</button>`
                : `<p>Out of stock</p>`}
                            </div>
                        </div>
                    `
        items.innerHTML += itemHTML;
    });

    addClickEvents()
}

document.getElementById('btnMainFood').addEventListener('click', function () {
    getFoodByCategory('main food')
});
document.getElementById('btnDrinks').addEventListener('click', function () {
    getFoodByCategory('drinks')
})
document.getElementById('btnExtraFood').addEventListener('click', function () {
    getFoodByCategory('extra food')
})

// thêm 1 hàng mới vào bảng thức ăn đang chọn
function addToSelectingTable(itemId, itemName, itemPrice) {
    // Kiểm tra xem mặt hàng đã tồn tại trong bảng chưa
    const existingRow = document.querySelector(`#selecting tbody tr[data-id="${itemId}"]`);

    if (existingRow) {
        // Nếu mặt hàng đã tồn tại, tăng số lượng lên 1 và cập nhật tổng giá
        const quantityCell = existingRow.querySelector('.quantity');
        const priceCell = existingRow.querySelector('.price');

        let quantity = parseInt(quantityCell.textContent);
        let totalPrice = parseFloat(priceCell.textContent.slice(1)); // Loại bỏ ký tự '$' và chuyển đổi thành số

        quantity++;
        totalPrice += itemPrice;

        quantityCell.textContent = quantity;
        priceCell.textContent = `$${totalPrice.toFixed(2)}`; // Làm tròn tổng giá đến 2 chữ số thập phân
    } else {
        // Nếu mặt hàng chưa tồn tại, thêm một dòng mới vào bảng
        const selectingTableBody = document.querySelector('#selecting tbody');
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-id', itemId);

        newRow.innerHTML = `
                    <td>${itemName}</td>
                    <td class="quantity">1</td>
                    <td class="price">$${itemPrice.toFixed(2)}</td>
                    <td class="note"><input style="width: 100%;" type="text"></td>
                `;

        selectingTableBody.appendChild(newRow);
    }
}

// thêm sự kiện cho các button sau khi hiển thị dữ liệu
function addClickEvents() {
    const btnMinusList = document.querySelectorAll('.btnMinus');
    const btnAddList = document.querySelectorAll('.btnAdd');

    btnMinusList.forEach(btnMinus => {
        btnMinus.addEventListener('click', function () {
            const itemId = this.getAttribute('data-id').toString();
            const itemName = listFood.find(item => item._id === itemId).name;
            const itemPrice = listFood.find(item => item._id === itemId).price;

            const quantityCell = document.querySelector(`#selecting tbody tr[data-id="${itemId}"] .quantity`);

            // nếu hàng ko tồn tại
            if (!quantityCell) {
                return
            }

            let quantity = parseInt(quantityCell.textContent);

            if (quantity > 1) { // giảm 1 nếu > 1
                quantity--;
                quantityCell.textContent = quantity;

                const priceCell = document.querySelector(`#selecting tbody tr[data-id="${itemId}"] .price`);
                let totalPrice = parseFloat(priceCell.textContent.slice(1));
                totalPrice -= itemPrice;
                priceCell.textContent = `$${totalPrice.toFixed(2)}`;
            } else { // nếu chỉ còn 1 thì xóa khỏi bảng
                const rowToRemove = document.querySelector(`#selecting tbody tr[data-id="${itemId}"]`);
                rowToRemove.parentNode.removeChild(rowToRemove);
            }
        });
    });

    btnAddList.forEach(btnAdd => {
        btnAdd.addEventListener('click', function () {
            const itemId = this.getAttribute('data-id').toString();
            const itemName = listFood.find(item => item._id === itemId).name;
            const itemPrice = listFood.find(item => item._id === itemId).price;

            addToSelectingTable(itemId, itemName, itemPrice);
        });
    });
}

document.getElementById('order').addEventListener('click', function () {
    const selectingRows = document.querySelectorAll('#selecting tbody tr');

    if (selectingRows.length <= 0) {
        alert('Please choose your foods')
        return
    }

    document.getElementById('confirmModal').style.display = 'block'
});

document.getElementById('btnConfirm').addEventListener('click', function () {
    document.getElementById('confirmModal').style.display = 'none'
    orderFood()
});


function orderFood() {
    const selectingRows = document.querySelectorAll('#selecting tbody tr');
    let listFoods = [];

    selectingRows.forEach(row => {
        const itemName = row.querySelector('td:first-child').textContent;
        const quantity = parseInt(row.querySelector('.quantity').textContent);
        const totalPrice = parseFloat(row.querySelector('.price').textContent.slice(1));
        const note = row.querySelector('.note input').value;

        listFoods.push({
            name: itemName,
            quantity: quantity,
            totalPrice: totalPrice,
            note: note
        });
    });

    const data = {
        orderId: orderId,
        listFoods: listFoods
    };

    fetch('http://localhost:8888/customer/add-food', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => response.json())
        .then(json => {
            if (json.code == 0) {
                getListFoodOrdered(json.order.customer, json.order.table_code)
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function getListFoodOrdered(customer, table_code) {
    const url = 'http://localhost:8888/customer/order?customer=' + customer + '&table_code=' + table_code
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            if (json.code == 0) {
                if (json.listFood.length == 0) {
                    return;
                }
                orderedFood(json.order, json.listFood)
            }
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}

function orderedFood(order, listFood) {

    const orderedTableBody = document.querySelector('#ordered tbody');
    orderedTableBody.innerHTML = ''

    listFood.forEach(food => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
                        <td>${food.name}</td>
                        <td>${food.quantity}</td>
                        <td>$${food.totalPrice.toFixed(2)}</td>
                        <td>${food.note ?? ''}</td>
                        <td>${food.status ? '<i class="completed-icon fas fa-check-circle"></i>' : '<i class="waiting-icon fas fa-clock"></i>'}</td>
                    `;
        orderedTableBody.appendChild(newRow);
    });

    const selectingTableBody = document.querySelector('#selecting tbody');
    selectingTableBody.innerHTML = '';

    document.getElementById('totalPrice').innerHTML = `total price: <strong>$${order.total_price.toFixed(2)}</strong>`;
}

function getFoodByCategory(category) {
    const url = 'http://localhost:8888/customer/food?category=' + category
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(json => {
            titleFood.innerHTML = category
            listFood = json.data
            displayItems(json.data)
        })
        .catch(error => {
            console.error('There was a problem with your fetch operation:', error);
        });
}
