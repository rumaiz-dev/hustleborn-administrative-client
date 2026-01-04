
import api from "../utils/api";

export const getSalesData = async ({ startDate, endDate } = {}) => {
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/api/v1/dashboard/sales-analytics?${params.toString()}`);
    return response.data;
};

export const getTopSellingProducts = async ({ startDate, endDate } = {}) => {
    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(`/api/v1/dashboard/top-selling?${params.toString()}`);
    return response.data;
};

export const getAllPendingPayments = async () => {
    try {
        const response = await api.get("/api/v3/vendor-payments/money-recieved/total");
        return response.data;
    } catch (error) {
        console.error("Error fetching pending vendor payments:", error);
        throw error;
    }
}


export const getVendorOrderStatusesCount = async ({ startDate, endDate }) => {

    const params = new URLSearchParams();

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    try {
        const response = await api.get(`/api/v1/dashboard/status-count?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching vendor order statuses count:", error);
        throw error;
    }
}