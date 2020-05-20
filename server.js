var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var HTTP_PORT = 8000

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

app.get("/api/node", (req, res, next) => {
    var sql = "select * from nodes"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});


app.get("/api/node/:id", (req, res, next) => {
    var sql = "select * from nodes where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});


app.post("/api/node/", (req, res, next) => {
    var errors=[]
    if (!req.body.callsign){
        errors.push("No callsign specified");
    }
    if (!req.body.callident){
        errors.push("No call ident specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        callsign: req.body.callsign.toUpperCase(),
        callident: req.body.callident,
        ipaddr: req.connection.remoteAddress
    }
    var sql ='INSERT INTO nodes (callsign, callident, ipaddr) VALUES (?,?,?)'
    var params =[data.callsign, data.callident, data.ipaddr]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})


app.get("/api/link", (req, res, next) => {
    var sql = "select * from links order by callleft, callright"
    var params = []
    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});



app.get("/api/link/:id", (req, res, next) => {
    var sql = "select * from links where callleft = ? or callright = ?"
    var params = [req.params.id.toUpperCase(), req.params.id.toUpperCase()]
    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
	res.json({
            "message":"success",
            "data":row
        })
      });
});



app.post("/api/link/", (req, res, next) => {
    var errors=[]
    if (!req.body.callleft){
        errors.push("No source callsign specified");
    }
    if (!req.body.callright){
        errors.push("No destination callsign specified");
    }
    var sql = 'select count(*) as count from links where (callleft = ? or callright = ?) or (callleft = ? or callright = ?)'
    var params = [req.body.callleft, req.body.callleft, req.body.callright, req.body.callright]
    db.get(sql, params, (err, row) => {
       if (err) {
         res.status(400).json({"error":err.message});
         return;
       }
       if (row.count > 3) {
          errors.push("Too many links...");
       }
    })
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
	callleft: req.body.callleft.toUpperCase(),
        callright: req.body.callright.toUpperCase()
    }
    var sql ='INSERT INTO links (callleft, callright) VALUES (?,?)'
    var params =[data.callleft, data.callright]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
	res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})



app.delete("/api/link/:id", (req, res, next) => {
    db.run(
        'DELETE FROM links WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", rows: this.changes})
    });
})


// Root path
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});
