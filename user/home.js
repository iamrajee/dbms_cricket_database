const serverName = "localhost"
const username = "root"
const password = "dbms"
const database  = "cricket"

const express = require("express")
const mysql = require("mysql")

const con = mysql.createConnection({
    host: serverName,
    user: username,
    password: password,
    database: database
})

const query_series = "SELECT * FROM Series"

function init(req, res){
    con.query(query_series, (err, result, fields) => {
        if(err) {
            res.send("Oh Dear! Holy Moly")
            throw err
        }
        // res.send(result)
        res.render("user/home")
    })
}

module.exports.init = init;