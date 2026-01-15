import api from "../utils/api";

export const getProducts = async (payload) => {
  try {
    const response = await api.get("/api/products/identity-filtered", {
      params: payload,
    });

    return response.data;
  } catch (err) {
    throw new Error("Failed to fetch products: " + err.message);
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get("/api/products", {
      params: id,
    });

    return response.data;
  } catch (err) {
    throw new Error("Failed to fetch products: " + err.message);
  }
};

export const getProductStatuses = async () => {
  try {
    const response = await api.get("/api/products/statuses");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch Product Statuses");
  }
};

export const getStockStatuses = async () => {
  try {
    const response = await api.get("/api/products/stock-statuses");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch stock statuses");
  }
};

export const getTypes = async () => {
  try {
    const response = await api.get(`/api/products/types`);
    return response.data;
  } catch (error) {
    throw new Error("failed to fetch product types");
  }
};

export const createProduct = async (payload) => {
  try {
    const response = await api.post("/api/products", payload);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create product: " + error.message);
  }
};

export const createProductVariants = async (payload) => {
  try {
    const response = await api.post(`/api/products/variation`, payload);
    return response.data;
  } catch (error) {
    throw new Error("Failed to create variant products product: " + error.message);
  }
};

export const updateProduct = async (payload, id) => {
  try {
    const alignedPayload = {
      parentId: payload.parentId,
      name: payload.name,
      description: payload.description,
      type: payload.productType,
      status: payload.status,
      sku: payload.sku,
      code: payload.code,
      on_sale: payload.on_sale,
      stock_quantity: payload.stock_quantity,
      manage_stock: payload.manage_stock,
      regular_price: payload.price,
      short_description: payload.short_description,
      sale_price: payload.sale_price,
      stock_status: payload.stock_status,
      slug: payload.slug,
      purchasable: payload.purchasable,
      weight: payload.weight,
      categories: payload.categories,
      meta_data: payload.meta_data,
      attributes: payload.attributes,
      purchasingPrice: payload.purchasingPrice,
      dimensions: payload.dimensions,
      quantity: payload.quantity,
    };
    const response = await api.patch(`/api/products/${id}`, {
      body: alignedPayload,
    });

    return response.data;
  } catch (error) {
    throw new Error("Failed to update product" + error.message);
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
