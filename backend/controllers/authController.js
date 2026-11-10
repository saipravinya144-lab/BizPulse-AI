
const User = require('../models/User')
const Business = require('../models/Business')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// Generate login token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      businessId: user.businessId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Register a new user and business
const register = async (req, res) => {
  try {
    const { name, email, password, businessName, industry } = req.body

    if (!name || !email || !password || !businessName || !industry) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    })

    try {
      const business = await Business.create({
        name: businessName,
        industry,
        owner: user._id,
      })

      user.businessId = business._id
      await user.save()

      const token = generateToken(user)

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          businessId: user.businessId,
        },
      })
    } catch (error) {
      await User.findByIdAndDelete(user._id)
      throw error
    }
  } catch (error) {
    console.error('Registration error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to register account.',
    })
  }
}

// Log in an existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      })
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      })
    }

    const token = generateToken(user)

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        businessId: user.businessId,
      },
    })
  } catch (error) {
    console.error('Login error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to log in.',
    })
  }
}

module.exports = { register, login }
