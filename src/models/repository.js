"use strict";

module.exports = function(sequelize, DataTypes) {
  var Repository = sequelize.define("Repository", {
    owner: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING
    }
  }, {
    classMethods: {
      associate: function(models) {
        Repository.hasMany(models.Issue, {
          foreignKey: {
            name: 'repository_id'
          }
        });
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['owner', 'name']
      }
    ]
  });

  return Repository;
};