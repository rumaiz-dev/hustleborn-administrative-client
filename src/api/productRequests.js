import api from "../utils/api";

export const getProducts = async (payload) => {
  try {
    const response = await api.get("/api/products", {
      params: payload,
    });

    return response.data;
  } catch (err) {
    throw new Error("Failed to fetch products: " + err.message);
  }
};

export const createProduct = async (payload) => {
  try {
    const response = await api.post("/api/products", {
      payload,
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to create product: " + error.message);
  }
};

export const checkCode = async (codes) => {
  try {
    const response = await api.get("/api/products/codes", {
      params: { codes },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to check code: " + error.message);
  }
};
