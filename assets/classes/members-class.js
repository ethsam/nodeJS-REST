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

    
}