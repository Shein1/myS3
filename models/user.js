import { Model } from 'sequelize';
import bcrypt from 'bcrypt';

const MIN_PASSWORD_LENGTH = 7;

export default class User extends Model {
  static init(sequelize, DataTypes) {
    super.init(
      {
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV1,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isEmail: true,
          },
          unique: {
            args: true,
            msg: 'Email address already in use',
          },
        },
        nickname: {
          type: DataTypes.STRING,
          unique: {
            args: true,
            msg: 'Nickname address already in use',
          },
          allowNull: false,
        },
        password: {
          type: DataTypes.VIRTUAL,
          validate: {
            isLongEnough(value) {
              if (value < MIN_PASSWORD_LENGTH) {
                throw new Error('Password too short bro');
              }
            },
          },
        },
        password_confirmation: {
          type: DataTypes.VIRTUAL,
          validate: {
            isEqual(value) {
              if (this.password_confirmation !== value) {
                throw new Error("Passwords doesn't match");
              }
            },
          },
        },
        password_digest: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
      },
      {
        sequelize,
        hooks: {
          async beforeValidate(user, options) {
            if (user.isNewRecord) {
              const SALT_ROUND = 7;
              try {
                const hash = await bcrypt.hash(user.password, SALT_ROUND);
                user.password_digest = hash;
              } catch (e) {
                throw new Error('Hash has done');
              }
            }
          },
          async beforeSave(user, options) {
            if (user.changed('password')) {
              if (user.password !== user.password_confirmation) {
                throw new Error("error password don't match!");
              }

              const SALT_ROUND = 7;
              try {
                const hash = await bcrypt.hash(user.password, SALT_ROUND);
                user.password_digest = hash;
              } catch (e) {
                throw new Error('Hash has done');
              }
            }
          },
        },
      },
    );
  }

  async checkPassword(password) {
    const answer = await bcrypt.compareSync(password, this.password_digest);
    return answer;
  }

  toJSON() {
    const answer = Object.assign({}, this.get());
    delete answer.password;
    delete answer.password_confirmation;
    delete answer.password_digest;
    return answer;
  }
}
