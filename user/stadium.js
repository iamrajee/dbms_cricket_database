const serverName = "localhost"
const username = "root"
const password = "dbms"
const database  = "cricket"

const express = require("express")
const mysql = require("mysql")
const fs = require('fs');
const { Observable } = require("rxjs/Observable")
const { zip } = require("rxjs/observable/zip")
const { map } = require("rxjs/operators/map")
const { mergeMap } = require("rxjs/operators/mergeMap")

con = mysql.createConnection({
    host:serverName,
    user:username,
    password:password,
    database:database
})

function getStadiumObs(stadiumId){
    const sql_query = fs.readFileSync("queries/stadiumDetailQuery.sql", 'utf-8')
    return Observable.create(subscriber => {
        con.query(sql_query,
             [stadiumId, stadiumId, 
            stadiumId, stadiumId, stadiumId], 
            (err, results, fields)=>{
                if(err) subscriber.error(err)
                else{
                    subscriber.next(results)
                }
                subscriber.complete()
        })
    })
}

function init(req, res, stadiumId){
    getStadiumObs(stadiumId)
    .subscribe(
        (data)=>{
            console.log(data)
            res.render("user/stadiumDetail", {Stadium: data})
        }, 
        (err)=>{
            res.send("Error")
            throw err
        },
        ()=>{}
    )
}

module.exports.init = init