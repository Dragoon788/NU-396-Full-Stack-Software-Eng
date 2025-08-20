const { Sequelize } = require("sequelize");

// Replace these values with your team's database information
const sequelize = new Sequelize("figgystacked", "admin", "figgystacked25", {
  dialect: "mysql",
  host: "figgy-stacked-1.cifdsg8hnrqj.us-east-2.rds.amazonaws.com",
  port: 3306,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: console.log, // Enable SQL query logging
});

const connectToDb = async () => {
  try {
    // Just test the connection
    await sequelize.authenticate();
    console.log("Successfully connected to database");

    // Only sync if SYNC_DB environment variable is set
    if (process.env.SYNC_DB === "true") {
      await sequelize.sync({ alter: true });
      console.log("All models were synchronized successfully.");
    }
  } catch (error) {
    console.error("Failed to connect to database:", error);
    // Don't throw the error, just log it
    // This prevents the server from crashing on database errors
  }
};

module.exports = { sequelize, connectToDb };
