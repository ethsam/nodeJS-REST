let connection, config

module.exports = (_connection, _config) => {
 connection = _connection
 config = _config

 return Members
}

let Members = class {

    static getByID(id) {

        return new Promise((next) => {
            connection.query('SELECT * FROM members WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined) {
                        next(result[0])
                    } else {
                        next(new Error('Wrong ID'))
                    }
                })
                .catch((err) => next(err))
        })

    }

    static getAll(max) {

        return new Promise((next) => {
                if (max != undefined && max > 0) {

                    connection.query('SELECT * FROM members LIMIT 0, ?', [parseInt(max)])
                        .then((result) => next(result))
                        .catch((err) => next(err))

                } else if (max != undefined) {
                    next(new Error('Wrong max value'))
                } else {
                    connection.query('SELECT * FROM members')
                        .then((result) => next(result))
                        .catch((err) => next(err))
                }

        })

    }

    static add(name) {

        return new Promise((next) => {

                if (name != undefined && name.trim() != '') {

                    name= name.trim()

                    connection.query('SELECT * FROM members WHERE name = ?', [name])
                    .then((result) => {

                         if (result[0] != undefined) { //second if
                            next(new Error('name already taken'))
                         } else {
                            return connection.query('INSERT INTO members(name) VALUES(?)', [name])
                         } //second if

                    })
                    .then(() => {
                        return connection.query('SELECT * FROM members WHERE name = ?', [name])

                                })
                    .then((result) => {
                        next({
                            id: result[0].id,
                            name: result[0].name
                        })
                    })
                    .catch((err) => next(err))

                } else {
                    next(new Error('no name value'))
                }
            })
    }

    static update(id, name) {
            return new Promise((next) => {

            if (name != undefined && name.trim() != '') {

                name = name.trim()

                 connection.query('SELECT * FROM members WHERE id = ?', [id])

                 .then((result) => {
                    if (result[0] != undefined) {
                        return connection.query('SELECT * FROM members WHERE name = ? AND id != ?', [name, id])
                    } else {
                        next(new Error('wrong id'))
                    }
                 })

                 .then((result) => {
                     if (result[0] != undefined) {
                         next(new Error('same name'))
                     } else {
                        return connection.query('UPDATE members SET name = ? WHERE id = ?', [name, id])
                     }
                 })

                 .then(() => next(true))

                 .catch((err) => next(err))

                } else {
                    next(new Error('no name value'))
                }
            })

    }

    static delete(id) {

        return new Promise((next) => {

                connection.query('SELECT * FROM members WHERE id = ?', [id])
                .then((result) => {
                    if (result[0] != undefined) {
                        return connection.query('DELETE FROM members WHERE id = ?', [id])
                    } else {
                        next(new Error('wrong id'))
                    }
                })
                .then(() => next(true))
                .catch((err) => next(err))
        })

    }
}