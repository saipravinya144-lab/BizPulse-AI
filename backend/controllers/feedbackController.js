
const Feedback = require('../models/Feedback')
const { analyseFeedbackText } = require('../services/geminiService')

// Create new customer feedback
const createFeedback = async (req, res) => {
  try {
    const { customerName, email, message, rating } = req.body

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Feedback message is required.',
      })
    }

    if (
      rating !== undefined &&
      (!Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.',
      })
    }

    const feedback = await Feedback.create({
      customerName:
        typeof customerName === 'string' && customerName.trim()
          ? customerName.trim()
          : 'Anonymous',
      email: typeof email === 'string' ? email.trim() : '',
      message: message.trim(),
      rating: rating === undefined ? undefined : Number(rating),
      business: req.user.businessId,
    })

    res.status(201).json({
      success: true,
      message: 'Customer feedback added successfully.',
      feedback,
    })
  } catch (error) {
    console.error('Create feedback error:', error.message)

    res.status(500).json({
      success: false,
      message: error.message || 'Unable to create feedback.',
    })
  }
}

// Get all feedback for the logged-in business
const getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      business: req.user.businessId,
    }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: feedback.length,
      feedback,
    })
  } catch (error) {
    console.error('Get feedback error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to fetch feedback.',
    })
  }
}

// Update existing feedback
const updateFeedback = async (req, res) => {
  try {
    const { customerName, email, message, rating } = req.body

    const updates = {}

    if (customerName !== undefined) {
      if (typeof customerName !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Customer name must be text.',
        })
      }
      updates.customerName = customerName.trim() || 'Anonymous'
    }

    if (email !== undefined) {
      if (typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email must be text.',
        })
      }
      updates.email = email.trim()
    }

    if (message !== undefined) {
      if (typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Feedback message cannot be empty.',
        })
      }

      updates.message = message.trim()

      // Previous AI analysis is no longer valid for changed feedback.
      updates.sentiment = 'unanalysed'
      updates.sentimentScore = undefined
      updates.aiSummary = ''
    }

    if (rating !== undefined) {
      if (
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5
      ) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5.',
        })
      }

      updates.rating = Number(rating)
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      })
    }

    const feedback = await Feedback.findOneAndUpdate(
      {
        _id: req.params.id,
        business: req.user.businessId,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    )

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Feedback updated successfully.',
      feedback,
    })
  } catch (error) {
    console.error('Update feedback error:', error.message)

    res.status(500).json({
      success: false,
      message: error.message || 'Unable to update feedback.',
    })
  }
}

// Delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOneAndDelete({
      _id: req.params.id,
      business: req.user.businessId,
    })

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully.',
    })
  } catch (error) {
    console.error('Delete feedback error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to delete feedback.',
    })
  }
}

// Analyse customer feedback using Gemini AI
const analyseFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({
      _id: req.params.id,
      business: req.user.businessId,
    })

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found.',
      })
    }

    const analysis = await analyseFeedbackText(feedback.message)

    feedback.sentiment = analysis.sentiment
    feedback.sentimentScore = analysis.sentimentScore
    feedback.aiSummary = analysis.summary

    await feedback.save()

    res.status(200).json({
      success: true,
      message: 'Feedback analysed successfully.',
      feedback,
    })
  } catch (error) {
    console.error('Feedback analysis error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to analyse feedback. Please try again.',
    })
  }
}

module.exports = {
  createFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  analyseFeedback,
}
