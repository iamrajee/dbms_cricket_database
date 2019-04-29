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

const con = mysql.createConnection({
    host:serverName,
    user:username,
    password:password,
    database:database
})

const outType = {
    caught: "c",
    stumped: "st"
}

var series_query = "Select * from Series WHERE format = 'T20'\
         ORDER BY starting_date DESC"
var country_query = 'SELECT * FROM Countries ORDER BY country_name'
var teams_query = 'SELECT team_id, team_name, authority from Teams ORDER BY team_name'
var dates_query = 'SELECT MIN(starting_date) as strtDate, \
                        MAX(end_date) as endDate from Series \
                        WHERE format = "T20"'


function formatDate(dt){
    var monthNames = [
        "Jan", "Feb", "March",
        "April", "May", "June", "July",
        "Aug", "Sept", "Oct",
        "Nov", "Dec"
        ];
    var day = dt.getDate();
    var monthIndex = dt.getMonth();
    var year = dt.getFullYear();
    return day + " " + monthNames[monthIndex] + " " + year
}

function getCountryQueryObservable(){
    return Observable.create(subscriber => {
        con.query(country_query, (err, results, fields)=>{
            if(err) subscriber.error(err)   
            else subscriber.next({results: results, fields: fields})
            subscriber.complete()
        })
    })
}

function getTeamsQueryObservable(){
    return Observable.create(subscriber => {
        con.query(teams_query, (err, results, fields)=> {
            if(err){
                subscriber.error(err)
            }else{
                subscriber.next({results: results, fields: fields})
            }
            subscriber.complete()
        })
    })
}

function getSeriesQueryObservable(){
    return Observable.create(subscriber => {
        con.query(series_query, (err, results, fields)=> {
            if(err){
                subscriber.error(err)
            }else{
                subscriber.next(results)
            }
            subscriber.complete()  
        })
    })
}

function init(req, res){
    zip(getCountryQueryObservable(),
        getSeriesQueryObservable(),
        getTeamsQueryObservable(), 
        (t1, t2, t3)=>{
                return {countries: t1, series: t2, teams: t3}
            } 
        ).subscribe(
            (data)=>{
                console.log("T20: Rendering")
                return res.render("user/t20", 
                    {series: data.series,
                     countries: data.countries.results, 
                     teams: data.teams.results}) 
            },
            (err)=>{
                throw err
            },
            ()=>{}
        )
}

function getMatchesOfSeriesObs(seriesId){
    const sql_query = "with T(series_id, match_id, date, team_id1, team_id2) \
        AS (select series_id, match_id, date,  max(team_id), min(team_id) \
        from (MatchPlayerTeam natural join \
        Matches natural join Series natural join Teams) \
        WHERE series_id = ? \
        group by match_id ORDER BY starting_date DESC, date DESC) \
        select series_id, match_id, team_id1, team_id2, R.team_name as team_name1,\
        S.team_name as team_name2, date from T inner join \
        (Teams as R, Teams as S) \
        ON(T.team_id1 = R.team_id and T.team_id2 = S.team_id);"
    
    return Observable.create(subscriber => {
        con.query(sql_query, [seriesId], (err, results, fields) => {
            if(err) subscriber.error(err)
            else subscriber.next(results);
            console.log("Done Matches")
            subscriber.complete();
        })
    }).pipe(
        map(v => {
            v.forEach(function(elem, index, arr){
                arr[index].date = formatDate(elem.date)
            })
            console.log("Done ForEachMatches")
            return v
        }),)

}

function getTeamsOfSeriesObs(seriesId){
    const sql_query = "with T(team_id, team_name) \
        AS (SELECT DISTINCT team_id, team_name \
        from (MatchPlayerTeam natural join \
        Matches natural join Teams) \
        WHERE series_id = ?) \
        SELECT T.team_id, T.team_name from T"
    
    console.log(sql_query)
    
    return Observable.create(subscriber => {
        con.query(sql_query, [seriesId], (err, results, fields) => {
            if(err) subscriber.error(err)
            else subscriber.next(results);
            subscriber.complete();
        })
    })
}

