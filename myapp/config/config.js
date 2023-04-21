require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
module.exports = {
  development: {
    username: process.env[`POSTGRES_USER_${nodeEnv}`],
    password: process.env[`POSTGRES_PASSWORD_${nodeEnv}`],
    database: process.env[`POSTGRES_DB_${nodeEnv}`],
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    username: process.env[`POSTGRES_USER_${nodeEnv}`],
    password: process.env[`POSTGRES_PASSWORD_${nodeEnv}`],
    database: process.env[`POSTGRES_DB_${nodeEnv}`],
    host: '127.0.0.1',
    dialect: 'postgres',
  },
};
