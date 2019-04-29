const serverName = "localhost"
const username = "root"
const password = "dbms"
const database  = "cricket"

const express = require("express")
const mysql = require("mysql")
// app.use(express.static(__dirname + 'public'))
const players = require("./players")   //Relative Path
const authority = require("./authority")   //Relative Path
const battingScorecard = require("./battingScorecard")
const bowlingScorecard = require("./bowlingScorecard")
const countries = require("./countries")
const extras = require("./extras")
const matches = require("./matches")
const matchPlayerTeam = require("./matchPlayerTeam")
const stadiums = require("./stadiums")
const series = require("./series")
const seriesTypes = require("./seriesTypes")
const tableInfo = require("./tableInfo")
const teams = require("./teams")
const umpires = require("./umpires")

//RxJs Observable
const { Observable } = require("rxjs/Observable")
// require("rx-jquery/")
const { zip } = require("rxjs/observable/zip")

const con = mysql.createConnection({
    host:serverName,
    user:username,
    password:password,
    database:database
})

const getTableQuery = "SELECT table_name FROM information_schema.tables "+
                        "where table_schema = 'cricket' and table_type = 'BASE TABLE' ORDER BY table_name"
const getViewQuery = "SELECT table_name FROM information_schema.tables "+
                    "where table_schema = 'cricket' and table_type = 'VIEW' ORDER BY table_name"

function init(req, res){
    observerTableQuery = Observable.create(subscriber => {
        con.query(getTableQuery, (err, results, fields)=>{
            if(err){
                subscriber.error(err)
            }else{
                subscriber.next({results: results, fields: fields})
            }
            subscriber.complete()
        })
    }) 

    observerViewQuery = Observable.create(subscriber => {
        con.query(getViewQuery, (err, results, fields)=>{
            if(err){
                subscriber.error(err)
            }else{
                subscriber.next({results: results, fields: fields})
            }
            subscriber.complete()
        })
    })

    zip(observerTableQuery, observerViewQuery, (t1, t2)=>{
        return {tables: t1, views: t2}
    }).subscribe(
        (data)=>{
            console.log(data.tables.results)
            res.render("admin/root", {tables:data.tables.results, views: data.views.results})
        },
        (err) => {
            throw err
        },
        ()=>{}
    )
}

function getTableInfo(req, res){
    const table_name = req.params.table_name
    observerColumns = tableInfo.getInfosObservable(con, table_name)
    observerColumns.subscribe(
        v => { 
            console.log("Query Successful")
            res.render("admin/tableInfo", {infos: v})
        },
        e => { 
            console.log("Root.js: Error Occured")
            console.log(e) 
        },
        () => { console.log('complete') }
    );
}
 
function getAuthorityBlock(req, res){
    console.log("Calling authority.js")
    authority.getBlock(req, res)
}

function getBattingScorecardBlock(req, res){
    console.log("calling battingScorecard.js")
    battingScorecard.getBlock(req, res)
}

function getBowlingScorecard(req, res){
    console.log("calling bowlingScorecard.js")
    bowlingScorecard.getBlock(req, res)
}

function getSeriesTypesBlock(req, res){
    seriesTypes.getBlock(req, res)
}

function getCountriesBlock(req, res){
    console.log("Calling Coutries.js")
    countries.getBlock(req, res)
}

function getExtrasBlock(req, res){
    extras.getBlock(req,res)
}

function getMatchesBlock(req, res){
    matches.getBlock(req, res)
}

function getMatchPlayerTeamBlock(req, res){
    matchPlayerTeam.getBlock(req, res)
}

function getPlayersBlock(req, res){
    console.log("Calling players.js")
    players.getBlock(req, res)
}

function getPlayersSuggestion(req, res){
    players.getSuggestions(req, res)
}

function getSeriesBlock(req, res){
    series.getBlock(req, res)
}

function getStadiumsBlock(req, res){
    console.log("Calling stadium.js")
    stadiums.getBlock(req, res)
}

function getStadiumsSuggestion(req, res){
    stadiums.getSuggestions(req, res)
}

function getTeamsBlock(req, res){
    teams.getBlock(req, res)
}

function getUmpiresBlock(req, res){
    umpires.getBlock(req, res)
}

function insertIntoAuthority(req, res){
    authorityName = req.body.authority
    const sql_query = "INSERT INTO Authority Values('" + authorityName + 
                        "')"
    console.log(sql_query)
    con.query(sql_query, (err, results, fields) => {
        if(err) {
            res.send(err)
            throw err
        }
        console.log("root.js:InsertIntoAuthority: Data Inserted")
        res.send("success")
    })
}

function insertIntoUmpires(req, res){
    umpireName = req.body.umpire_name
    const sql_query = "INSERT INTO Umpires(umpire_name) Values('" + umpireName + 
                        "')"
    console.log(sql_query)
    con.query(sql_query, (err, results, fields)=>{
        if(err){
            res.send("Error")
            throw err
        }
        console.log("root.js: InsertIntoUmpires: Data inserted")
        res.send("success")
    })
}

function insertIntoCountries(req, res){
    const countryName = req.body.country_name
    const sql_query = "INSERT INTO Countries(country_name) Values('" + countryName + 
                        "')"

    console.log(sql_query)
    con.query(sql_query, (err, results, fields) => {
        if(err){
            res.send("Error")
            throw err
        }
        console.log("root.js: InsertIntoCounries: Data Inserted")
        res.send("Success")
    })
}

function insertIntoSeriesTypes(req, res){
    const seriesType = req.body.series_type
    const sql_query = "TNSERT INTO SeriesTypes(series_type) Values('" + seriesType + 
                        "')"
    console.log(sql_query)
    con.query(sql_query, (err, results, fields) => {
        if(err){
            res.send("Error")
            throw err
        }
        console.log("root.js: InsertIntoSeriesTypes: Data Inserted")
        res.send("Successs")
    })
}

function insertIntoPlayers(req, res){
    console.log("Calling players.js")
    players.insertIntoTable(req, res)
}

function insertIntoStadiums(req, res){
    console.log("Calling stadiums.js")
    stadiums.insertIntoTable(req, res)
}

module.exports.init = init
module.exports.getTableInfo = getTableInfo
module.exports.getAuthorityBlock = getAuthorityBlock
module.exports.getBattingScorecardBlock = getBattingScorecardBlock
module.exports.getBowlingScorecard = getBowlingScorecard
module.exports.getExtrasBlock = getExtrasBlock
module.exports.getUmpiresBlock = getUmpiresBlock
module.exports.getCountriesBlock = getCountriesBlock
module.exports.getMatchesBlock = getMatchesBlock
module.exports.getMatchPlayerTeamBlock = getMatchPlayerTeamBlock
module.exports.getSeriesTypesBlock = getSeriesTypesBlock
module.exports.getPlayersBlock = getPlayersBlock
module.exports.getPlayersSuggestion = getPlayersSuggestion
module.exports.getSeriesBlock = getSeriesBlock
module.exports.getStadiumsBlock = getStadiumsBlock
module.exports.getStadiumsSuggestion = getStadiumsSuggestion
module.exports.getTeamsBlock = getTeamsBlock
module.exports.insertIntoAuthority = insertIntoAuthority
module.exports.insertIntoUmpires = insertIntoUmpires
module.exports.insertIntoCountries = insertIntoCountries
module.exports.insertIntoSeriesTypes = insertIntoSeriesTypes
module.exports.insertIntoPlayers = insertIntoPlayers