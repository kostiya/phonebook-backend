require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const app = express()
const Person = require('./models/person')

app.use(express.static("build"))
app.use(express.json())
app.use(morgan((tokens, req, res) => {
  ret = [ tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'), '-',
          tokens['response-time'](req, res), 'ms'
        ].join(' ')
        if(tokens.method(req, res) === 'POST'){
          ret = ret.concat(" " + JSON.stringify(req.body))
        }
  return ret
}))


let persons = 
[
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/api/persons/:id', (request, response, next)=> {
    Person.findById(request.params.id).then(person => {
      if(person){
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
    response.contentType('text/plain')
    response.write(`Phonebook has info for ${persons.length} people\n`)
    response.write(Date().toLocaleString())
    response.end()
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then( pepole => {
      response.json(pepole)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if(!body.name){
    return response.status(400).json({
      error : 'Name is missing'
    })
  }

  if(!body.number){
    return response.status(400).json({
      error : 'Number is missing'
    })
  }

  const newPerson = new Person({
    name : body.name,
    number : body.number ? body.number : "0"
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  body = request.body

  if(!body.name){
    return response.status(400).json({
      error : 'Name is missing'
    })
  }

  if(!body.number){
    return response.status(400).json({
      error : 'Number is missing'
    })
  }

  const newPerson = {
    name : body.name,
    number : body.number,
  }

  Person.findByIdAndUpdate(request.params.id, newPerson, {new: true})
      .then(updatedPerson => response.json(updatedPerson))
      .catch(error => next(error))
})

unknownEndpoint = (request, response) => {
  response.status(404).send( {error : 'unknown endpoint'} )
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === "CastError") {
    return response.status(400).send({ error: "malformated id" })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT,() => {
  console.log("Server running on port " + PORT)
})
