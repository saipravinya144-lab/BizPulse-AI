
const mongoose = require('mongoose')

const saleSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },

    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    customerName: {
      type: String,
      trim: true,
      default: 'Walk-in Customer',
    },

    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ['Cash', 'Card', 'UPI', 'Online', 'Other'],
      default: 'Other',
    },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },

    source: {
      type: String,
      enum: ['manual', 'csv'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
)

saleSchema.index({ business: 1, saleDate: -1 })
saleSchema.index({ business: 1, product: 1 })

module.exports = mongoose.model('Sale', saleSchema)
