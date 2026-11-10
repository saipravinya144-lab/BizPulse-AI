
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0,
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

productSchema.index({ business: 1, name: 1 })

module.exports = mongoose.model('Product', productSchema)
