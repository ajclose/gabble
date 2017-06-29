const express = require('express')
const router = express.Router()
const mustache = require('mustache-express')
const bodyParser = require('body-parser')
const session = require('express-session')
// const Busboy = require('busboy')
// const path = require('path')
// const fs = require('fs')


// router.engine('mustache', mustache() )
// router.set('view engine', 'mustache')
// router.use(express.static('public'))
// router.use(bodyParser.urlencoded({ extended: false }));
// router.use(bodyParser.json())

router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

router.get('/', function(req, res) {
  res.render('signup')
})

router.post('/signup', function(req, res) {
  const newEmail = req.body.email
  const newUsername = req.body.username
  const newPassword = req.body.password
  const confirmPassword = req.body.confirmPassword
  console.log(req.body);
  res.send([newEmail, newUsername, newPassword, confirmPassword])
})

module.exports = router
