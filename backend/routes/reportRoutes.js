
const express = require('express')

const {
  getBusinessReports,
} = require('../controllers/reportController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// All report routes require authentication
router.use(protect)

// Get business reports
router.get('/', getBusinessReports)

module.exports = router
