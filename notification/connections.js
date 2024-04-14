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

function pushCustomerConnection(res) {
    customer_connections.push(res);
}

function removeChefConnection(res) {
    chef_connections = chef_connections.filter(conn => conn !== res);
}

function removeCustomerConnection(res) {
    customer_connections = customer_connections.filter(conn => conn !== res);
}

module.exports = {
    getChefConnections,
    getCustomerConnections,
    pushChefConnection,
    pushCustomerConnection,
    removeChefConnection,
    removeCustomerConnection
};