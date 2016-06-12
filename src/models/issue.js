"use strict";

module.exports = function(sequelize, DataTypes) {
  var Issue = sequelize.define("Issue", {
    number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    labels: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },
    milestones: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function(models) {
        Issue.belongsTo(models.Repository, {
          foreignKey: {
            name: 'repository_id',
            allowNull: false
          }
        });
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['repository_id', 'number']
      }
    ]
  });

  return Issue;
};