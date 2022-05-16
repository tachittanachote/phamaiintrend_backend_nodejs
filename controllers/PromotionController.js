const con = require('../db/connection')

exports.getPromotions = () => {
    return new Promise((resolve, reject) => {
        con.query(`select * from promotions order by id desc`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}