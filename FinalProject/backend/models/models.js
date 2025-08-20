const {sequelize} = require('./db');
const {DataTypes} = require('sequelize');

const Group = sequelize.define('genGroup', {
  groupID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  adminID:{
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  group_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  approval_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'archived'),
    defaultValue: 'active',
  },
},
{timestamps: false}
);

const User = sequelize.define('User', {
  UID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  approval_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  groupID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  username:{
    type: DataTypes.STRING,
    allowNull: false,
  }
},
{timestamps: false});

const NFCCard = sequelize.define('NFCCard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nfcCardId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  groupID: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cardNumber: {
    type: DataTypes.STRING(16),
    allowNull: false,
  },
  cvv: {
    type: DataTypes.STRING(3),
    allowNull: false,
  },
  expiryDate: {
    type: DataTypes.STRING(5), // MM/YY format
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'used', 'expired'),
    defaultValue: 'active',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  usedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
},
{timestamps: false});

// Relationships
Group.hasMany(User, {
  foreignKey: 'groupID',
  onDelete: 'SET NULL',
  hooks: true
});

User.belongsTo(Group, {
  foreignKey: 'groupID'
});

Group.hasMany(NFCCard, {
  foreignKey: 'groupID',
  onDelete: 'CASCADE',
});

NFCCard.belongsTo(Group, {
  foreignKey: 'groupID'
});

module.exports = {Group, User, NFCCard};