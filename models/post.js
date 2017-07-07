'use strict';
module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define('Post', {
    text: {
      type: DataTypes.TEXT,
      validate: {
        len: {
          args: [1, 140],
          msg: "Gab must be 140 characters or less!"
        }
      }
    },
    // author: DataTypes.STRING,
      }, {});

  Post.associate = function(models) {
    Post.belongsTo(models.User,{as: 'user', foreignKey: 'userId'})
    Post.hasMany(models.Like,{as: 'like', foreignKey: 'postId'})
  }


  return Post;
};
