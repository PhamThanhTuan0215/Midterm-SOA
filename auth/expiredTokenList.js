const expiredTokenList = [];

function addToExpiredList(token) {
    expiredTokenList.push(token);
}

function isTokenExpired(token) {
    return expiredTokenList.includes(token);
}

module.exports = { addToExpiredList, isTokenExpired };