import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// SKU API
export const skuAPI = {
  getAll: () => api.get('/skus'),
  getById: (id: string) => api.get(`/skus/${id}`),
  create: (data: any) => api.post('/skus', data),
  update: (id: string, data: any) => api.put(`/skus/${id}`, data),
  delete: (id: string) => api.delete(`/skus/${id}`),
};

// Currency API
export const currencyAPI = {
  getAll: () => api.get('/currencies'),
  getByCode: (code: string) => api.get(`/currencies/${code}`),
  create: (data: any) => api.post('/currencies', data),
  updateRate: (code: string, rate: number) => api.patch(`/currencies/${code}/rate`, { exchange_rate: rate }),
};

// Customer API
export const customerAPI = {
  getAll: () => api.get('/customers'),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
};

// Order API
export const orderAPI = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => api.patch(`/orders/${id}/status`, { status }),
};

// Logistics API
export const logisticsAPI = {
  getAll: () => api.get('/logistics'),
  getByOrder: (orderId: string) => api.get(`/logistics/order/${orderId}`),
  create: (data: any) => api.post('/logistics', data),
  updateStatus: (id: string, status: string, actualDelivery?: Date) => 
    api.patch(`/logistics/${id}/status`, { status, actual_delivery: actualDelivery }),
  track: (trackingNumber: string) => api.get(`/logistics/track/${trackingNumber}`),
};

// Forecast API
export const forecastAPI = {
  getAll: () => api.get('/forecasts'),
  getBySku: (skuId: string) => api.get(`/forecasts/sku/${skuId}`),
  create: (data: any) => api.post('/forecasts', data),
  generate: (skuId: string, forecastDate: Date) => 
    api.post(`/forecasts/generate/${skuId}`, { forecast_date: forecastDate }),
};

// Import API
export const importAPI = {
  uploadSkus: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/skus', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCustomers: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/import/customers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getHistory: () => api.get('/import/history'),
};
