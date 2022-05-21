const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url)
  .then(_result => {
    console.log('Connected to mongoDB')
  })
  .catch(error => {
    console.log('Error connecting to mongoDB:', error)
  })

const personSchema = new mongoose.Schema({
  name : {
    type: String,
    minlength: 3,
    required: [true, 'User name is required']
  },
  number: {
    type: String,
    minlength: 9,
    required: [true, 'User phone number required'],
    validate: {
      validator: (v) => /^\d{2,3}-\d{1,}$/.test(v),
      message: props => `${props.value} is not valid phone number`
    }
  },
})

personSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)