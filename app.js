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

    // PUT Modify member with his ID -- CRUD OK --
    .put(async(req, res) => {
        let updateMember = await Members.update(req.params.id, req.body.name)
        res.json(checkAndChange(updateMember))
    })

    // DELETE member with his ID -- CRUD OK --
    .delete(async(req, res) => {
        let deleteMember = await Members.delete(req.params.id)
        res.json(checkAndChange(deleteMember))
    })

MembersRouter.route('/')
    // GET ALL Members   -- CRUD OK --
    .get(async(req, res) => {
        let allMembers = await Members.getAll(req.query.max)
        res.json(checkAndChange(allMembers))
    })

    // POST  -- CRUD OK --
    .post(async(req, res) => {
        let addMember = await Members.add(req.body.name)
        res.json(checkAndChange(addMember))
    })


app.use(config.rootAPI + 'members', MembersRouter)

// LISTEN
app.listen(config.port, () => {
    console.log('Started on ' + config.port)
})


}).catch((err) => {
    console.log('Error during database connection')
    console.log(err.message)
})