function getSeriesObs(seriesId){
    const sql_query = "SELECT * FROM Series WHERE "+
            "series_id = ?";
    return Observable.create(subscriber => {
        con.query(sql_query, [seriesId], (err, results, fields)=>{
            if(err) subscriber.error(err)
            else subscriber.next(results)
            console.log("DoneSeries")
            subscriber.complete()
        })
    }).pipe(
        map(v=>{
        v.forEach(function(elem, index, arr){
            arr[index].starting_date = formatDate(elem.starting_date)
            arr[index].end_date = formatDate(elem.end_date)
        })

        console.log("Done ForEachSeries")
        return v
    }))
}

function getMatchDetailsObs(matchId){
    const sql_query = fs.readFileSync('queries/matchQuery.sql', 'utf8');
    
    return Observable.create(subscriber => {
        con.query(sql_query, [matchId], (err, results, fields)=>{
            if(err) subscriber.error(err)
            else subscriber.next(results);
            subscriber.complete();  
        })
    }).pipe(map(v => {
        v.forEach((elem, index, arr)=>{
            v[index].date = formatDate(elem.date)
        })

        return v
    }))
}

function getBattingScorecardObs(matchId, teamId, teamName){
    const sql_query = fs.readFileSync('queries/battingScorecardQuery.sql', 'utf8');

    return Observable.create(subscriber => {
        con.query(sql_query,
            [matchId, teamId, matchId], 
            (err, results, fields)=>{
                if(err) subscriber.error(err)
                else{
                    results[0].team_name = teamName;
                     subscriber.next(results)
                }
                subscriber.complete()
        })
    })
}

function getBowlingScorecardObs(matchId, teamId){
    const sql_query = fs.readFileSync('queries/bowlingScorecardQuery.sql','utf-8')

    return Observable.create(subscriber => {
        con.query(sql_query,[teamId, matchId], 
            (err, results, fields)=>{
            if(err) subscriber.error(err)
            else{
                subscriber.next(results)
            }
            subscriber.complete()
        })
    })
}

function getMatch(req, res){
    const matchId = req.params.id
    getMatchDetailsObs(matchId)
    .pipe(mergeMap(v =>{
        return zip(
            getBattingScorecardObs(matchId, v[0].team1_id, v[0].team1_name),
            getBattingScorecardObs(matchId, v[0].team2_id, v[0].team2_name), 
            getBowlingScorecardObs(matchId, v[0].team1_id), 
            getBowlingScorecardObs(matchId, v[0].team2_id), 
            (t1, t2, t3, t4)=>{
                t1.forEach((elem, index, arr)=>{
                    if(elem.out_notout == 0)
                        arr[index].out = "not out"
                    else{
                        var temp = "b " + elem.bowler_name
                        if(elem.out_by1 != null){
                            temp = outType[elem.out_type] + " " + 
                                elem.fielder_name + " " + temp 
                        } 
                        arr[index].out = temp
                    }
                })

                t2.forEach((elem, index, arr)=>{
                    if(elem.out_notout == 0)
                        arr[index].out = "not out"
                    else{
                        var temp = "b " + elem.bowler_name
                        if(elem.out_by1 != null){
                            temp = outType[elem.out_type] + " " + 
                                elem.fielder_name + " " + temp 
                        } 
                        arr[index].out = temp
                    }
                })

                if(t1.length > 0 && t1[0].team_position == 1){
                    return {team1: {batting: t1, bowling: t3}, 
                            team2: {batting: t2, bowling: t4}}
                }
                else{
                    return {team1: {batting: t2, bowling: t4}, 
                            team2: {batting: t1, bowling: t3}}
                }
            }
        ).pipe(
            map(v1 =>{
                return {matchDetail: v, scorecard: v1}
            })
        )
    }))    
    .subscribe(
        (data)=>{
            console.log(data.scorecard)
            res.render("user/matchDetail", {MatchDetail: data.matchDetail, 
                                     team1Scorecard: data.scorecard.team1,
                                    team2Scorecard: data.scorecard.team2})
        },
        (err)=>{
            throw err;
        },
        ()=>{}
    )
}

