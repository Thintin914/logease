const { getPublicFile } = require('../getPublicFile');
const { Pool } = require('pg');

let pool;

// Initialize database connection
async function initializePool() {
  try {
    const file = await getPublicFile("global-bundle.pem");
    
    // Create a new pool using environment variables
    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      ssl: {
        rejectUnauthorized: true,
        ca: file
      }
    });
  } catch (error) {
    console.error('Failed to initialize database pool:', error);
    throw error;
  }
}

// Health check function to verify database connection
async function checkDatabaseHealth() {
  try {
    if (!pool) {
      await initializePool();
    }
    
    // Try to connect to the database
    const client = await pool.connect();
    
    // Execute a simple query
    const result = await client.query('SELECT NOW()');
    
    // Release the client back to the pool
    client.release();
    
    return {
      status: 'healthy',
      timestamp: result.rows[0].now,
      message: 'Database connection successful'
    };
  } catch (error) {
    console.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      message: 'Database connection failed'
    };
  }
}

// Add a new client to the database
async function addClient(name) {
  try {
    if (!pool) {
      await initializePool();
    }
    const client = await pool.connect();
    const insertQuery = `
      INSERT INTO clients (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `;
    const result = await client.query(insertQuery, [name]);
    client.release();
    // If no row was inserted, it means the name already exists
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0];
  } catch (error) {
    console.error('Error adding client:', error);
    throw error;
  }
}

// Get all client ids and names from the database
async function getAllClients() {
  try {
    if (!pool) {
      await initializePool();
    }
    const client = await pool.connect();
    const result = await client.query('SELECT id, name FROM clients ORDER BY id DESC');
    client.release();
    return result.rows;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

// Delete a client by id
async function deleteClientById(id) {
  try {
    if (!pool) {
      await initializePool();
    }
    const client = await pool.connect();
    const result = await client.query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    client.release();
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}

// Initialize the pool when the module is loaded
initializePool().catch(console.error);

// Export the pool and health check function
module.exports = {
  pool,
  checkDatabaseHealth,
  addClient,
  getAllClients,
  deleteClientById
};
