import { Sequelize, DataTypes, Model, Optional } from "sequelize";

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationOTP?: string;
  otpExpiresAt?: Date;
  profileImage?: string;
  dob?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public isVerified!: boolean;
  public verificationOTP?: string;
  public otpExpiresAt?: Date;
  public profileImage?: string;
  public dob?: Date;
}

export function initUserModel(sequelize: Sequelize): typeof User {
  User.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
      verificationOTP: { type: DataTypes.STRING },
      otpExpiresAt: { type: DataTypes.DATE },
      profileImage: { type: DataTypes.STRING },
      dob: { type: DataTypes.DATE },
    },
    { sequelize, modelName: "User" }
  );
  return User;
}
