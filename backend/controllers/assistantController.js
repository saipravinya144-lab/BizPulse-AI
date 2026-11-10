
const {
  getBusinessContext,
} = require('../services/businessContextService')

const {
  askBusinessAssistant,
} = require('../services/geminiService')

// Get business context for the AI assistant
const getAssistantContext = async (req, res) => {
  try {
    const businessId = req.user.businessId

    const businessContext = await getBusinessContext(businessId)

    res.status(200).json({
      success: true,
      message: 'Business context retrieved successfully.',
      context: businessContext,
    })
  } catch (error) {
    console.error('Assistant context error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to retrieve business information.',
    })
  }
}

// Ask a business question and receive an AI-generated answer
const askAssistant = async (req, res) => {
  try {
    const { question } = req.body

    if (
      !question ||
      typeof question !== 'string' ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid business question.',
      })
    }

    if (question.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Your question cannot exceed 1000 characters.',
      })
    }

    // Retrieve verified business information
    const businessId = req.user.businessId

    const businessContext = await getBusinessContext(businessId)

    // Generate an answer using Gemini
    const result = await askBusinessAssistant(
      question,
      businessContext
    )

    res.status(200).json({
      success: true,
      message: 'Business question answered successfully.',
      question: question.trim(),
      result,
    })
  } catch (error) {
    console.error('Assistant question error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to answer your business question right now.',
    })
  }
}

module.exports = {
  getAssistantContext,
  askAssistant,
}
