// server.js - STREAMLINED FOR DRAG & DROP (NO AI NEEDED)
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
// No longer need @google/generative-ai or dotenv for this endpoint!

const app = express();
app.use(express.json());
app.use(express.static('public'));

const MODULE_PATH = path.join(__dirname, 'email-modules');
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'main-template.html');

// We rename the endpoint to reflect its new purpose
app.post('/api/build-email', async (req, res) => {
    // The request body now contains a 'modules' array, not a 'prompt'
    const { modules } = req.body;
    
    if (!modules || !Array.isArray(modules) || modules.length === 0) {
        return res.status(400).json({ error: 'Module array is required.' });
    }
    
    console.log("Received module list to build:", modules);

    try {
        // This logic is mostly the same, but it uses the array directly from the frontend
        const modulePromises = modules.map(name =>
            fs.readFile(path.join(MODULE_PATH, name), 'utf-8')
        );
        const moduleHtmls = await Promise.all(modulePromises);
        const combinedModules = moduleHtmls.join('\n');

        const template = await fs.readFile(TEMPLATE_PATH, 'utf-8');
        const finalHtml = template.replace('{{MODULES_HERE}}', combinedModules);

        res.json({ html: finalHtml });

    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: 'Sorry, something went wrong while building the email.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running! Open your browser and go to http://localhost:${PORT}`);
});