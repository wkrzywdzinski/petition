const express = require("express");
const app = express();
const cookieParser = require("cookie-parser")
const hb = require("express-handlebars");
const db = require('./db')
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

/////////////////////////middleware///////////////////
app.use(express.static("./public"))
app.use(
   require("body-parser").urlencoded({
       extended: false
   })
);
app.use(cookieParser());
////////////////////end of setup ////////////
app.get("/", (req, res) => {
  res.render("sign", {
    layout: "main"
  });
});

app.get("/signed", (req, res) => {
  res.render("signed", {
    layout: "main"
  });
});


app.post("/", function(req, res) {
  console.log("petitionsigned")
  db.createsignature(req.body.firstname, req.body.lastname, req.body.signaturedata).then(function(results) {
      console.log("done")
        res.redirect("/signed");
  }).catch(function(err){console.log(err);})
});



////////////// server ///////////

app.listen(8080, () => {
  console.log("listening 8080");
});
