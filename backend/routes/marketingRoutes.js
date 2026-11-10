
const express = require('express')

const {
  generateContent,
  getGeneratedContent,
  deleteGeneratedContent,
} = require('../controllers/marketingController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// All marketing routes require authentication
router.use(protect)

// Generate marketing content
router.post('/generate', generateContent)

// Retrieve saved marketing content
router.get('/', getGeneratedContent)

// Delete saved marketing content
router.delete('/:id', deleteGeneratedContent)

module.exports = router
