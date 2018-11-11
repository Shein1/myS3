import { Model } from 'sequelize';

export default class Bucket extends Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          unique: {
            args: true,
            msg: 'This name is already taken',
          },
        },
      },
      {
        sequelize,
      },
    );
  }
}
