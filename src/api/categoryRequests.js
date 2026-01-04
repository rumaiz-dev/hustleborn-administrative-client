import api from "../utils/api";

export const getMainCategories = async () => {
    try {
        const response = await api.get("/api/v3/category/all");
        return response.data;
    } catch (error) {
        console.error("Error fetching main categories:", error);
        throw error;
    }
};

export const getSubCategories = async (categoryId) => {
    try {
        const response = await api.get(`/api/v3/category/sub?id=${categoryId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching subcategories:", error);
        throw error;
    }
};