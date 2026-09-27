const sql = require("mssql/msnodesqlv8");

const config = {
  server: "(localdb)\\MSSQLLocalDB",
  database: "GiftWalaDB",
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

let pool;

const connectDB = async () => {
  try {
    pool = await sql.connect(config);

    console.log("SQL Server Connected Successfully");

    return pool;
  } catch (error) {
    console.error("Database Connection Failed");
    console.error(error.message);

    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error("Database connection is not established");
  }

  return pool;
};

module.exports = {
  sql,
  connectDB,
  getPool
};
