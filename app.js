const express = require('express')
const morgan = require('morgan')
const userRoutes = require('./routes/userRoutes')
const app = express()
const bodyParser = require('body-parser')

app.use(express.json())
app.use(morgan('combined'))
app.use('/users', userRoutes)

module.exports = app