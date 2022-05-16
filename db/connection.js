const mysql = require('mysql')

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'intrend_track'
});

con.connect(function (err) {
    if (err) {
		console.log(err)
		return;
	}
    console.log("Connected!");
});

module.exports = con