import { useState, useEffect } from "react";
import { getCategories } from "../../api/categoryRequests";
import RichTextField from "../../components/textEditor/RichText";
import {
  createProduct,
  checkCode,
  getProductStatuses,
  getStockStatuses,
  getTypes,
} from "../../api/productRequests";
import { Tooltip } from "react-tooltip";
import { CheckBox } from "../../components/multiselectcheckbox";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateProduct = () => {
  const [categories, setCategories] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState({});
  const [productStatuses, setProductStatuses] = useState([]);
  const [stockStatuses, setStockStatuses] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    shortDesc: "",
    description: "",
    purchasePrice: "",
    regularPrice: "",
    salePrice: "",
    stockStatus: "",
    stockQty: "",
    productType: "",
    productStatus: "",
    weight: "",
    warranty: "",
    category: [],
    subCategories: [],
    sku: "",
    code: "",
    dimensions: {
      height: "",
      width: "",
      length: "",
    },
  });
  const [attributes, setAttributes] = useState([]);
  const [attribute, setAttribute] = useState({
    keyName: "",
    value: "",
    position: "",
  });

  const handleAttributeChange = (e) => {
    const { name, value } = e.target;
    setAttribute((attr) => ({ ...attr, [name]: value }));
  };

  const handleAddAttribute = () => {
    if (!attribute.keyName || !attribute.value) return;
    setAttributes((list) => [...list, attribute]);
    setAttribute({ keyName: "", value: "", position: "" });
  };
  const removeAttribute = (idx) => {
    setAttributes((list) => list.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    const fetchAllCategoriesAndSubcategories = async () => {
      try {
        const categoryData = await getCategories();
        const categories = categoryData;
        const mainCategories = categories
          .filter((cat) => cat.parent === null)
          .sort((a, b) => a.name.localeCompare(b.name));
        const subCategoryMap = {};
        mainCategories.forEach((main) => {
          subCategoryMap[main.id] = [];
        });

        categories.forEach((cat) => {
          if (cat.parent !== null && subCategoryMap[cat.parent]) {
            subCategoryMap[cat.parent].push(cat);
          }
        });
        // Sort subcategories alphabetically
        Object.keys(subCategoryMap).forEach((mainId) => {
          subCategoryMap[mainId].sort((a, b) => a.name.localeCompare(b.name));
        });

        setCategories(mainCategories);
        setSubCategoryData(subCategoryMap);
      } catch (error) {
        console.error("Error fetching categories or subcategories:", error);
        alert("Failed to fetch categories or subcategories.");
      }
    };

    fetchAllCategoriesAndSubcategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statuses, stock, types] = await Promise.all([
          getProductStatuses(),
          getStockStatuses(),
          getTypes(),
        ]);
        setProductStatuses(statuses);
        setStockStatuses(stock);
        setProductTypes(types);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setForm((prevForm) => {
      const isSelected = prevForm.category.includes(categoryId);
      let updatedCategories;
      let updatedSubCategories = [...prevForm.subCategories];

      if (isSelected) {
        updatedCategories = prevForm.category.filter((id) => id !== categoryId);

        if (subCategoryData[categoryId]) {
          const subCategoryIdsToRemove = subCategoryData[categoryId].map(
            (subcat) => subcat.id,
          );

          updatedSubCategories = updatedSubCategories.filter(
            (subId) => !subCategoryIdsToRemove.includes(subId),
          );
        }
      } else {
        updatedCategories = [...prevForm.category, categoryId];
      }

      return {
        ...prevForm,
        category: updatedCategories,
        subCategories: updatedSubCategories,
      };
    });
  };

  const handleSubcategoryChange = (subcategoryId) => {
    setForm((prevForm) => {
      const isSelected = prevForm.subCategories.includes(subcategoryId);
      const updatedSubCategories = isSelected
        ? prevForm.subCategories.filter((id) => id !== subcategoryId)
        : [...prevForm.subCategories, subcategoryId];
      return {
        ...prevForm,
        subCategories: updatedSubCategories,
      };
    });
  };

  const makeSlug = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setForm((f) => ({
        ...f,
        name: value,
        slug: makeSlug(value),
      }));
    } else if (["height", "width", "length"].includes(name)) {
      setForm((f) => ({
        ...f,
        dimensions: {
          ...f.dimensions,
          [name]: value,
        },
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSlugChange = (e) => {
    const clean = e.target.value.replace(/[^a-z0-9\-]/g, "");
    setForm((f) => ({ ...f, slug: clean }));
  };

  const handleRichTextChange = (html) => {
    setForm((f) => ({ ...f, description: html }));
  };

  const handleRichTextShortDescChange = (html) => {
    setForm((f) => ({ ...f, shortDesc: html }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dimensionsObject = {
        height: form.dimensions.height || "0",
        width: form.dimensions.width || "0",
        length: form.dimensions.length || "0",
        weight: form.weight,
      };

      const payload = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDesc,
        slug: form.slug,
        code: form.code,
        sku:form.sku,
        price: parseFloat(form.regularPrice),
        purchasingPrice: parseFloat(form.purchasePrice),
        salePrice: parseFloat(form.salePrice),
        stockQuantity: parseInt(form.stockQty, 10),
        stockStatus: form.stockStatus,
        status: form.productStatus,
        variant: form.productType,
        attributes: attributes.map((attr) => ({
          name: attr.keyName,
          options: attr.value.split(",").map((v) => v.trim()),
          position: parseInt(attr.position || 0),
          visible: true,
          variation: true,
        })),

        dimensions: dimensionsObject,
        productType: form.productType,
        categories: [...new Set([...form.category, ...form.subCategories])].map((id) => ({ id })),
        parentId: null,
      };

      const response = await checkCode(form.code);

      const message = response.message;
      const duplicates = response.object || [];

      if (duplicates.length > 0) {
        toast.error(`${message}: ${duplicates.join(", ")}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
      console.log("Final payload:", payload);

      const createResponse = await createProduct(payload);
      console.log("Product created : ", createResponse);
      setForm((form) => ({
        ...form,
        name: "",
        slug: "",
        shortDesc: "",
        description: "",
        purchasePrice: "",
        regularPrice: "",
        salePrice: "",
        stockStatus: "",
        stockQty: "",
        productType: "",
        productStatus: "",
        facebookCategory: "",
        weight: "",
        warranty: "",
        category: [],
        subCategories: [],
        sku: "",
        code: "",
        dimensions: {
          height: "",
          width: "",
          length: "",
        },
        parentId: null,
        variant: false,
      }));
      setAttributes([]);
      setAttribute({ keyName: "", value: "", position: "" });
      setSubCategoryData({});
      setCategories([]);
      toast.success("Product created successfully!");
    } catch (err) {
      toast.error("Failed to create product: " + err.message);
    }
  };

  return (
    <div className="container ">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="name" className="form-label">
              Product Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="slug" className="form-label">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              className="form-control"
              value={form.slug}
              onChange={handleSlugChange}
              placeholder="url-friendly identifier"
              required
            />
          </div>
          <div className="col-mb-3">
            <label className="form-label">Short Description</label>
            <RichTextField
              value={form.shortDesc}
              onChange={handleRichTextShortDescChange}
              required
              placeholder="Enter full product short description here..."
            />
          </div>
        </div>

        <div className="col-mb-3">
          <label className="form-label">Description</label>
          <RichTextField
            value={form.description}
            onChange={handleRichTextChange}
            required
            placeholder="Enter full product description here..."
          />
        </div>

        <div className="row mb-3">
          <div className="col-12">
            <label className="form-label">Categories</label>
            <div>
              {categories.map((category) => (
                <div key={category.id}>
                  <CheckBox
                    id={`category-${category.id}`}
                    label={category.name}
                    checked={form.category.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    color="primary"
                  />
                  {form.category.includes(category.id) &&
                    subCategoryData[category.id] && (
                      <div style={{ marginLeft: "20px" }}>
                        {subCategoryData[category.id].map((subcategory) => (
                          <div key={subcategory.id}>
                            <CheckBox
                              id={`subcategory-${subcategory.id}`}
                              label={subcategory.name}
                              checked={form.subCategories.includes(
                                subcategory.id,
                              )}
                              onChange={() =>
                                handleSubcategoryChange(subcategory.id)
                              }
                              color="primary"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label htmlFor="purchasePrice" className="form-label">
              Your Price (LKR){" "}
              <i
                className="bi bi-info-circle-fill"
                data-tooltip-id="purchasePriceTooltip"
                data-tooltip-content="This is the price you paid for the product."
                style={{ cursor: "help" }}
              ></i>
            </label>
            <input
              id="purchasePrice"
              name="purchasePrice"
              type="number"
              className="form-control"
              value={form.purchasePrice}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="salePrice" className="form-label">
              Bigmall Customer Selling Price (LKR){" "}
              <i
                className="bi bi-info-circle-fill"
                data-tooltip-id="salePriceTooltip"
                data-tooltip-content="This is the discounted price at which the product will be sold to customers on Bigmall."
                style={{ cursor: "help" }}
              ></i>
            </label>
            <input
              id="salePrice"
              name="salePrice"
              type="number"
              className="form-control"
              value={form.salePrice}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
          <div className="col-md-3">
            <label htmlFor="regularPrice" className="form-label">
              Bigmall Customer Regular Price (LKR){" "}
              <i
                className="bi bi-info-circle-fill"
                data-tooltip-id="regularPriceTooltip"
                data-tooltip-content="This is the original, non-discounted price of the product for customers on Bigmall."
                style={{ cursor: "help" }}
              ></i>
            </label>
            <input
              id="regularPrice"
              name="regularPrice"
              type="number"
              className="form-control"
              value={form.regularPrice}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className="mb-3 col-md-3">
            <label htmlFor="stockStatus" className="form-label">
              Stock Status
            </label>
            <select
              id="stockStatus"
              name="stockStatus"
              className="form-select"
              value={form.stockStatus}
              onChange={handleChange}
              required
            >
              <option value="">Choose...</option>
              {stockStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 col-md-2">
            <label htmlFor="stockQty" className="form-label">
              Stock Quantity
            </label>
            <input
              id="stockQty"
              name="stockQty"
              type="number"
              className="form-control"
              value={form.stockQty}
              onChange={handleChange}
              min="0"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="mb-3 col-md-2">
            <label htmlFor="warranty" className="form-label">
              Warranty
            </label>
            <select
              id="warranty"
              name="warranty"
              className="form-select"
              value={form.warranty}
              onChange={handleChange}
            >
              <option value="">Choose...</option>
              <option value="checking">Checking</option>
              <option value="3_months">3 Months</option>
              <option value="6_months">6 Months</option>
              <option value="1_year">1 Year</option>
            </select>
          </div>

          <div className="mb-3 col-md-2">
            <label htmlFor="sku" className="form-label">
              SKU
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              className="form-control"
              value={form.sku}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 col-md-2">
            <label htmlFor="code" className="form-label">
              Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              className="form-control"
              value={form.code}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 col-md-2">
            <label htmlFor="productType" className="form-label">
              Product Type
            </label>
            <select
              id="productType"
              name="productType"
              className="form-select"
              value={form.productType}
              onChange={handleChange}
              required
            >
              <option value="">Choose...</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 col-md-2">
            <label htmlFor="productStatus" className="form-label">
              Product Status
            </label>
            <select
              id="productStatus"
              name="productStatus"
              className="form-select"
              value={form.productStatus}
              onChange={handleChange}
              required
            >
              <option value="">Choose...</option>
              {productStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3 col-md-2">
            <label htmlFor="weight" className="form-label">
              Weight (kg)
            </label>
            <input
              id="weight"
              name="weight"
              type="number"
              step="0.01"
              className="form-control"
              value={form.weight}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="mb-3 col-md-3">
            <label className="form-label">Dimensions (in cm)</label>
            <div className="row gx-2 align-items-end">
              <div className="col-4">
                <label className="form-label small">Height</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="H"
                  name="height"
                  value={form.dimensions.height}
                  onChange={handleChange}
                />
              </div>
              <div className="col-4">
                <label className="form-label small">Width</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="W"
                  name="width"
                  value={form.dimensions.width}
                  onChange={handleChange}
                />
              </div>
              <div className="col-4">
                <label className="form-label small">Length</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="L"
                  name="length"
                  value={form.dimensions.length}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
        {form.productType === "variable" && (
          <div className="row mt-5">
            <h6 className="fw-bold">Product Attributes</h6>
            <div className="row gx-3 gy-2 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Name</label>
                <input
                  name="keyName"
                  className="form-control"
                  value={attribute.keyName}
                  onChange={handleAttributeChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Values</label>
                <input
                  name="value"
                  className="form-control"
                  value={attribute.value}
                  onChange={handleAttributeChange}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Position</label>
                <input
                  name="position"
                  className="form-control"
                  value={attribute.position}
                  onChange={handleAttributeChange}
                />
              </div>
              <div className="col-md-1">
                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={handleAddAttribute}
                >
                  Add
                </button>
              </div>
            </div>

            {attributes.length > 0 && (
              <table className="table mt-4">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Values</th>
                    <th>Position</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((attr, i) => (
                    <tr key={i}>
                      <td>{attr.keyName}</td>
                      <td>{attr.value}</td>
                      <td>{attr.position}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeAttribute(i)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        <hr />

        <button type="submit" className="btn btn-success">
          Save Product
        </button>
      </form>

      <Tooltip id="purchasePriceTooltip" place="top" effect="solid" />
      <Tooltip id="salePriceTooltip" place="top" effect="solid" />
      <Tooltip id="regularPriceTooltip" place="top" effect="solid" />
    </div>
  );
};

export default CreateProduct;
