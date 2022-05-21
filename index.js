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
    Person.countDocuments({},(error, count) => {
      response.contentType('text/plain')
      response.write(`Phonebook has info for ${count} people\n`)
      response.write(Date().toLocaleString())
      response.end()
    })
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

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const newPerson = new Person({
    name : body.name,
    number : body.number
  })

  newPerson.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  body = request.body

  const newPerson = {
    name : body.name,
    number : body.number,
  }

  Person.findByIdAndUpdate(request.params.id,
    newPerson, 
    {new: true, runValidators: true, context:'query'})
      .then(updatedPerson => response.json(updatedPerson))
      .catch(error => {
        console.log(error)
        next(error)
      })
})

unknownEndpoint = (request, response) => {
  response.status(404).send( {error : 'unknown endpoint'} )
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === "CastError") {
    return response.status(400).send({ error: "malformated id" })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT,() => {
  console.log("Server running on port " + PORT)
})
