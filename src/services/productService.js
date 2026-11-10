const API_URL = 'http://localhost:5000/api/products'

// Get the saved login token
const getToken = () => {
  return localStorage.getItem('token')
}

// Common request function
const makeRequest = async (url, options = {}) => {
  const token = getToken()

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

// Get all products
export const getProducts = async () => {
  return makeRequest('')
}

// Add a new product
export const createProduct = async (productData) => {
  return makeRequest('', {
    method: 'POST',
    body: JSON.stringify(productData),
  })
}

// Update a product
export const updateProduct = async (productId, productData) => {
  return makeRequest(`/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  })
}

// Delete a product
export const deleteProduct = async (productId) => {
  return makeRequest(`/${productId}`, {
    method: 'DELETE',
  })
}