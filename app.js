const {success, error} = require('functions')
const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')
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

    app.use(morgan('dev'))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true}));

        // GET
        app.get('/api/v1/members/:id', (req, res) => {

            let index = getIndex(req.params.id)

            if ( typeof(index) == 'string' ) {
                res.json(error(index))   
            } else {
                res.json(success(members[index]))
            }

        })

        // PUT
        app.put('/api/v1/members/:id', (req, res) => {
            
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

        // GET
        app.get('/api/v1/members', (req, res) => {
            if (req.query.max != undefined && req.query.max > 0) {

                res.json(success(members.slice(0, req.query.max)))

            } else if (req.query.max != undefined) {

                res.json(error('Wrong max value'))

            } else {

                res.json(success(members))

            }
            
        })

        // POST
        app.post('/api/v1/members', (req, res) => {

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
                        id: members.length + 1,
                        name: req.body.name
                    }

                    members.push(member)

                    res.json(success(member))
                }

            } else {

                res.json(error('no name value'))

            }
        })

        app.delete('/api/v1/members/:id', (req, res) => {
            
            let index = getIndex(req.params.id)

            if (typeof (index) == 'string') {
                res.json(error(index))
            } else {
                members.splice(index, 1)
                res.json(success(members))
            }
        })

// LISTEN
app.listen(8080, () => {
    console.log('Started on 8080')
})

function getIndex(id) {
    for (let i = 0; i < members.length; i++) {
        if (members[i].id == id)
            return i
    }
    return 'wrong ID'
}