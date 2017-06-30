'use strict';
module.exports = function(sequelize, DataTypes) {
  var Post = sequelize.define('Post', {
    text: DataTypes.TEXT,
    author: DataTypes.STRING
  }, {});

  Post.associate = function(models) {
    Post.belongsTo(models.User,{as: 'user', foreignKey: 'userId'})
    Post.hasMany(models.Like,{as: 'like', foreignKey: 'postId'})
  }


  return Post;
};
