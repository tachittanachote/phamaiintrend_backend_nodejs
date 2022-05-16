const con = require('../db/connection')

exports.getTrackingByCustomerName = (customerName) => {
    return new Promise((resolve, reject) => {
        con.query(`select * from deliveries where customer_name = "${customerName}" order by id desc`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}