function getSeries(req, res){
    const seriesId = req.params.id;
    
    zip(getMatchesOfSeriesObs(seriesId),
        getSeriesObs(seriesId),
        getTeamsOfSeriesObs(seriesId),
        (t1, t2, t3) =>{
                return {Matches: t1, Series: t2, Teams: t3}
            }   
        ).subscribe(
            (data)=>{
                console.log(data.Matches)
                res.render("user/seriesDetail", {Series: data.Series,
                    Matches: data.Matches, 
                    Teams: data.Teams});
            },
            (err)=>{
                res.send("Error")
                throw err
            },
            ()=>{}
        )
}

function getSeriesGroup(req, res){
    console.log(req.body)
    var team1ID = parseInt(req.body.team1ID)
    var team2ID = parseInt(req.body.team2ID)
    var strtDt = "2001-01-01"
    var endDt = "2024-01-01"
    if(req.body.strtDt != '') strtDt = req.body.strtDt
    if(req.body.endDt != '') endDt = req.body.endDt

    const sql_query = "SELECT distinct series_id, series_name, series_type, \
            starting_date, end_date, authority\
            FROM Series natural join Matches as M natural join MatchPlayerTeam \
            natural join Teams \
            WHERE starting_date >= ? \
            and end_date <= ? \
            and (? < 0 OR team_id = ?) \
            and EXISTS (SELECT * FROM MatchPlayerTeam as MPT natural join Teams \
            WHERE (? < 0 OR Teams.team_id = ?) \
            and MPT.match_id = M.match_id) "

    con.query(sql_query, [strtDt, endDt, team1ID, team1ID, 
                            team2ID, team2ID],
            (err, results, fields) =>{
                if(err){
                    res.send("Error")
                    throw err
                }
                else{
                    results.forEach((elem, index, arr)=>{
                        results[index].starting_date = 
                            formatDate(elem.starting_date)
                        results[index].end_date = 
                            formatDate(elem.end_date)
                    })
                    res.render("user/t20Series.ejs", {series:results})
                }
            })
}

function getMatchGroup(req, res){
    console.log("Matches = ", req.body)
    var team1ID = parseInt(req.body.team1ID)
    var team2ID = parseInt(req.body.team2ID)
    var strtDt = "2001-01-01"
    var endDt = "2024-01-01"
    if(req.body.strtDt != '') strtDt = req.body.strtDt
    if(req.body.endDt != '') endDt = req.body.endDt
    var hostCountryID = parseInt(req.body.hostCountryId)

    const sql_query = fs.readFileSync("queries/matchGroupQuery.sql", 'utf-8')
    console.log(sql_query)
    console.log([strtDt, endDt, team1ID, team1ID, 
        hostCountryID, hostCountryID, 
        team2ID, team2ID])
    con.query(sql_query, 
        [strtDt, endDt, team1ID, team1ID, 
        hostCountryID, hostCountryID, 
        team2ID, team2ID],(err, results, fields)=>{
        console.log("Query Successful")
        if(err){
            res.send("Error")
            throw err
        }else{
            console.log(results)
            results.forEach((elem, index, arr)=>{
                arr[index].date = formatDate(elem.date)
            })
            res.render("user/t20Matches.ejs", {data: results})
        }
    })
}

module.exports.init = init;
module.exports.getSeries = getSeries;
module.exports.getSeriesGroup = getSeriesGroup;
module.exports.getMatchGroup = getMatchGroup
module.exports.getMatch = getMatch;