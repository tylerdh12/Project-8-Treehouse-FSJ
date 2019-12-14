const Sequelize = require("sequelize");

module.exports = sequelize => {
  class Book extends Sequelize.Model {}
  Book.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: '"Title" is required'
          }
        }
      },
      author: Sequelize.STRING,
      genre: Sequelize.STRING,
      year: Sequelize.INTEGER
    },
    { sequelize }
  );
  return Book;
};
