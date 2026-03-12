import apiClient from '../../../shared/api/client';

export const createOrderRequest = (payload) => apiClient.post('/orders/create', payload);
export const getOrdersRequest = (params) => apiClient.get('/orders', { params });
export const getOrderByIdRequest = (orderId) => apiClient.get(`/orders/${orderId}`);
export const cancelOrderRequest = (orderId) => apiClient.put(`/orders/${orderId}/cancel`, {});
