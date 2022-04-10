const { request } = require("express")
const { response } = require("express")
const express = require("express")
const morgan = require("morgan")
const app = express()
const cors = require('cors')

app.use(cors())
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

app.get('/api/persons/:id', (request, response)=> {
    const id = Number(request.params.id)
    const person = persons.find( person => person.id === id)

    if(person){
        response.json(person)
    } else {
        response.statusMessage = 'No such person'
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    response.contentType('text/plain')
    response.write(`Phonebook has info for ${persons.length} people\n`)
    response.write(Date().toLocaleString())
    response.end()
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
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

  if(persons.find(person => person.name === body.name)){
    return response.status(400).json({
      error : "Name must be unique"
    })
  }

  const newPerson = {
    id : Math.round(Math.random()*1000000000),
    name : body.name,
    number : body.number ? body.number : "0"
  }

  persons = persons.concat(newPerson)

  response.json(newPerson)
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log("Server running on port " + PORT)