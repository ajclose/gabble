'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please enter a username"
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please enter a valid email address"
        },
        isEmail: {
          msg: "Please enter a valid email address"
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Please enter a password"
        },
        len: {
          args: [6, 20],
          msg: "Password must be at least 6 - 20 characters long"
        }
      }
    },
    bio: DataTypes.TEXT,
    image: DataTypes.STRING
  }, {});

  User.associate = function(models) {
    User.hasMany(models.Post, {as: 'post', foreignKey: 'userId'})
    User.hasMany(models.Like, {as: 'like', foreignKey: 'userId'})
  }



  return User;
};
