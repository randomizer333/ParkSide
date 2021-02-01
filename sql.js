var mysql = require('mysql');

conection()
function conection() {
    var con = mysql.createConnection({
        host: "localhost",
        user: "yourusername",
        password: "yourpassword"
    });

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
    });
}