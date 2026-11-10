const API_URL = 'http://localhost:5000/api/sales'

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

// Fetch all sales
export const getSales = async () => {
  return makeRequest('')
}

// Record a single sale
export const createSale = async (saleData) => {
  return makeRequest('', {
    method: 'POST',
    body: JSON.stringify(saleData),
  })
}

// Fetch one sale by ID
export const getSaleById = async (saleId) => {
  return makeRequest(`/${saleId}`)
}

// Import multiple sales from CSV-parsed rows
export const importSales = async (rows) => {
  return makeRequest('/import', {
    method: 'POST',
    body: JSON.stringify({ rows }),
  })
}