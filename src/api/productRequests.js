import api from "../utils/api";
import qs from 'qs';
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const createProduct = async (payload) => {
  try {
    const response = await api.post("/api/v3/product", payload);
    return response.data;
  } catch (err) {
    throw new Error("Failed to create product: " + err.message);
  }
}

export const createProductVariants = async (productId, data) => {
  try {
    const response = await api.post(`/api/v3/product/variant-product/${productId}`, data);
    return response.data;
  } catch (err) {
    throw new Error("Failed to submit product variants: " + err.message);
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await api.get(`public/products/${productId}`);
    return response.data;
  } catch (err) {
    throw new Error("Failed to fetch product: " + err.message);
  }
}

export const updateProduct = async (productId, payload) => {
  try {
    const response = await api.patch(`/api/v3/product/${productId}`, payload);
    return response.data;
  } catch (err) {
    throw new Error("Failed to update product: " + err.message);
  }
}

export const getProductDetails = async (productId) => {
  try {
    const response = await api.get(`/api/v3/product/${productId}`);
    return response.data;
  } catch (err) {
    throw new Error("Failed to get product: " + err.message);
  }
}

export const getVendorFilteredProducts = ({ page, size = 10, isParent = true, name, sku, code, status, startDate, endDate } = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("size", size);
  params.append("isParent", isParent);
  if (name) params.append("name", name);
  if (sku) params.append("sku", sku);
  if (code) params.append("code", code);
  if (status) params.append("status", status);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = api.get(`/api/v3/product/vendor-filtered?${params.toString()}`);
  return response;
};


export const checkIfCodeExists = async (codes) => {

  try {
    const response = await api.get(`/api/v3/product/code-exist`, {
      params: { codes },
      paramsSerializer: params => {
        return qs.stringify(params, { arrayFormat: 'repeat' });
      }
    });
    return response.data;
  } catch (err) {
    throw new Error("Failed to check if code exists: " + err.message);
  }

}

export const uploadWebpCover = async (webpFile) => {
  if (!webpFile) {
    throw new Error("No WebP file provided.");
  }
  try {
    const fd = new FormData();
    const ext = webpFile.name.split(".").pop();
    const keyName = `${uuidv4()}.${ext}`;

    fd.append("uploadFile", webpFile);

    const response = await axios.post(
      `${backendUrl}/public/v2/bigmall/objects/upload/webp?folderName=product-images-webp&keyName=${keyName}`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    console.log(" WebP cover uploaded : ", keyName);
    return keyName;
  } catch (err) {
    console.error(" WebP cover upload failed : ", err);
    throw err;
  }
};