// backend/routes/textractRoutes.js
const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const textract = new AWS.Textract();
const s3 = new AWS.S3();

// Middleware for authentication (adjust based on your auth system)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  // Add your JWT verification logic here
  // For now, we'll assume the token is valid
  next();
};

// Process PDF with Amazon Textract
router.post('/process-pdf', authenticateToken, async (req, res) => {
  try {
    const { pdfData, fileName } = req.body;
    
    if (!pdfData) {
      return res.status(400).json({ error: 'No PDF data provided' });
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfData, 'base64');
    
    // Step 1: Extract text and tables from PDF using Textract
    const textractParams = {
      Document: {
        Bytes: pdfBuffer
      },
      FeatureTypes: ['TABLES', 'FORMS']
    };

    console.log('Starting Textract analysis...');
    const textractResult = await textract.analyzeDocument(textractParams).promise();
    
    // Step 2: Process the Textract results
    const processedData = await processTextractResults(textractResult, fileName);
    
    // Step 3: Extract images if any (this would require additional processing)
    const extractedImages = await extractImagesFromPdf(pdfBuffer);
    
    res.json({
      success: true,
      extractedInfo: processedData.partInfo,
      allParts: processedData.allParts,
      totalParts: processedData.totalParts,
      extractedImages: extractedImages,
      rawTextractData: textractResult // For debugging
    });

  } catch (error) {
    console.error('Error processing PDF with Textract:', error);
    res.status(500).json({ 
      error: 'Failed to process PDF', 
      details: error.message 
    });
  }
});

// Process Textract results to extract part information
async function processTextractResults(textractResult, fileName) {
  const blocks = textractResult.Blocks;
  const allParts = [];
  let currentPart = {};
  
  // Extract text content
  const textContent = blocks
    .filter(block => block.BlockType === 'LINE')
    .map(block => block.Text)
    .join(' ');

  console.log('Extracted text content:', textContent.substring(0, 500) + '...');

  // Process tables to extract part information
  const tables = extractTablesFromBlocks(blocks);
  
  for (const table of tables) {
    const parts = parsePartsTable(table);
    allParts.push(...parts);
  }

  // Look for specific patterns in the text
  const patterns = {
    partName: /(?:VALVE|SEAL|SPRING|LOCK|RETAINER|SEAT|ROCKER|SCREW|NUT|PLATE|SHAFT|BOLT)[^,\n]*/gi,
    referenceNumber: /(\d{1,2})\s+([A-Z0-9-]+)/g,
    catalogNumber: /([A-Z0-9]{2,}-[A-Z0-9]+)/g,
    description: /VALVE[^,\n]*/gi
  };

  // Extract the first matching part (you might want to make this more sophisticated)
  let partInfo = null;
  if (allParts.length > 0) {
    partInfo = allParts[0]; // Use the first part found in tables
  } else {
    // Fallback to pattern matching if no table data found
    const partNameMatch = textContent.match(patterns.partName);
    const refNumberMatch = textContent.match(patterns.referenceNumber);
    const catalogMatch = textContent.match(patterns.catalogNumber);
    const descriptionMatch = textContent.match(patterns.description);

    if (partNameMatch || refNumberMatch || catalogMatch) {
      partInfo = {
        partName: partNameMatch ? partNameMatch[0].trim() : '',
        referenceNumber: refNumberMatch ? refNumberMatch[0].split(' ')[0] : '',
        catalogNumber: catalogMatch ? catalogMatch[0] : '',
        description: descriptionMatch ? descriptionMatch[0].trim() : ''
      };
    }
  }

  return {
    partInfo,
    allParts,
    totalParts: allParts.length,
    textContent
  };
}

// Extract tables from Textract blocks
function extractTablesFromBlocks(blocks) {
  const tables = [];
  const tableBlocks = blocks.filter(block => block.BlockType === 'TABLE');
  
  for (const tableBlock of tableBlocks) {
    const table = {
      id: tableBlock.Id,
      rows: []
    };
    
    // Get cells for this table
    const cells = blocks.filter(block => 
      block.BlockType === 'CELL' && 
      block.Relationships &&
      block.Relationships.some(rel => rel.Type === 'CHILD')
    );
    
    // Group cells by row
    const rowMap = {};
    cells.forEach(cell => {
      const rowIndex = cell.RowIndex || 0;
      if (!rowMap[rowIndex]) {
        rowMap[rowIndex] = [];
      }
      
      // Get text content for this cell
      const cellText = getCellText(cell, blocks);
      rowMap[rowIndex][cell.ColumnIndex || 0] = cellText;
    });
    
    // Convert to array format
    Object.keys(rowMap).forEach(rowIndex => {
      table.rows.push(rowMap[rowIndex]);
    });
    
    tables.push(table);
  }
  
  return tables;
}

// Get text content for a cell
function getCellText(cell, blocks) {
  if (!cell.Relationships) return '';
  
  const childIds = cell.Relationships
    .filter(rel => rel.Type === 'CHILD')
    .flatMap(rel => rel.Ids);
  
  const childBlocks = blocks.filter(block => childIds.includes(block.Id));
  
  return childBlocks
    .filter(block => block.BlockType === 'WORD')
    .map(block => block.Text)
    .join(' ');
}

