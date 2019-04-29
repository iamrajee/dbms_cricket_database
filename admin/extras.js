const servername = "localhost"
const username = "root"
const passsword = "dbms"
const database = "cricket"

const express = require("express")
const mysql = require("mysql")
const tableInfo = require("./tableInfo")
const { Observable } = require("rxjs/Observable")
const { zip } = require("rxjs/observable/zip")

const con = mysql.createConnection({
    host: servername,
    user: username,
    password: passsword,
    database: database
})

function getQuote(s){
    return "'"+s+"'"
}

function getObservable(sqlQuery) {
    return Observable.create(observer=>{
        con.query(sqlQuery, (err, results, fields) => {
            if (err){
                observer.error(err)
            }else{
                observer.next({results:results, fields: fields})
            }
            observer.complete()
        })
    })
}

function getBlock(req, res){
    const table_name = "Extras"
    observerColumns = tableInfo.getInfosObservable(con, table_name)
    observerColumns.subscribe(
        v => { 
            console.log("Query Successful")
            res.render("admin/extras/extrasInsert",
            (err, html)=>{
            if(err) throw err
                console.log("form rendered, rendering Pan")
                res.render("admin/rightPan", {table_name: table_name, infos: v, insertionForm: html})
            })
        },
        e => { 
            console.log("Root.js: Error Occured")
            throw err 
        },
        () => { console.log('completed') }
    );
}

function insertIntoTable(req, res){
    const team_position =req.body.team_position
    const no_balls = req.body.no_balls
    const wide = req.body.wide
    const leg_byes = req.body.leg_byes
    const byes = req.body.byes
    console.log("Information to be Inserted: ")
    console.log(series_name, series_type, num_of_teams, starting_date, end_date, format, authority)
    const sql_query = "INSERT INTO Extras(team_position, no_balls, wide" + 
                    "leg_byes, byes) "
                    +"Values(?, ?, ?, ?, ?)"
    console.log(sql_query) 
    con.query(sql_query, [team_position, no_balls, wide, leg_byes, byes], 
        (err, results, fields)=>{
            if(err){
                res.send("Error")
                throw err
            } 
            else res.send("Success")
        })
}

function getSuggestions(req, res){
    playerName = req.body.player_name
    role = req.body.role
    dob = req.body.dob
    batting_style = req.body.batting_style
    bowling_style = req.body.bowling_style

    console.log(playerName, role, dob, batting_style, bowling_style)

    const sql_query = "SELECT * FROM Players WHERE "+
                        "player_name LIKE '" + playerName + "%'" + 
                        " AND  role = '" + role + "'" + 
                        " AND dob LIKE '" + dob + "%'" +
                        " AND batting_style = '" + batting_style  + "'" +
                        " AND bowling_style = '" + bowling_style  + "'" +
                        " ORDER BY player_name ASC"

    console.log(sql_query)
    con.query(sql_query, (err, results, fields) => {
        if(err) throw err
        console.log(results)
        console.log("Rendering Suggestions")
        res.render("admin/players/playersSuggestion", {suggestionList: (results)})
    })
}

module.exports.getBlock = getBlock
module.exports.insertIntoTable = insertIntoTable
module.exports.getSuggestions = getSuggestions
