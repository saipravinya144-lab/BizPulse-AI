import API_BASE_URL from '../utils/api'


const API_URL = `${API_BASE_URL}/api/reports`

export const getBusinessReports = async () => {
  const token = localStorage.getItem('token')

  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch business reports.')
  }

  return data
}
