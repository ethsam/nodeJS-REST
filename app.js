const {success, error} = require('functions')
const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
const config = require('./config.json')
const app = express()

const members = [
    {
        id: 1,
        name: 'John'
    },
    {
        id: 2,
        name: 'Julie'
    },
    {
        id: 3,
        name: 'Jack'
    }
]

let MembersRouter = express.Router()

    app.use(morgan('dev'))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));


    MembersRouter.route('/:id')
        // GET members with his ID
        .get((req, res) => {

            let index = getIndex(req.params.id)

            if ( typeof(index) == 'string' ) {
                res.json(error(index))   
            } else {
                res.json(success(members[index]))
            }

        })

        // PUT Modify member with his ID
        .put((req, res) => {
            
            let index = getIndex(req.params.id)

            if (typeof (index) == 'string') {
                res.json(error(index))

            } else {

                let same = false

                for (let i = 0; i < members.length; i++) {
                    if (req.body.name == members[i].name && req.params.id != members[i].id) {
                        same = true
                        break
                    }
                }

                if (same) {
                    res.json(error('same name'))
                } else {
                    members[index].name = req.body.name
                    res.json(success(true))
                }
            }

        })

        // DELETE member with his ID
        .delete((req, res) => {

            let index = getIndex(req.params.id)

            if (typeof (index) == 'string') {
                res.json(error(index))
            } else {
                members.splice(index, 1)
                res.json(success(members))
            }
        })

    MembersRouter.route('/')
        // GET
        .get((req, res) => {
            if (req.query.max != undefined && req.query.max > 0) {

                res.json(success(members.slice(0, req.query.max)))

            } else if (req.query.max != undefined) {

                res.json(error('Wrong max value'))

            } else {

                res.json(success(members))

            }
            
        })

        // POST
        .post((req, res) => {

            let sameName = false


            if (req.body.name) {

                for (let i = 0; i < members.length; i++) {
                    if (members[i].name == req.body.name) {
                        sameName = true
                        break
                    }
                }

                if (sameName) {
                    res.json(error('name already taken'))
                } else {
                    let member = {
                        id: createID(),
                        name: req.body.name
                    }

                    members.push(member)

                    res.json(success(member))
                }

            } else {

                res.json(error('no name value'))

            }
        })


    app.use( config.rootAPI + 'members', MembersRouter)

// LISTEN
app.listen(config.port, () => {
    console.log('Started on ' + config.port)
})

function getIndex(id) {
    for (let i = 0; i < members.length; i++) {
        if (members[i].id == id)
            return i
    }
    return 'wrong ID'
}

function createID() {
    return members[members.length-1].id + 1
}