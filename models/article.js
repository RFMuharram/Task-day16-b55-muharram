'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  article.init({
    title: DataTypes.STRING,
    content: DataTypes.STRING,
    startdate: DataTypes.DATE,
    enddate: DataTypes.DATE,
    vue: DataTypes.BOOLEAN,
    react: DataTypes.BOOLEAN,
    node: DataTypes.BOOLEAN,
    javascript: DataTypes.BOOLEAN,
    image: DataTypes.STRING,
    duration: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'article',
  });
  return article;
};