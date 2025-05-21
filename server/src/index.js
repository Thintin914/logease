const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getSignedUrlFromS3, downloadDocument } = require('./s3Service');

const cors = require('cors');
app.use(cors({
  origin: ['https://portfolio-6xvl.vercel.app', 'https://www.jackywu.space', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());


const port = process.env.PORT || 8080;
// Test route
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
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

// Download document
app.post('/api/documents/download', async (req, res) => {
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

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 