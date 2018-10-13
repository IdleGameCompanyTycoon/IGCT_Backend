const { Client } = require('pg');
require('dotenv').config();

const connect = async () => {
  return new Promise((resolve, reject) => {
    let client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: true,
    });

    await client.connect((err) => {
      if (err) {
        client.end();
        reject(err);
      } else {
        resolve(client)
      }
    });
  })
}




module.exports = connect;
