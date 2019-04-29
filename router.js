const express = require('express')
const router = express.Router()
const userHome = require("./user/home")
const t20   = require("./user/t20")
const stadium = require("./user/stadium")
const rootAdmin = require("./admin/root")
var bodyParser = require('body-parser')
// var multer  = require('multer')

// router.use(express.json())
router.use(bodyParser.json())  
router.use(bodyParser.urlencoded({ extended: true })); 
// router.use(multer())

const courses = [
    {id: 1, name: "wiley"},
    {id: 2, name: "resnick"},
    {id: 3, name: "jdlee"}
]

/*Entry*/
router.get("/", (req, res) => {
    res.render("entry")
})

/* User Page Entry*/
router.get("/userLogin", (req, res) => {
    console.log("Opening User Home Page")
    userHome.init(req, res);
    return;
})

/* Admin Page Entry */
router.post("/admin", (req, res) => {
    rootAdmin.init(req, res)
    return
})

/*Admin Page Entry -> Table Info */
router.post("/admin/:table_name", (req, res) => {
    console.log("Getting Data: "+ req.params.table_name)
    rootAdmin.getTableInfo(req, res)
})

/* Admin Page Entry -> Table Info -> Table Insertion Form*/
router.post("/admin/rightPan/:table_name", (req, res) => {
    const table_name = req.params.table_name
    console.log("Getting Right Pan " + req.params.table_name)
    if(table_name === "Authority") rootAdmin.getAuthorityBlock(req, res)
    else if(table_name === "BattingScorecard") rootAdmin.getBattingScorecardBlock(req, res)
    else if(table_name === "BowlingScorecard") rootAdmin.getBowlingScorecard(req, res)
    else if(table_name === "Umpires") rootAdmin.getUmpiresBlock(req, res)
    else if(table_name === "Countries") rootAdmin.getCountriesBlock(req, res)
    else if(table_name === "Extras") rootAdmin.getExtrasBlock(req, res)
    else if(table_name === "Matches") rootAdmin.getMatchesBlock(req, res)
    else if(table_name === "MatchPlayerTeam") rootAdmin.getMatchPlayerTeamBlock(req, res)
    else if(table_name === "Series") rootAdmin.getSeriesBlock(req, res)
    else if(table_name === "SeriesTypes") rootAdmin.getSeriesTypesBlock(req, res)
    else if(table_name === "Teams") rootAdmin.getTeamsBlock(req, res)
    else if(table_name === "Players") rootAdmin.getPlayersBlock(req, res)
    else if(table_name === "Stadiums") rootAdmin.getStadiumsBlock(req, res)
    else{
        res.send("Error")
    }
})

/* Admin Page Entry -> TableInfo -> TableInsertionForm->Insertion*/
router.post("/admin/insert/:table_name", (req, res) => {
    console.log("Inserting Data " + req.params.table_name)
    const table_name = req.params.table_name
    console.log(req.body)
    if(table_name === "Authority") rootAdmin.insertIntoAuthority(req, res)
    else if(table_name === "Umpires") rootAdmin.insertIntoUmpires(req, res)
    else if(table_name === "Countries") rootAdmin.insertIntoCoutries(req, res)
    else if(table_name === "SeriesTypes") rootAdmin.insertIntoSeriesTypes(req, res)
    else if(table_name === "Players") rootAdmin.insertIntoPlayers(req, res)
    // else if(table_name == "Stadiums")
    else res.send(table_name + "does not exits")
})

router.post("/admin/players/suggestion", (req, res) =>{
    console.log("PRINTING BODY: ")
    console.log(req.body)
    rootAdmin.getPlayersSuggestion(req, res)
})

/* User Page -> T20 */
router.get("/user/t20", (req, res) => {
    console.log("Opening User T20 Page")
    t20.init(req, res)
    return;
})

/*User Page -> T20 -> Series */
router.get("/user/t20/series/:id", (req, res)=>{
    console.log("Request for Series: "+req.params.id);
    console.log(typeof req.params.id)
    return t20.getSeries(req, res)
})

/*User Page -> T20 -> Match */
router.get("/user/t20/match/:id", (req, res)=>{
    console.log("Request for Match: "+req.params.id);
    return t20.getMatch(req, res)
})

router.post("/user/t20/series", (req, res)=>{
    return t20.getSeriesGroup(req, res) 
}) 

router.post("/user/t20/matches", (req, res)=>{
    return t20.getMatchGroup(req, res)
}) 

router.get("/user/stadium/:id", (req, res)=>{
    console.log("Request for Stadium", req.params.id)
    return stadium.init(req, res, req.params.id)
})



module.exports = router;