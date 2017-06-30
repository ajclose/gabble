const express = require('express')
const router = express.Router()
const mustache = require('mustache-express')
const bodyParser = require('body-parser')
const session = require('express-session')
const models = require("../models")
let sess;
let errorMessage;
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
  sess = req.session
  res.render('signup')
})

router.post('/signup', function(req, res) {
  sess = req.session
  const newEmail = req.body.email
  const newUsername = req.body.username
  const newPassword = req.body.password
  const confirmPassword = req.body.confirmPassword
  let usernameError
  let emailError
  let passwordError
  models.User.findOne({
    where: {
      username: newUsername
    }
  }).then(function(user) {
    console.log(user);
    if (!user) {
      if (newPassword === confirmPassword) {
      const user = models.User.build({
        username: newUsername,
        password: newPassword,
        email: newEmail
      })
      user.save().then(function(user) {
        return res.redirect('/login')
  //     }).catch(function(errors){
  //       for (var i = 0; i < errors.errors.length; i++) {
  //         const error = errors.errors[i]
  //         if (error.path === 'username') {
  //           usernameError = error.message
  //         } else if (error.path === 'email') {
  //           emailError = error.message
  //         } else if (error.path === 'password') {
  //           passwordError = error.message
  //         }
  //       }
  })
} else {
  passwordError = "Passwords do not match"
}
} else {
  usernameError = "That username already exists"
}

})

    // res.render('signup', {
    //   email: newEmail,
    //   username: newUsername,
    //   usernameError: usernameError,
    //   emailError: emailError,
    //   passwordError: passwordError
    // })
})

router.get('/login', function(req, res) {
  sess = req.session
  console.log('errorMessage',errorMessage);
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
        return res.redirect('/')
    } else {
        errorMessage = "Username or password is incorrect"
        return res.redirect('/login')
    }
  })
})


router.get('/', function(req, res) {
  sess = req.session
  console.log("made it!");
  if (sess.userName) {
    models.User.findOne({
      where: {
        username: sess.userName
      }
    }).then(function(user) {
      models.Post.findAll({order: [['createdAt', 'DESC']]})
      .then(function(posts) {
        res.render('user', {
          user: user,
          gabs: posts
        })
        })
      })

  } else {
    res.redirect('/login')
  }

})

router.get('/logout', function(req, res) {
  sess = req.session
  sess.userName = ''
  res.redirect('/login')
})

router.get('/:username/gab', function(req, res) {
  sess = req.session
  res.render('compose', {
    username: req.params.username
  })
})

router.post('/:username/compose', function(req, res) {
  sess = req.session
  const text = req.body.gab
  const post = models.Post.build({
    text: text,
    author: req.params.username
  })
  post.save().then(function(post) {
    res.redirect('/')
  })
})

module.exports = router
