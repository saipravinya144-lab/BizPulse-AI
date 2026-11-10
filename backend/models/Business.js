
const mongoose = require('mongoose')

const businessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },

    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Business', businessSchema)
