import axios from 'axios'
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


export const fetchProducts = async () => {
  const response = await axios.get(BASE_URL + '/products/')
  return response.data
}

export const fetchProductDetails = async (id: string) => {
  const response = await axios.get(BASE_URL + `/products/${id}/`)
  return response.data
}