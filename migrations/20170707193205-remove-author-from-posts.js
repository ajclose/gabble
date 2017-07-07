'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('Posts', 'author')
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'Posts', 'author', {
      type: Sequelize.STRING
    })
  }
};
