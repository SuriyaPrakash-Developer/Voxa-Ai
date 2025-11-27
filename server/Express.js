require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const { GoogleGenAI } = require("@google/genai")

let AIDataModel
try {
    // FIX: correct path from `module` to `model`
    AIDataModel = require('./model/AIData.js')
} catch (err) {
    console.warn("AIData model not found, continuing without it:", err && err.message ? err.message : err)
}

const app = express()
app.use(express.json())
// Allow requests from the Vite dev server during development and other origins as needed
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "https://ai-voxa.vercel.app"] }))

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/AIData"
mongoose.connect(mongoURI).then(() => {
    console.log('⚡MongoDB connected ')
}).catch(err => {
    console.error(" 🚨MongoDB connection error:", err)
})

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
})

// Config endpoint to serve API key
app.get('/api/config', (_req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
        return res.status(500).json({ error: 'API key not configured on server' });
    }
    res.json({ apiKey })
})

// Signup (kept on both /signup and /api/signup for compatibility)
const handleSignup = async (req, res) => {
    try {
        if (!AIDataModel) {
            return res.status(500).json({ message: 'Data model not initialized' })
        }
        const { name, email, mobile, password } = req.body || {}
        if (!name || !email || !mobile || !password) {
            return res.status(400).json({ message: 'Missing required fields' })
        }
        const existing = await AIDataModel.findOne({ email }).lean()
        if (existing) {
            return res.status(409).json({ message: 'Email already registered' })
        }
        const created = await AIDataModel.create({ name, email, mobile, password })
        return res.status(201).json({ id: created._id, name, email, mobile })
    } catch (err) {
        console.error('Signup error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
app.post('/signup', handleSignup)
app.post('/api/signup', handleSignup)

// Login
app.post('/api/login', async (req, res) => {
    try {
        if (!AIDataModel) {
            return res.status(500).json({ message: 'Data model not initialized' })
        }
        const { email, password } = req.body || {}
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' })
        }
        const user = await AIDataModel.findOne({ email, password }).lean()
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        return res.json({ id: user._id, name: user.name, email: user.email, mobile: user.mobile })
    } catch (err) {
        console.error('Login error:', err)
        return res.status(500).json({ message: 'Internal server error' })
    }
})

const PORT = process.env.PORT || 3001
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`server is running on http://localhost:${PORT}`)
    })
}

module.exports = app