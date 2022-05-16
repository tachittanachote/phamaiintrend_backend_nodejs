const con = require('../db/connection')

exports.getAllPendingNotify = () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * from notifies`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.addNotify = (order_id, line_id, message, notifyId, type, detail) => {
    return new Promise((resolve, reject) => {
        con.query(`INSERT INTO notifies (order_id, line_id, message, notify_id, type, detail, created_at, updated_at) VALUES(${order_id}, "${line_id}", "${message}", "${notifyId}", "${type}", "${detail}", CURRENT_TIME(), CURRENT_TIME())`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.updateNotifyStatus = (notifyId, status) => {
    return new Promise((resolve, reject) => {
        con.query(`UPDATE notifies SET status = '${status}' WHERE notify_id = '${notifyId}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}

exports.getNotifyByNotifyId = (notifyId) => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * from notifies WHERE notify_id = '${notifyId}'`, function (err, results, fields) {
            if (err) reject(err);
            resolve(results)
        });
    })
}