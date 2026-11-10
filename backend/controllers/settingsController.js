
const mongoose = require('mongoose')
const User = require('../models/User')
const Business = require('../models/Business')
const bcrypt = require('bcryptjs')

// @desc Get account and business settings
// @route GET /api/settings
// @access Private
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email businessId')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    const business = user.businessId
      ? await Business.findOne({
          _id: user.businessId,
          owner: user._id,
        })
      : null

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found.',
      })
    }

    res.status(200).json({
      success: true,
      settings: {
        account: {
          name: user.name,
          email: user.email,
        },
        business: {
          name: business.name,
          industry: business.industry,
          description: business.description,
        },
      },
    })
  } catch (error) {
    console.error('Get settings error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings.',
    })
  }
}

// @desc Update account details
// @route PUT /api/settings/account
// @access Private
const updateAccountSettings = async (req, res) => {
  try {
    const { name, email } = req.body

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof email !== 'string' ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid name and email are required.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const emailUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user.id },
    })

    if (emailUser) {
      return res.status(409).json({
        success: false,
        message: 'This email address is already in use.',
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(),
        email: normalizedEmail,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select('name email')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Account details updated successfully.',
      account: {
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Update account error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to update account details.',
    })
  }
}

// @desc Update business profile
// @route PUT /api/settings/business
// @access Private
const updateBusinessSettings = async (req, res) => {
  try {
    const { name, industry, description } = req.body

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      typeof industry !== 'string' ||
      !industry.trim() ||
      (description !== undefined && typeof description !== 'string')
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid business name and industry are required.',
      })
    }

    const user = await User.findById(req.user.id)
      .select('businessId')

    if (!user || !user.businessId) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found.',
      })
    }

    const business = await Business.findOneAndUpdate(
      {
        _id: user.businessId,
        owner: user._id,
      },
      {
        name: name.trim(),
        industry: industry.trim(),
        description: description?.trim() || '',
      },
      {
        new: true,
        runValidators: true,
      }
    )

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Business profile updated successfully.',
      business: {
        name: business.name,
        industry: business.industry,
        description: business.description,
      },
    })
  } catch (error) {
    console.error('Update business error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to update business profile.',
    })
  }
}

// @desc Change account password
// @route PUT /api/settings/password
// @access Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (
      typeof currentPassword !== 'string' ||
      typeof newPassword !== 'string' ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: 'Current and new passwords are required.',
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 8 characters.',
      })
    }

    const user = await User.findById(req.user.id).select('+password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      })
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      })
    }

    const salt = await bcrypt.genSalt(12)
    user.password = await bcrypt.hash(newPassword, salt)

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    })
  } catch (error) {
    console.error('Change password error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to change password.',
    })
  }
}

module.exports = {
  getSettings,
  updateAccountSettings,
  updateBusinessSettings,
  changePassword,
}
