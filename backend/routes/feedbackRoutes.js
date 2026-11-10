
const express = require('express')

const {
  createFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  analyseFeedback,
} = require('../controllers/feedbackController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// All feedback routes require authentication
router.use(protect)

// Feedback CRUD
router.post('/', createFeedback)
router.get('/', getFeedback)
router.put('/:id', updateFeedback)
router.delete('/:id', deleteFeedback)

// Gemini AI feedback analysis
router.post('/:id/analyse', analyseFeedback)

module.exports = router
