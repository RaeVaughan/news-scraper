// dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');

// Requiring models

// Scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use body parser
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/news");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Set Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Routes
// ==============
app.get("/", function(req, res) {
    res.render("index");
  });

app.get("/scrape", function(req, res){
    //grab the body of the html with a request
    request("http://www.huffingtonpost.com/", function(error, response, html) {
        //load that html into cheerio for scraping
        var $ = cheerio.load(html);

        //save headlines
        $("h2.card__headline").each(function(i, element) {

            //empty object for article info to be pushed into
            var result = {};

            //add text and article link to the empty result object
            result.title = $(this).text();
            result.link = $(this).children().attr("href");

            //console.log(result);

            //create a new entry using Article model
            var entry = new Article(result);

            //save the entry to the database
            entry.save(function(err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(doc);
                }
            });
        });
    });
    res.send("Articles found!");
});



//Run port
app.listen(3000, function() {
  console.log("App running on port 3000!");
});