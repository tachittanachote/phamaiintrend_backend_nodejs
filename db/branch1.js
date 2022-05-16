const mysql = require('mysql');

const branch1 = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "phamaiintrend"
});

branch1.connect(function (err) {
    if (err) {
		console.log(err)
	}
    console.log("Branch 1 Connected!");
});

module.exports = branch1