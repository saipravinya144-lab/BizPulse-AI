
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const connectDB = require('./config/db')

const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const salesRoutes = require('./routes/salesRoutes')
const feedbackRoutes = require('./routes/feedbackRoutes')
const assistantRoutes = require('./routes/assistantRoutes')
const marketingRoutes = require('./routes/marketingRoutes')
const reportRoutes = require('./routes/reportRoutes')
const settingsRoutes = require('./routes/settingsRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to BizPulse AI Backend!',
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/feedback', feedbackRoutes)
app.use('/api/assistant', assistantRoutes)
app.use('/api/marketing', marketingRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/settings', settingsRoutes)

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    app.listen(PORT, () => {
      console.log(`BizPulse AI server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Server startup failed:', error.message)
    process.exit(1)
  }
}

startServer()
