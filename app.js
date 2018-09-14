const {success, error, checkAndChange} = require('./assets/functions')
const mysql = require('promise-mysql')
const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')('dev')
const config = require('./assets/config.json')

// Initialize Connection to MySql database
mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    port: config.db.port
}).then((connection) => {

console.log('connected as id : ' + connection.threadId);
const app = express()

let MembersRouter = express.Router()
let Members = require('./assets/classes/members-class')(connection, config)

app.use(morgan)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


MembersRouter.route('/:id')
    //GET members with his ID  -- CRUD OK --
    .get(async(req, res) => {
        let member = await Members.getByID(req.params.id)
        res.json(checkAndChange(member))
    })

    // PUT Modify member with his ID
    .put((req, res) => {


        if (req.body.name) {

            connection.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
                if (err) {
                    res.json(error(err.message))
                } else {
                    if (result[0] != undefined) {

                        connection.query('SELECT * FROM members WHERE name = ? AND id != ?', [req.body.name, req.params.id], (err, result) => {
                            if (err) {
                                res.json(error(err.message))
                            } else {

                                if (result[0] != undefined) {
                                    res.json(error('same name'))
                                } else {
                                    connection.query('UPDATE members SET name = ? WHERE id = ?', [req.body.name, req.params.id], (err, result) => {
                                        if (err) {
                                            res.json(error(err.message))
                                        } else {
                                            res.json(success(true))
                                        }
                                    })
                                }

                            }
                        })

                    } else {
                        res.json(error('wrong id'))
                    }
                }
            })

        } else {
            res.json(error('no name value'))
        }

    })

    // DELETE member with his ID
    .delete((req, res) => {

        connection.query('SELECT * FROM members WHERE id = ?', [req.params.id], (err, result) => {
            if (err) {
                res.json(error(err.message))
            } else {
                if (result[0] != undefined) {

                    connection.query('DELETE FROM members WHERE id = ?', [req.params.id], (err, result => {
                        if (err) {
                            res.json(error(err.message))
                        } else {
                            res.json(success(true))
                        }
                    }))

                } else {
                    res.json(error('wrong id'))
                }
            }
        })

    })

MembersRouter.route('/')
    // GET ALL Members   -- CRUD OK --
    .get(async(req, res) => {
        let allMembers = await Members.getAll(req.query.max)
        res.json(checkAndChange(allMembers))
    })

    // POST
    .post((req, res) => {

        if (req.body.name) {

            connection.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {
                if (err) { //first if
                    res.json(error(err.message))
                } else {

                    if (result[0] != undefined) { //second if
                        res.json(error('name already taken'))
                    } else {
                        connection.query('INSERT INTO members(name) VALUES(?)', [req.body.name], (err, result) => {
                            if (err) { //third if
                                res.json(error(err.message))
                            } else {
                                connection.query('SELECT * FROM members WHERE name = ?', [req.body.name], (err, result) => {

                                    if (err) { //first if
                                        res.json(error(err.message))
                                    } else {
                                        res.json(success({
                                            id: result[0].id,
                                            name: result[0].name
                                        }))
                                    }

                                })
                            } // third if
                        })
                    } //second if

                } //first if
            })

        } else {

            res.json(error('no name value'))

        }
    })


app.use(config.rootAPI + 'members', MembersRouter)

// LISTEN
app.listen(config.port, () => {
    console.log('Started on ' + config.port)
})


}).catch((err) => {
    console.log('Erreur during database connection')
    console.log(err.message)
})
