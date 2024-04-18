let chef_connections = [];
let customer_connections = [];

function getChefConnections() {
    return chef_connections
}

function getCustomerConnections() {
    return customer_connections
}

function pushChefConnection(res) {
    chef_connections.push(res);
}

function sentOrderToChef() {
    chef_connections.forEach(conn => {
        conn.write('event: receive-order\n');
        conn.write(`data: ${JSON.stringify({ message: 'New order received!' })}\n\n`);
    });
}

function pushCustomerConnection(res) {
    customer_connections.push(res);
}

function removeChefConnection(res) {
    chef_connections = chef_connections.filter(conn => conn !== res);
}

function removeCustomerConnection(res) {
    customer_connections = customer_connections.filter(conn => conn !== res);
}

function changeStatusFoodToCustomer() {
    customer_connections.forEach(conn => {
        conn.write('event: change-status-food\n');
        conn.write(`data: ${JSON.stringify({ message: 'Change status food!' })}\n\n`);
    });
}

function completedOrderToCustomer(orderId) {
    customer_connections.forEach(conn => {
        conn.write('event: completed-order\n');
        conn.write(`data: ${JSON.stringify({ message: 'Completed order!', orderId })}\n\n`);
    });
}

function completedPaymentToCustomer(orderId) {
    customer_connections.forEach(conn => {
        conn.write('event: paid-order\n');
        conn.write(`data: ${JSON.stringify({ message: 'Order has been paid!', orderId })}\n\n`);
    });
}

module.exports = {
    getChefConnections,
    getCustomerConnections,
    pushChefConnection,
    sentOrderToChef,
    pushCustomerConnection,
    removeChefConnection,
    removeCustomerConnection,
    changeStatusFoodToCustomer,
    completedOrderToCustomer,
    completedPaymentToCustomer
};