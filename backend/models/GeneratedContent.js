
const mongoose = require('mongoose')

const generatedContentSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },

    platform: {
      type: String,
      enum: ['Instagram', 'Facebook', 'WhatsApp', 'General'],
      required: true,
    },

    contentType: {
      type: String,
      enum: ['Caption', 'Advertisement', 'Product Description', 'Promotion'],
      required: true,
    },

    audience: {
      type: String,
      trim: true,
      default: '',
    },

    prompt: {
      type: String,
      trim: true,
      default: '',
    },

    generatedText: {
      type: String,
      required: true,
    },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

generatedContentSchema.index({ business: 1, createdAt: -1 })

module.exports = mongoose.model(
  'GeneratedContent',
  generatedContentSchema
)
