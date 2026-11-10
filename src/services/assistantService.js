
import API_BASE_URL from '../utils/api'

// Common API request handler
const API_URL = `${API_BASE_URL}/api/assistant`

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

// Retrieve business context
export const getAssistantContext = async () =>
  makeRequest('/context')

// Ask the AI Business Assistant a question
export const askBusinessQuestion = async (question) =>
  makeRequest('/ask', {
    method: 'POST',
    body: JSON.stringify({ question }),
  })
