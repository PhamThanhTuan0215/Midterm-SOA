const chefModal = document.getElementById('chefModal');
const waiterModal = document.getElementById('waiterModal');
const customerModal = document.getElementById('customerModal');

const chefButton = document.getElementById('chefButton');
const waiterButton = document.getElementById('waiterButton');
const customerButton = document.getElementById('customerButton');

const closeChefModal = document.getElementById('closeChefModal');
const closeWaiterModal = document.getElementById('closeWaiterModal');
const closeCustomerModal = document.getElementById('closeCustomerModal');

chefButton.onclick = function () {
  chefModal.style.display = 'block';
}

waiterButton.onclick = function () {
  waiterModal.style.display = 'block';
}

customerButton.onclick = function () {
  customerModal.style.display = 'block';
}

closeChefModal.onclick = function () {
  chefModal.style.display = 'none';
}

closeWaiterModal.onclick = function () {
  waiterModal.style.display = 'none';
}

closeCustomerModal.onclick = function () {
  customerModal.style.display = 'none';
}

//customer
const customerForm = document.getElementById('customerForm');
const errMessageCustomer = document.getElementById('errMessageCustomer');

customerForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const customer = document.getElementById('customerName').value;
  const table_code = document.getElementById('tableCode').value;

  loginCustomer(customer, table_code)

});

function loginCustomer(customer, table_code) {
  const url = 'http://localhost:8888/customer/login'
  const data = {
    customer: customer,
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
        errMessageCustomer.style.display = 'none'
        customerForm.submit();
      }
      else {
        errMessageCustomer.innerHTML = json.message
        errMessageCustomer.style.display = 'block'
      }
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
    });
}

//chef
const chefForm = document.getElementById('chefForm');
const errMessageChef = document.getElementById('errMessageChef');

chefForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('chefEmail').value;
  const password = document.getElementById('chefPassword').value;

  loginChef(email, password)

});

function loginChef(email, password) {
  const url = 'http://localhost:8888/chef/login'
  const data = {
    email: email,
    password: password
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
        errMessageChef.style.display = 'none'
        chefForm.submit();
      }
      else {
        errMessageChef.innerHTML = json.message
        errMessageChef.style.display = 'block'
      }
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
    });
}

//waiter and manager
const waiterForm = document.getElementById('waiterForm');
const errMessageWaiter = document.getElementById('errMessageWaiter');

waiterForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('waiterEmail').value;
  const password = document.getElementById('waiterPassword').value;

  loginWaiter(email, password)

});

function loginWaiter(email, password) {
  const url = 'http://localhost:8888/waiter-manager/login'
  const data = {
    email: email,
    password: password
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
        errMessageWaiter.style.display = 'none'
        waiterForm.submit();
      }
      else {
        errMessageWaiter.innerHTML = json.message
        errMessageWaiter.style.display = 'block'
      }
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
    });
}