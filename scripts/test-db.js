'use strict';

const Sequelize = require('sequelize');
const config = require('config');
const sequelize = new Sequelize(
  config.get('db.database'),
  config.get('db.username'),
  config.get('db.password'),
  config.get('db'));

sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
    process.exit(0);
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
    process.exit(1);
  });