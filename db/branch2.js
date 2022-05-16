const mysql = require('mysql');

const branch2 = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "phamaiintrend2"
});

branch2.connect(function (err) {
    if (err) {
		console.log(err)
	}
    console.log("Branch 2 Connected!");
});

module.exports = branch2