// Parse parts information from table data
function parsePartsTable(table) {
  const parts = [];
  
  if (table.rows.length < 2) return parts; // Need at least header + data
  
  // Assume first row is header, find column indices
  const headers = table.rows[0].map(h => h ? h.toLowerCase() : '');
  const refColIndex = headers.findIndex(h => h.includes('ref') || h.includes('no'));
  const partColIndex = headers.findIndex(h => h.includes('part') && h.includes('no'));
  const descColIndex = headers.findIndex(h => h.includes('description'));
  
  // Process data rows
  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    
    if (row.length > 2 && row.some(cell => cell && cell.trim())) {
      const part = {
        referenceNumber: refColIndex >= 0 && row[refColIndex] ? row[refColIndex].trim() : '',
        catalogNumber: partColIndex >= 0 && row[partColIndex] ? row[partColIndex].trim() : '',
        partName: descColIndex >= 0 && row[descColIndex] ? row[descColIndex].trim() : '',
        description: descColIndex >= 0 && row[descColIndex] ? row[descColIndex].trim() : ''
      };
      
      // Only add if we have at least some meaningful data
      if (part.referenceNumber || part.catalogNumber || part.partName) {
        parts.push(part);
      }
    }
  }
  
  return parts;
}

// Extract images from PDF (this is a simplified version)
// You might want to use a more sophisticated library like pdf-poppler or pdf2pic
async function extractImagesFromPdf(pdfBuffer) {
  try {
    // This is a placeholder - you'll need to implement actual image extraction
    // You could use libraries like pdf-poppler, pdf2pic, or pdf-lib
    
    // For now, we'll return empty array
    return [];
    
    // Example implementation with pdf-poppler would look like:
    /*
    const poppler = require('pdf-poppler');
    const options = {
      format: 'png',
      out_dir: path.join(__dirname, '../temp'),
      out_prefix: `pdf_page_${uuidv4()}`,
      page: null // Convert all pages
    };
    
    const tempPdfPath = path.join(__dirname, '../temp', `temp_${uuidv4()}.pdf`);
    await fs.writeFile(tempPdfPath, pdfBuffer);
    
    const images = await poppler.convert(tempPdfPath, options);
    
    // Clean up temp file
    await fs.unlink(tempPdfPath);
    
    return images;
    */
  } catch (error) {
    console.error('Error extracting images:', error);
    return [];
  }
}

// Advanced part lookup endpoint - searches for specific part by reference number
router.post('/lookup-part', authenticateToken, async (req, res) => {
  try {
    const { partNumber, pdfData } = req.body;
    
    if (!pdfData || !partNumber) {
      return res.status(400).json({ error: 'Part number and PDF data required' });
    }

    const pdfBuffer = Buffer.from(pdfData, 'base64');
    
    const textractParams = {
      Document: {
        Bytes: pdfBuffer
      },
      FeatureTypes: ['TABLES', 'FORMS']
    };

    const textractResult = await textract.analyzeDocument(textractParams).promise();
    const processedData = await processTextractResults(textractResult);
    
    // Find specific part by reference number
    const foundPart = processedData.allParts.find(part => 
      part.referenceNumber === partNumber || 
      part.catalogNumber === partNumber
    );
    
    if (foundPart) {
      res.json({
        success: true,
        partInfo: foundPart,
        found: true
      });
    } else {
      res.json({
        success: true,
        partInfo: null,
        found: false,
        message: `Part ${partNumber} not found in the manual`
      });
    }

  } catch (error) {
    console.error('Error looking up part:', error);
    res.status(500).json({ 
      error: 'Failed to lookup part', 
      details: error.message 
    });
  }
});

// Get all parts from a PDF
router.post('/get-all-parts', authenticateToken, async (req, res) => {
  try {
    const { pdfData } = req.body;
    
    if (!pdfData) {
      return res.status(400).json({ error: 'PDF data required' });
    }

    const pdfBuffer = Buffer.from(pdfData, 'base64');
    
    const textractParams = {
      Document: {
        Bytes: pdfBuffer
      },
      FeatureTypes: ['TABLES', 'FORMS']
    };

    const textractResult = await textract.analyzeDocument(textractParams).promise();
    const processedData = await processTextractResults(textractResult);
    
    res.json({
      success: true,
      parts: processedData.allParts,
      totalParts: processedData.totalParts,
      summary: {
        valves: processedData.allParts.filter(p => p.partName.toLowerCase().includes('valve')).length,
        seals: processedData.allParts.filter(p => p.partName.toLowerCase().includes('seal')).length,
        springs: processedData.allParts.filter(p => p.partName.toLowerCase().includes('spring')).length,
        other: processedData.allParts.filter(p => !['valve', 'seal', 'spring'].some(type => 
          p.partName.toLowerCase().includes(type))).length
      }
    });

  } catch (error) {
    console.error('Error getting all parts:', error);
    res.status(500).json({ 
      error: 'Failed to get parts list', 
      details: error.message 
    });
  }
});

module.exports = router;