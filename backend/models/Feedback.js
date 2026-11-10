
const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },

    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      trim: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },

    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'unanalysed'],
      default: 'unanalysed',
    },

    sentimentScore: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },

    aiSummary: {
      type: String,
      default: '',
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

feedbackSchema.index({ business: 1, createdAt: -1 })

module.exports = mongoose.model('Feedback', feedbackSchema)
