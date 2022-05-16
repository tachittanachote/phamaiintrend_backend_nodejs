const con = require('../db/connection')

exports.getUserByFacebookName = (facebookName) => {
    return new Promise((resolve, reject) => {
        con.query(`select * from customers where facebook_name = '${facebookName}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        con.query(`select * from customers where id = '${id}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getUserByLineId = (lineId) => {
    return new Promise((resolve, reject) => {
        con.query(`select * from customers where line_id = '${lineId}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getUserInCustomerList = (userId) => {
    return new Promise((resolve, reject) => {
        con.query(`select * from customers where id = '${userId}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.addUser = (facebookName, realName, address, phoneNumber, lineId) => {
    return new Promise((resolve, reject) => {
        con.query(`INSERT INTO customers (facebook_name, real_name, address, phone_number, line_id, created_at, updated_at) VALUES("${facebookName}", "${realName}", "${address}", '${phoneNumber}', '${lineId}', CURRENT_TIME(), CURRENT_TIME())`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.setUserLineId = (userId, lineId) => {
    return new Promise((resolve, reject) => {
        con.query(`UPDATE customers SET line_id = '${lineId}' WHERE id = '${userId}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.logoutUser = (lineId) => {
    return new Promise((resolve, reject) => {
        con.query(`UPDATE customers SET line_id = null WHERE line_id = '${lineId}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.userUpdate = (lineId, name, address, phoneNumber) => {
    return new Promise((resolve, reject) => {
        con.query(`UPDATE customers SET real_name = "${name}", address = "${address}", phone_number = '${phoneNumber}' WHERE line_id = '${lineId}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.updateUserAddressInOrderList = (facebookName, phoneNumber, address) => {
    return new Promise((resolve, reject) => {
        con.query(`UPDATE order_lists SET address = "${address}", phone_number = '${phoneNumber}' WHERE facebook_name = "${facebookName}"`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.updateCustomerSize = (customerSize) => {
    return new Promise((resolve, reject) => {
        con.query(`UPDATE customer_sizes SET shirt_shirt_size='${customerSize.shirt_shirt_size}', shirt_waist_size='${customerSize.shirt_waist_size}', sarong_waist_size='${customerSize.sarong_waist_size}', sarong_hip_size='${customerSize.sarong_hip_size}', sarong_long_size='${customerSize.sarong_long_size}', customer_name="${customerSize.customer_name}" WHERE customer_id = '${customerSize.customer_id}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getCustomerSizeByCustomerId = (customerId) => {
    return new Promise((resolve, reject) => {
        con.query(`select * from customer_sizes where customer_id = '${customerId}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.addCustomerSize = (customerSize) => {
    return new Promise((resolve, reject) => {
        con.query(`INSERT INTO customer_sizes(customer_id, shirt_shirt_size, shirt_waist_size, sarong_waist_size, sarong_hip_size, sarong_long_size, customer_name, created_at, updated_at) VALUES ('${customerSize.customer_id}', '${customerSize.shirt_shirt_size}', '${customerSize.shirt_waist_size}', '${customerSize.sarong_waist_size}', '${customerSize.sarong_hip_size}', '${customerSize.sarong_long_size}', "${customerSize.customer_name}", CURRENT_TIME(), CURRENT_TIME())`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}