const express = require('express');
require('dotenv').config();
const { getSignedUrlFromS3, downloadDocument, getUploadUrlFromS3, checkFileExists, deleteFile } = require('./s3Service');
const { checkDatabaseHealth, addClient, getAllClients, deleteClientById, getClientById } = require('./postgresService');
const BedrockService = require('./bedrockService');

// comment out cors for AWS deployment
// const cors = require('cors');
const app = express();
// app.use(cors({
//   origin: ['https://logease-orcin.vercel.app', 'http://localhost:5173'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// }));
app.use(express.json());

const bedrockService = new BedrockService();
// Chat endpoint
app.post('/api/chat/message', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        const response = await bedrockService.processChatMessage(message);
        res.json({ response });
    } catch (error) {
        console.error('Error processing chat message:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Get signed URL for document
app.post('/api/documents/url', async (req, res) => {
  try {
    const { bucket, key } = req.body;
    
    if (!bucket || !key) {
      return res.status(400).json({ error: 'Bucket and key are required' });
    }

    const signedUrl = await getSignedUrlFromS3(bucket, key);
    res.json({ signedUrl });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

// Get upload URL for document
app.post('/api/documents/upload-url', async (req, res) => {
  try {
    const { bucket, key } = req.body;
    
    if (!bucket || !key) {
      return res.status(400).json({ error: 'Bucket and key are required' });
    }

    const uploadUrl = await getUploadUrlFromS3(bucket, key);
    res.json({ uploadUrl });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// Download document
app.post('/api/documents/downloads', async (req, res) => {
  try {
    const { bucket, key } = req.body;
    
    if (!bucket || !key) {
      return res.status(400).json({ error: 'Bucket and key are required' });
    }

    const document = await downloadDocument(bucket, key);
    
    // Set appropriate headers
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=${key}`);
    
    // Stream the document to the client
    document.pipe(res);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Check if file exists in S3
app.post('/api/documents/check', async (req, res) => {
  try {
    const { bucket, key } = req.body;
    
    if (!bucket || !key) {
      return res.status(400).json({ error: 'Bucket and key are required' });
    }

    const exists = await checkFileExists(bucket, key);
    res.json({ exists });
  } catch (error) {
    console.error('Error checking file existence:', error);
    res.status(500).json({ error: 'Failed to check file existence' });
  }
});

// Database health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const healthStatus = await checkDatabaseHealth();
    res.json(healthStatus);
  } catch (error) {
    console.error('Error checking database health:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to check database health',
      error: error.message 
    });
  }
});

// Add client endpoint
app.post('/api/add_clients', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Client name is required' });
    }
    const client = await addClient(name.trim());
    if (!client) {
      return res.status(409).json({ error: 'Client with this name already exists' });
    }
    res.status(201).json(client);
  } catch (error) {
    console.error('Error adding client:', error);
    res.status(500).json({ error: 'Failed to add client' });
  }
});

// Get all clients endpoint
app.get('/api/get_all_clients', async (req, res) => {
  try {
    const clients = await getAllClients();
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Delete client by id endpoint
app.delete('/api/delete_client/:id/:name', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const name = req.params.name;
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid client id' });
    }

    // Delete associated files
    const installationKey = `clients/LogEase Installation Scope of Work For ${name}.docx`;
    const serviceKey = `clients/LogEase Professional Service (7x24X4) For ${name}.docx`;

    try {
      await Promise.all([
        deleteFile('logease', installationKey),
        deleteFile('logease', serviceKey)
      ]);
    } catch (error) {
      console.error('Error deleting client files:', error);
      // Continue with client deletion even if file deletion fails
    }

    // Delete client from database
    const deleted = await deleteClientById(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Get client by id endpoint
app.get('/api/get_client/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid client id' });
    }
    const client = await getClientById(id);
    if (client) {
      res.json(client);
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

const port = process.env.PORT || 8080;
// Test route
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 