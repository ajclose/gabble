const express = require('express')
const router = express.Router()
const session = require('express-session')
const models = require("../models")
let sess;
let errorMessage;
const Busboy = require('busboy')
const path = require('path')
const fs = require('fs')

router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

router.get('/signup', function(req, res) {
  sess = req.session
  res.render('signup')
})

router.post('/signup', function(req, res) {
  sess = req.session
  const newEmail = req.body.email
  const newUsername = req.body.username
  const newPassword = req.body.password
  const confirmPassword = req.body.confirmPassword
  const userImage = "default.jpg"
  let usernameError
  let emailError
  let passwordError
  models.User.findOne({
    where: {
      email: newEmail
    }
}).then(function(email) {
  models.User.findOne({
    where: {
      username: newUsername
    }
  }).then(function(user) {
    if (!email) {
      if (!user) {
      if (newPassword === confirmPassword) {
        const user = models.User.build({
          username: newUsername,
          password: newPassword,
          email: newEmail,
          image: userImage
        })
        user.save().then(function(user) {

        }).catch(function(errors) {
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
        })
        return res.redirect('/login')
      } else {
        passwordError = "Passwords do not match"
      }
    } else {
      usernameError = "That username already exists"
    }
  } else {
    emailError = "That email is already registered"
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
})

router.get("/", function(req, res) {
  res.redirect("/login")
})

router.get('/login', function(req, res) {
  sess = req.session
  res.render('login', {
    errorMessage: errorMessage
  })
})

router.post('/verify', function(req, res) {
  sess = req.session
  const username = req.body.loginUsername
  const password = req.body.loginPassword

  models.User.findOne({
    where: {
      username: username
    }
  }).then(function(user) {
    if (user && user.password === password) {
      sess.userName = username
      sess.userId = user.id
      return res.redirect('/user')
    } else {
      errorMessage = "Username or password is incorrect"
      return res.redirect('/login')
    }
  })
})

router.get('/logout', function(req, res) {
  sess = req.session
  sess.userName = ''
  res.redirect('/login')
})

module.exports = router
