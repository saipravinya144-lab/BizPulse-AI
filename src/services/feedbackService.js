
const API_URL = 'http://localhost:5000/api/feedback'

const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.')
  }

  return data
}

// Fetch all customer feedback
export const getFeedback = async () => {
  return makeRequest('')
}

// Add new feedback
export const createFeedback = async (feedbackData) => {
  return makeRequest('', {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  })
}

// Update existing feedback
export const updateFeedback = async (feedbackId, feedbackData) => {
  return makeRequest(`/${feedbackId}`, {
    method: 'PUT',
    body: JSON.stringify(feedbackData),
  })
}

// Delete feedback
export const deleteFeedback = async (feedbackId) => {
  return makeRequest(`/${feedbackId}`, {
    method: 'DELETE',
  })
}

// Analyse feedback using Gemini AI
export const analyseFeedback = async (feedbackId) => {
  return makeRequest(`/${feedbackId}/analyse`, {
    method: 'POST',
  })
}
