const mongoose = require('mongoose')

const connect = () => {
    mongoose.connect(
        // `mongodb://${id}:${password}@localhost:27017/${dbName}`,
        process.env.MONGO_URL,
        {
            useNewUrlParser: true,
            ignoreUndefined: true,
        },
        (error) => {
            if (error) console.log('Mongo DB Connect Error')
            else console.log('Mongo DB connect Success')
        }
    )
}

mongoose.connection.on('error', (err) => {
    console.error('Mongo DB Connect Error', err)
})

module.exports = connect
