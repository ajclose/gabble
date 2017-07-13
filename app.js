const express = require('express')
const app = express()
const mustache = require('mustache-express')
const router = require('./routes/index')
const userRouter = require('./routes/user')
const bodyParser = require('body-parser')
const models = require('./models')
const Busboy = require('busboy')
const path = require('path')
const fs = require('fs')


app.engine('mustache', mustache() )
app.set('view engine', 'mustache')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

const port = process.env.PORT || 3000

app.listen(port, function() {
  console.log("App is live!");
})

app.use('/', router)
app.use('/user', userRouter)
