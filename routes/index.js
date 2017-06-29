const express = require('express')
const router = express.Router()
const mustache = require('mustache-express')
const bodyParser = require('body-parser')
const session = require('express-session')
const models = require("../models")
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

router.get('/signup', function(req, res) {
  res.render('signup')
})

router.post('/signup', function(req, res) {
  const newEmail = req.body.email
  const newUsername = req.body.username
  const newPassword = req.body.password
  const confirmPassword = req.body.confirmPassword
  let usernameError
  let emailError
  let passwordError
  const user = models.User.build({
    username: newUsername,
    password: newPassword,
    email: newEmail
  })
  user.save().then(function(user) {
    res.render('login', {
      user: user,
    })
  }).catch(function(errors){
    for (var i = 0; i < errors.errors.length; i++) {
      const error = errors.errors[i]
      if (error.path === 'username') {
        usernameError = error.message
      } else if (error.path === 'email') {
        emailError = error.message
      } else if (error.path === 'password') {
        passwordError = error.message
      }
    }
    res.render('signup', {
      email: newEmail,
      username: newUsername,
      usernameError: usernameError,
      emailError: emailError,
      passwordError: passwordError
    })
})
})

module.exports = router
