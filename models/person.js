const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url)
        .then(result => {
            console.log("Connected to mongoDB")
        })
        .catch(error => {
            console.log('Error connecting to mongoDB:', error)
        })

const personSchema = new mongoose.Schema({
    name : {
        type: String,
        minlength: 3,
        required: true
    },
    number: String,
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', personSchema)