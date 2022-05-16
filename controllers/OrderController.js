const con = require('../db/connection')

exports.getUserOrderNumbers = (facebookName) => {
    return new Promise((resolve, reject) => {
        con.query(`select order_number, created_at from order_lists where facebook_name = "${facebookName}" group by order_number`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getOrdersByOrderNumber = (orderNumber, facebookName) => {
    return new Promise((resolve, reject) => {
        con.query(`select * from order_lists where order_number = "${orderNumber}" and facebook_name = "${facebookName}"`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getRecentOrderStatus = (orderId) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM order_statuses where order_id = ${orderId} ORDER BY id DESC`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getOrderDetailByOrderId = (orderId, facebookName) => {
    return new Promise((resolve, reject) => {
        con.query(`select * from order_lists where id = "${orderId}" and facebook_name = "${facebookName}"`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getOrdersByActivitiesOrderId = (orderId) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM order_tracks where order_id = ${orderId} GROUP BY status ORDER BY created_at ASC `, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getProductImageByProductCode = (productCode) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM product_images where product_code = "${productCode}"`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getRecentTracking = (orderId) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM order_tracks where order_id = ${orderId} ORDER BY id DESC `, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getProductOneImageByProductCode = (productCode) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM product_images where product_code = "${productCode}" ORDER BY id ASC LIMIT 1`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getOrderById = (orderId) => {
    return new Promise((resolve, reject) => {
        con.query(`select * from order_lists where id = "${orderId}"`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}