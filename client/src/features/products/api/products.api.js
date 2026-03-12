import apiClient from '../../../shared/api/client';

export const getProductsRequest = (params) => apiClient.get('/products', { params });
export const getProductByIdRequest = (id) => apiClient.get(`/products/${id}`);
