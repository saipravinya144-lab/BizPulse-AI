
const API_URL = 'http://localhost:5000/api/reports'

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
