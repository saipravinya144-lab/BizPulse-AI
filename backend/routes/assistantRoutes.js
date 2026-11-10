
const express = require('express')

const {
  getAssistantContext,
  askAssistant,
} = require('../controllers/assistantController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// All assistant routes require authentication
router.use(protect)

// Retrieve business information
router.get('/context', getAssistantContext)

// Ask a business question
router.post('/ask', askAssistant)

module.exports = router
