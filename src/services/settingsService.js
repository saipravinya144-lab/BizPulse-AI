import API_BASE_URL from '../utils/api'


const API_URL = `${API_BASE_URL}/api/settings`

// Get authentication token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Handle API responses
const handleResponse = async (response) => {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.')
  }

  return data
}

// Get account and business settings
export const getSettings = async () => {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  return handleResponse(response)
}

// Update account details
export const updateAccountSettings = async (accountData) => {
  const response = await fetch(`${API_URL}/account`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(accountData),
  })

  return handleResponse(response)
}

// Update business profile
export const updateBusinessSettings = async (businessData) => {
  const response = await fetch(`${API_URL}/business`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(businessData),
  })

  return handleResponse(response)
}

// Change account password
export const changePassword = async (passwordData) => {
  const response = await fetch(`${API_URL}/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(passwordData),
  })

  return handleResponse(response)
}
