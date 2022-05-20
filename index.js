require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const app = express()
const Person = require('./models/person')

app.use(express.json())
app.use(express.static("build"))
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

app.get('/api/persons/:id', (request, response)=> {
    Person.findById(request.params.id).then(person => {
      response.json(person)
    })
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

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end();
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

const PORT = process.env.PORT
app.listen(PORT)
console.log("Server running on port " + PORT)