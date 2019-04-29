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
    const table_name = "BattingScorecard"
    observerColumns = tableInfo.getInfosObservable(con, table_name)
    observerColumns.subscribe(
        v => { 
            console.log("Query Successful")
            res.render("admin/battingScorecard/battingScorecardInsert",
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
    const match_id =req.body.match_id
    const player_id = req.body.player_id
    const batting_position = req.body.batting_position
    const team_position = req.body.team_position
    const runs_scored = req.body.runs_scored
    const balls_faced = req.body.balls_faced
    const out_notout = req.body.out_notout
    const out_by = req.body.out_by
    const out_type = getQuote(req.body.out_type)
    const out_by1 = req.body.out_by1
    const fours = req.body.fours
    const sixes = req.body.sixes
    const fall_of_wicket_overs_done = req.body.fall_of_wicket_overs_done
    const fall_of_wicket_ball_no = req.body.fall_of_wicket_ball_no
    const fall_of_wicket_score = req.body.fall_of_wicket_score

    console.log("Information to be Inserted: ")
    console.log("batting scorecard")
    const sql_query = "INSERT INTO BattingScorecard("
                    + "match_id, player_id, batting_position, team_position, runs_scored," 
                    + "balls_faced, out_notout, out_by, out_type, out_by1, fours, sixes,"
                    + "fall_of_wicket_overs_done, fall_of_wicket_ball_no, fall_of_wicket_score"
                    + "Values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    console.log(sql_query) 
    con.query(sql_query, [match_id, player_id, batting_position, team_position,
                        runs_scored, balls_faced, out_notout, out_by, 
                        out_type, out_by1, fours, sixes, fall_of_wicket_overs_done, 
                        fall_of_wicket_ball_no, fall_of_wicket_score], 
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
