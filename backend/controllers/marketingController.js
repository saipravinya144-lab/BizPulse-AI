
const mongoose = require('mongoose')
const GeneratedContent = require('../models/GeneratedContent')
const Product = require('../models/Product')
const { getBusinessContext } = require('../services/businessContextService')
const { generateMarketingContent } = require('../services/geminiService')

// Generate AI marketing content
const generateContent = async (req, res) => {
  try {
    const {
      productId,
      platform,
      contentType,
      audience,
      prompt,
    } = req.body

    const validPlatforms = [
      'Instagram',
      'Facebook',
      'WhatsApp',
      'General',
    ]

    const validContentTypes = [
      'Caption',
      'Advertisement',
      'Product Description',
      'Promotion',
    ]

    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid marketing platform.',
      })
    }

    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid content type.',
      })
    }

    if (audience && typeof audience !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Audience must be valid text.',
      })
    }

    if (prompt && typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt must be valid text.',
      })
    }

    const businessId = req.user.businessId

    // Retrieve and verify the selected product
    let product = null

    if (productId) {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.',
        })
      }

      product = await Product.findOne({
        _id: productId,
        business: businessId,
      }).lean()

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Selected product was not found.',
        })
      }
    }

    // Retrieve verified business information
    const businessContext = await getBusinessContext(businessId)

    // Generate content using Gemini
    const generatedText = await generateMarketingContent({
      product,
      platform,
      contentType,
      audience: audience?.trim() || '',
      prompt: prompt?.trim() || '',
      businessContext,
    })

    // Save generated content to MongoDB
    const savedContent = await GeneratedContent.create({
      product: product?._id || null,
      platform,
      contentType,
      audience: audience?.trim() || '',
      prompt: prompt?.trim() || '',
      generatedText,
      business: businessId,
    })

    res.status(201).json({
      success: true,
      message: 'Marketing content generated successfully.',
      content: savedContent,
    })
  } catch (error) {
    console.error('Marketing generation error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to generate marketing content right now.',
    })
  }
}

// Get saved marketing content
const getGeneratedContent = async (req, res) => {
  try {
    const businessId = req.user.businessId

    const contents = await GeneratedContent.find({
      business: businessId,
    })
      .populate('product', 'name category price')
      .sort({ createdAt: -1 })
      .lean()

    res.status(200).json({
      success: true,
      message: 'Marketing content retrieved successfully.',
      count: contents.length,
      contents,
    })
  } catch (error) {
    console.error('Marketing history error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to retrieve marketing history.',
    })
  }
}

// Delete saved marketing content
const deleteGeneratedContent = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID.',
      })
    }

    const deletedContent = await GeneratedContent.findOneAndDelete({
      _id: id,
      business: req.user.businessId,
    })

    if (!deletedContent) {
      return res.status(404).json({
        success: false,
        message: 'Marketing content not found.',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Marketing content deleted successfully.',
    })
  } catch (error) {
    console.error('Marketing delete error:', error.message)

    res.status(500).json({
      success: false,
      message: 'Unable to delete marketing content.',
    })
  }
}

module.exports = {
  generateContent,
  getGeneratedContent,
  deleteGeneratedContent,
}
