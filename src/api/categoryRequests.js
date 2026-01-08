import api from "../utils/api";

export const getCategories = async () => {
    try {
        const response = await api.get("/api/product-categories");
        return response.data;
    } catch (error) {
        console.error("Error fetching main categories:", error);
        throw error;
    }
};