
const express = require('express')

const {
  getSettings,
  updateAccountSettings,
  updateBusinessSettings,
  changePassword,
} = require('../controllers/settingsController')

const { protect } = require('../middleware/authMiddleware')

const router = express.Router()

// Protect all settings routes
router.use(protect)

// Get account and business settings
router.get('/', getSettings)

// Update personal account details
router.put('/account', updateAccountSettings)

// Update business profile
router.put('/business', updateBusinessSettings)

// Change account password
router.put('/password', changePassword)

module.exports = router
