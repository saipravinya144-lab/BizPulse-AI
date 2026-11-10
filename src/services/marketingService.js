import API_BASE_URL from '../utils/api'


const API_URL = `${API_BASE_URL}/api/marketing`

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

// Generate AI marketing content
export const generateMarketingContent = async (contentData) =>
  makeRequest('/generate', {
    method: 'POST',
    body: JSON.stringify(contentData),
  })

// Retrieve saved marketing content
export const getMarketingHistory = async () =>
  makeRequest('/')

// Delete saved marketing content
export const deleteMarketingContent = async (contentId) =>
  makeRequest(`/${contentId}`, {
    method: 'DELETE',
  })
