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
  const url = '/customer/login'
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
        var url = customerForm.action;
        url = url + '?token=' + json.token
        customerForm.action = url
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
  const password_old = document.getElementById('chefPassword').value;

  hashMultipleTimes(password_old, 10).then(password => {
    loginChef(email, password)
  });

});

function loginChef(email, password) {
  const url = '/chef/login'
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
        document.getElementById('chefPassword').value = password
        var url = chefForm.action;
        url = url + '?token=' + json.token
        chefForm.action = url
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
  const password_old = document.getElementById('waiterPassword').value;

  hashMultipleTimes(password_old, 10).then(password => {
    loginWaiter(email, password)
  });

});

function loginWaiter(email, password) {
  const url = '/waiter-manager/login'
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
        document.getElementById('waiterPassword').value = password
        var url = waiterForm.action;
        url = url + '?token=' + json.token
        waiterForm.action = url
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