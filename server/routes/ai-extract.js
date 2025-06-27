const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = './uploads/catalogs/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// AI extraction endpoint
router.post('/extract-part-info', upload.single('catalog'), async (req, res) => {
    try {
        const { partName, partNumber, referenceNumber } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF catalog uploaded' });
        }

        // Parse PDF
        const pdfBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(pdfBuffer);
        const pdfText = pdfData.text;

        // Create AI prompt for motorcycle parts extraction
        const prompt = `
You are an expert at extracting motorcycle parts information from catalog documents.

SEARCH CRITERIA:
- Part Name: ${partName || 'Not provided'}
- Part Number: ${partNumber || 'Not provided'}
- Reference Number: ${referenceNumber || 'Not provided'}

CATALOG TEXT:
${pdfText.substring(0, 15000)} // Limit text to avoid token limits

TASK:
Find the motorcycle part matching the search criteria and extract the following information in JSON format:

{
    "found": true/false,
    "partDescription": "Detailed description of the part including specifications, materials, and features",
    "partImage": "Description of any diagrams, images, or visual references mentioned for this part",
    "additionalInfo": {
        "compatibility": "List of compatible motorcycle models",
        "specifications": "Technical specifications (dimensions, weight, material, etc.)",
        "price": "Price if mentioned",
        "category": "Part category (e.g., Braking System, Engine, Suspension, etc.)"
    },
    "confidence": "High/Medium/Low - how confident you are in the match"
}

RULES:
1. Only extract information for the EXACT part requested
2. If multiple similar parts exist, choose the one that best matches ALL provided criteria
3. If no exact match is found, set "found": false
4. Be specific and detailed in descriptions
5. Include all relevant technical specifications
6. If images/diagrams are referenced, describe their content and location in the catalog

Return only valid JSON.`;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a motorcycle parts catalog expert. Extract information accurately and return only valid JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.1,
            max_tokens: 1000
        });

        const aiResponse = completion.choices[0].message.content;
        
        // Parse AI response
        let extractedInfo;
        try {
            extractedInfo = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response:', aiResponse);
            return res.status(500).json({ 
                error: 'Failed to parse AI response',
                rawResponse: aiResponse 
            });
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        // Return extracted information
        res.json({
            success: true,
            data: extractedInfo,
            searchCriteria: {
                partName,
                partNumber,
                referenceNumber
            }
        });

    } catch (error) {
        console.error('AI extraction error:', error);
        
        // Clean up file if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ 
            error: 'Failed to extract part information',
            details: error.message 
        });
    }
});

// Alternative endpoint for pre-uploaded catalogs
router.post('/extract-from-existing', async (req, res) => {
    try {
        const { partName, partNumber, referenceNumber, catalogPath } = req.body;
        
        if (!catalogPath || !fs.existsSync(catalogPath)) {
            return res.status(400).json({ error: 'Catalog file not found' });
        }

        // Similar extraction logic but using existing file
        const pdfBuffer = fs.readFileSync(catalogPath);
        const pdfData = await pdfParse(pdfBuffer);
        const pdfText = pdfData.text;

        // Same AI processing as above...
        // (Implement similar logic to avoid code duplication)
        
        res.json({ message: 'Extraction from existing catalog - implement similar logic' });
        
    } catch (error) {
        console.error('Extraction error:', error);
        res.status(500).json({ error: 'Failed to extract from existing catalog' });
    }
});

module.exports = router;