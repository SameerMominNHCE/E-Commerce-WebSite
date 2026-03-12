import apiClient from '../../../shared/api/client';

export const getAdminProducts = (params) => apiClient.get('/products', { params });
export const createProduct = (payload) => apiClient.post('/products', payload);
export const updateProduct = (id, payload) => apiClient.put(`/products/${id}`, payload);
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);

export const getAdminOrders = (params) => apiClient.get('/orders', { params });
export const updateAdminOrderStatus = (orderId, payload) =>
  apiClient.put(`/orders/${orderId}/status`, payload);
export const exportAdminOrdersCsvRequest = (params) =>
  apiClient.get('/orders/admin/export', { params, responseType: 'blob' });

export const getAdminStats = () => apiClient.get('/orders/admin/stats');
export const getRecentAdminOrders = (limit = 5) =>
  apiClient.get('/orders/admin/recent', { params: { limit } });
