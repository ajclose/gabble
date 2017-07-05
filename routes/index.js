const express = require('express')
const router = express.Router()
// const mustache = require('mustache-express')
// const bodyParser = require('body-parser')
const session = require('express-session')
const models = require("../models")
let sess;
let errorMessage;
const Busboy = require('busboy')
const path = require('path')
const fs = require('fs')


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
  const userImage = "default.jpg"
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
  console.log('errorMessage', errorMessage);
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

// router.use('/user', function(req, res, next) {
//   sess = req.session
//   if (sess.userName) {
//     next()
//   } else {
//     res.redirect('/login')
//   }
// })

// router.get('/user', function(req, res) {
//   res.send("you have made it!")
// })



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
        include: [{
          model: models.User,
          as: 'user'
        }]
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

router.get('/user/edit', function(req, res) {
  sess = req.session
  let userImage;
  let bio;
  res.render('edit')
})

router.post('/user/edit', function(req, res) {
  sess = req.session
  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {

    if (filename) {
      userImage = sess.userId + ".jpg"
      var saveTo = path.join('./public/uploads/', path.basename(userImage));
      file.pipe(fs.createWriteStream(saveTo));

        file.on('end', function() {
        });
      } else {
        file.resume()
      }
      });

      busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
        if (fieldname === 'bio') {
          bio = val
        }
      });
      busboy.on('finish', function() {
        models.User.findOne({
          where: {
            id: sess.userId
          }
        }).then(function(user) {
          user.bio = bio
          user.image = userImage
          user.save()
          .then( function(user) {
              return res.redirect('/')
          })
        })

      });
      req.pipe(busboy);

})




module.exports = router
