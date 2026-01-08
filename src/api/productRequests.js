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
