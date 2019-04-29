const express = require("express")
const app = express()
var bodyParser = require('body-parser');
const routes = require("./router.js")



// app.use(express.json())
// app.use(require('connect'))
app.use(bodyParser.json()) 
// app.use(express.bodyParser())
app.use(bodyParser.urlencoded({ extended: true }));  
app.use(express.static('public'))
app.set("view engine", "ejs")

// app.get()    //Get Information from server
// app.post()   //Send new information to server
// app.put()    //Update information
// app.delete() //delete information

app.use(routes)

const port = process.env.PORT  || 8080
app.listen(port, () => console.log(`Listening on port ${port}... `))