
const UserModel = (sequelize, type) => {
  return sequelize.define('weather_consumers', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chat_id: {
      type: type.INTEGER,
      allowNull: true,
    },
    name: {
      type: type.STRING(255),
      allowNull: true,
    },
    visits: {
      type: type.INTEGER,
      allowNull: true,
    },
  });
};

export  { UserModel };