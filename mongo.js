const res = require('express/lib/response')
const mongoose = require('mongoose')

if(process.argv.length < 3){
    console.log("Please provide password as second argument")
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://kostiya:${password}@cluster0.7ejbv.mongodb.net/noteApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length > 3){
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4] || '',
    })

    person.save().then(result => {
        console.log('Person saved!')
        mongoose.connection.close()
        process.exit(0)
    })
}

if(process.argv.length === 3){
    Person.find({}).then(result => {
        result.forEach(person => console.log(person.name, person.number))
        mongoose.connection.close()
        process.exit(0)
    })
}