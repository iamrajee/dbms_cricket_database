const servername = "localhost"
const username = "root"
const passsword = "dbms"
const database = "cricket"

const express = require("express")
const mysql = require("mysql")
const tableInfo = require("./tableInfo")
const { Observable } = require("rxjs/Observable")

const con = mysql.createConnection({
    host: servername,
    user: username,
    password: passsword,
    database: database
})

function getBlock(req, res){
    const table_name = "Stadiums"
    observerColumns = tableInfo.getInfosObservable(con, table_name)
    observerColumns.subscribe(
        v =>{
            console.log("Query Successful")
            res.render("admin/stadiums/stadiumsInsert", 
            (err, html) =>{
                if(err) throw err
                console.log("Form Rendered, Rendering Pan")
                res.render("admin/rightPan", {table_name:table_name,
                        infos: v, insertionForm: html})
            })
        },
        e => {
            console.log("Root.js: Error Occured")
            throw e
        },
        () => {console.log("Completed")}
    )
}

function insertIntoTable(req, res){
    const stadium_name = req.body.stadium_name
    const country = req.body.country
    const capacity = req.body.capacity

    console.log("Information to be Inserted")
    console.log(stadium_name, country, capacity)

    const sql_query = "INSERT INTO Stadiums(stadium_name,"
                    + "country, capacity) Values("
                    + "'"+stadium_name+"',"+"'"+country+"',"
                    + capacity +")"
    console.log(sql_query)
    con.query(sql_query, (err, results, fields) => {
        if(err){
            res.send("Error")
            throw err
        }
        res.send("Success")
    })
}

function getSuggestions(req, res){
    stadium_name = req.body.stadium_name
    country = req.body.country
    capacity = req.body.capacity

    console.log("Creating Suggestion For: ")
    console.log(stadium_name, country, capacity)

    const sql_query = "SELECT * FROM Stadiums WHERE "
                    + "stadium_name LIKE '"+stadium_name + "%'"
                    + "AND country LIKE '"+country + "%'"
                    + "capacity >= "+capacity
                    + "ORDER BY stadium_name ASC"

    console.log(sql_query)

    con.query(sql_query, (err, results, fields) => {
        if(err) throw err
        console.log(results)
        console.log("Rendering Suggestions")
        res.render("admin/stadiums/stadiumsSuggestion",
                 {suggestionList: results})
    })
}

module.exports.getBlock = getBlock
module.exports.insertIntoTable = insertIntoTable
module.exports.getSuggestions = getSuggestions