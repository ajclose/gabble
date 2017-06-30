'use strict';
module.exports = function(sequelize, DataTypes) {
  var Like = sequelize.define('Like', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false
  }
}, {});

Like.associate = function(models) {
  Like.belongsTo(models.User,{as: 'user', foreignKey: 'userId'})
  Like.belongsTo(models.Post,{as: 'post', foreignKey: 'postId'})
}


  return Like;
};
