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
      })
              return res.redirect('/login')
} else {
  passwordError = "Passwords do not match"
}
} else {
  usernameError = "That username already exists"
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
        sess.userId = user.id
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
    models.Like.findAll({
      where: {
        userId: sess.userId
      }
    })
    .then(function(likes) {
      models.User.findOne({
        where: {
          username: sess.userName
        }
      }).then(function(user) {
        models.Post.findAll({order: [['createdAt', 'DESC']]})
        .then(function(posts) {
          for (var i = 0; i < posts.length; i++) {
            const post = posts[i]
            post.like = false
            if (post.userId === sess.userId) {
              post.delete = true
            } else {
              post.delete = false
            }
            for (var j = 0; j < likes.length; j++) {
              const like = likes[j]
              if(post.id === like.postId) {
              post.like = true
            }
          }
            console.log(post.like);
            }

          res.render('user', {
            user: user,
            gabs: posts
          })
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
    author: req.params.username,
    userId: sess.userId
  })
  post.save().then(function(post) {
    res.redirect('/')
  })
})

// router.get('/like/:id', function(req, res) {
//   sess = req.session
//   const postId = req.params.id
//   models.Like.findOne({
//     where: {
//       postId: postId,
//       userId: sess.userId
//     }
//   }).then(function(liked) {
//     if (!liked) {
//       const like = models.Like.build({
//         userId: sess.userId,
//         postId: postId
//       })
//       like.save().then(function(like) {
//         console.log(like);
//       })
//       const likes = models.Like.findAll({
//         where: {
//           postId: postId,
//         },
//         include: [
//           {model: models.User,
//           as: 'user'}
//         ]
//       })
//     .then(function(likes) {
//       for (var i = 0; i < likes.length; i++) {
//         const user = likes[i].user
//             console.log('username', user.username);
//             console.log('likes', likes.length);
//       }
//
//       })
//
//     } else {
//       console.log("already liked!");
//
//     }
//           res.redirect('/')
//   })
//
// })

router.get('/like/:id', function(req, res) {
  sess = req.session
  const postId = req.params.id
  models.Like.build({
      postId: postId,
      userId: sess.userId
  }).save().then(function(like) {
    console.log("liked!", like);
    res.redirect('/')
  })
})


router.get('/unlike/:id', function(req, res) {
  sess = req.session
  const postId = req.params.id
  models.Like.destroy({
    where: {
      postId: postId,
      userId: sess.userId
    }
  }).then(function() {
    console.log("unliked!");
    res.redirect('/')
  })
})

router.get('/gab/:id', function(req, res) {
  sess = req.session
  const postId = req.params.id
  let users = []
  models.Post.findOne({
    where: {
      id: postId
    }
  }).then(function(post) {
    models.Like.findAll({
      where: {
        postId: postId,
      },
      include: [
        {
          model: models.User,
          as: 'user'
        }
      ]
    })
    .then(function(likes) {
      for (var i = 0; i < likes.length; i++) {
        const user = likes[i].user
        users.push(user.username)
      }
      console.log(users);
      const likesNumber = likes.length
      res.render('gab', {
        users: users,
        likesNumber: likesNumber,
        post: post,
        username: sess.userName
      })
    })
  })

})

router.get('/:id/gabs', function(req, res) {
  sess = req.session
  models.Post.findAll({
    where: {
      userId: req.params.id
    }
  }).then(function(posts) {
    res.render('userGabs', {
      gabs: posts
    })
  })
})

router.post('/delete/:id', function(req, res) {
  sess = req.session
  models.Like.destroy({
    where: {
      postId: req.params.id
    }
  }).then(function(post) {
    models.Post.destroy({
      where: {
        id: req.params.id
      }
    })
    res.redirect('/')
    })
  })


module.exports = router
