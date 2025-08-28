'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init({
        id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING
      },
      email: {
        allowNull: false,
        unique: true,
        type: DataTypes.STRING
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING
      },
      isVerified: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
      verificationOTP: {
        type: DataTypes.STRING
      },
      otpExpiresAt: {
        type: DataTypes.DATE
      },
      profileImage: {
        type: DataTypes.STRING
      },
      dob: {
        type: DataTypes.DATE
      }
    }, {
      sequelize,
      modelName: 'User',
  });
  return User;
};