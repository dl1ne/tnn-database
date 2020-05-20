var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "db.sqlite" 


let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQlite database.')
        db.run(`CREATE TABLE nodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            callsign text UNIQUE,
            callident text,
            ipaddr text,
            lastupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            CONSTRAINT callsign_unique UNIQUE (callsign)
            )`,(err) => {
        if (err) {
            // Table already created
        }else{
            // Table just created, creating some rows
            var insert_nodes = 'INSERT INTO nodes (callsign, callident, ipaddr) VALUES (?,?,?)'
            db.run(insert_nodes, ["db0luh","db0luh","44.225.65.146"])
            db.run(`CREATE TABLE links (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                callleft text,
                callright text,
                lastupdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                UNIQUE(callleft, callright)
            )`)
            //var insert_links = 'INSERT INTO links (callleft, callright) VALUES (?,?)'
            //db.run(insert_links, ["db0luh","db0rod"])
            //db.run(insert_links, ["db0luh","db0uhi"])
        }
    })
    }
})


module.exports = db
