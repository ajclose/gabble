const express = require('express')
const router = express.Router()
const session = require('express-session')
const models = require("../models")
const moment = require("moment")
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

router.get('/', function(req, res) {
  sess = req.session
  models.Post.findAll({
    order: [
      ['createdAt', 'DESC']
    ],
    include: [{
      model: models.User,
      as: 'user'
    }, {
      model: models.Like,
      as: 'like'
    }]
  }).then(function(posts) {
    for (var i = 0; i < posts.length; i++) {
      const post = posts[i]
      post.date = moment(post.createdAt).format('MMMM Do YYYY')
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
      userName: sess.userName,
      userId: sess.userId
    })
  })
})

router.get('/:id', function(req, res) {
  sess = req.session
  models.Post.findAll({
      where: {
        userId: req.params.id
      },
      order: [
        ['createdAt', 'DESC']
      ],
      include: [{
        model: models.User,
        as: 'user'
      }, {
        model: models.Like,
        as: 'like'
      }]
    }).then(function(posts) {
      for (var i = 0; i < posts.length; i++) {
        const post = posts[i]
        post.date = moment(post.createdAt).format('MMMM Do YYYY')
        post.likeCount = post.like.length
        if (post.userId === sess.userId) {
          post.delete = true
          post.user.edit = true
        }
        post.liked = false
        for (var j = 0; j < post.like.length; j++) {
          const like = post.like[j]
          if (like.userId === sess.userId) {
            post.liked = true
          }
        }
      }

      res.render('userGabs', {
        gabs: posts,
        user: posts[0].user,
        userName: sess.userName,
        userId: sess.userId
      })
    })
    .catch(function(error) {
      models.User.findOne({
        where: {
          id: req.params.id
        }
      }).then(function(user) {
        if (user.id === sess.userId) {
          user.edit = true
        }
        res.render("userGabs", {
          user: user,
          message: "This user hasn't opened their mouth yet!",
          userName: sess.userName,
          userId: sess.userId
        })
      })
    })
})

router.get('/like/:id', function(req, res) {
  sess = req.session
  const prevPage = req.headers.referer.substring(21)
  const postId = req.params.id
  models.Like.build({
    postId: postId,
    userId: sess.userId
  }).save().then(function(like) {
    res.redirect(prevPage)
  })
})


router.get('/unlike/:id', function(req, res) {
  sess = req.session
  const prevPage = req.headers.referer.substring(21)
  const postId = req.params.id
  models.Like.destroy({
    where: {
      postId: postId,
      userId: sess.userId
    }
  }).then(function() {
    res.redirect(prevPage)
  })
})

router.post('/delete/:id', function(req, res) {
  sess = req.session
  const prevPage = req.headers.referer.substring(21)
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
    res.redirect(prevPage)
  })
})

router.get('/:userId/gab/:gabId', function(req, res) {
  sess = req.session
  const postId = req.params.gabId
  const userId = req.params.userId
  let usersLiked = []
  models.User.findAll()
    .then(function(users) {
      models.Post.findOne({
        where: {
          id: postId
        },
        include: [{
            model: models.Like,
            as: 'like'
          },
          {
            model: models.User,
            as: 'user'
          }
        ]
      }).then(function(post) {
        const likeCount = post.like.length
        post.date = moment(post.createdAt).format('MMMM Do YYYY')
        for (var i = 0; i < likeCount; i++) {
          const like = post.like[i]
          if (like.userId === sess.userId) {
            post.liked = true
          }
          for (var j = 0; j < users.length; j++) {
            const user = users[j]
            if (like.userId === user.id) {
              usersLiked.push({id: like.userId, username: user.username})
            }
          }
          if (post.userId === sess.userId) {
            post.delete = true
          }
        }
        res.render('gab', {
          usersLiked: usersLiked,
          likeCount: likeCount,
          post: post,
          username: sess.userName,
          userId: sess.userId
        })
      })
    })
})

router.get('/:userId/create', function(req, res) {
  sess = req.session
  res.render('compose', {
    userId: req.params.userId
  })
})

router.post('/:userId/compose', function(req, res) {
  sess = req.session
  const text = req.body.gab
  const post = models.Post.build({
    text: text,
    userId: sess.userId
  })
  post.save().then(function(post) {
    res.redirect('/user')
  }).catch(function(error) {
    res.render('compose', {
      errorMessage: error.errors[0].message,
      userId: req.params.userId,
      text: text
    })
  })
})

router.get('/:userId/edit', function(req, res) {
  sess = req.session
  models.User.findOne({
    where: {
      id: req.params.userId
    }
  }).then(function(user) {
    res.render('edit', {
      userId: sess.userId,
      user: user
    })
  })
})

router.post('/:userId/edit', function(req, res) {
  sess = req.session
  let userImage;
  let bio;
  var busboy = new Busboy({
    headers: req.headers
  });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    userImage = sess.userId + ".jpg"
    if (filename) {
      var saveTo = path.join('./public/uploads/', path.basename(userImage));
      file.pipe(fs.createWriteStream(saveTo));

      file.on('end', function() {});
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
        .then(function(user) {
          return res.redirect(`/user/${sess.userId}`)
        })
    })
  });
  req.pipe(busboy);
})

module.exports = router
