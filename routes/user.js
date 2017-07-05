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

router.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

router.use(function(req, res, next) {
  sess = req.session
  if (sess.userName) {
    next()
  } else {
    res.redirect('/login')
  }
})

// router.get('/', function(req, res) {
//   sess = req.session
//   console.log("made it!");
//     models.Like.findAll({
//         where: {
//           userId: sess.userId
//         }
//       })
//       .then(function(likes) {
//         models.User.findAll()
//         .then(function(users) {
//           models.Post.findAll({
//               order: [
//                 ['createdAt', 'DESC']
//               ]
//             })
//             .then(function(posts) {
//               for (var i = 0; i < posts.length; i++) {
//                 const post = posts[i]
//                 post.like = false
//                 if (post.userId === sess.userId) {
//                   post.delete = true
//                 } else {
//                   post.delete = false
//                 }
//                 for (var j = 0; j < likes.length; j++) {
//                   const like = likes[j]
//                   if (post.id === like.postId) {
//                     post.like = true
//                   }
//                 }
//                 for (var k = 0; k < users.length; k++) {
//                   const user = users[k]
//                   if (post.userId === user.id) {
//                     post.userName = user.username
//                     post.image = user.image
//                   }
//                 }
//               }
//
//               res.render('user', {
//                 user: sess.userName,
//                 userId: sess.userId,
//                 gabs: posts
//               })
//             })
//         })
//       })
// })

router.get('/', function(req, res) {
  sess = req.session
  models.Post.findAll({
    order: [
      ['createdAt', 'DESC']
    ],
      include: [{
        model: models.User,
        as: 'user'
      },{
        model: models.Like,
        as: 'like'
      }]
  }).then(function(posts) {
    for (var i = 0; i < posts.length; i++) {
      const post = posts[i]
      post.likeCount = post.like.length
      if (post.userId === sess.userId) {
        post.delete = true
      }
      post.liked = false
      for (var j = 0; j < post.like.length; j++) {
        const like = post.like[j]
        if (like.userId === sess.userId) {
          post.liked = true
        }
      }
    }
    res.render('user', {
      gabs: posts,
      userName: sess.userName
    })
  })
})

router.get('/:id', function(req, res) {
  sess = req.session
  models.User.findOne({
    where: {
      id: req.params.id
    }
  }).then(function(user) {
    models.Post.findAll({
      where: {
        userId: req.params.id
      }
    }).then(function(posts) {
      res.render('userGabs', {
        gabs: posts,
        user: user
      })
    })
  })
})

router.get('/like/:id', function(req, res) {
  sess = req.session
  const postId = req.params.id
  models.Like.build({
    postId: postId,
    userId: sess.userId
  }).save().then(function(like) {
    console.log("liked!", like);
    res.redirect('/user')
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
    res.redirect('/user')
  })
})

module.exports = router
