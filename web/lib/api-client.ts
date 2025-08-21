const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080'
const API_TOKEN = process.env.API_TOKEN || '69415f14b56ccabe8cc5ec8cf5d5a2d2dc2ac66f0bb9859484dd5f8ce7ae2d2a'

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    })
    return response
  },

  post: async (endpoint: string, body?: unknown) => {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    return response
  },

  put: async (endpoint: string, body?: unknown) => {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    return response
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
    })
    return response
  },
}
