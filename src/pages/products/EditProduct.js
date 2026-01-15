import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getCategories } from "../../api/categoryRequests";
import { updateProduct, getProductById } from "../../api/productRequests";
import RichTextField from "../../components/textEditor/RichText";
import { CheckBox } from "../../components/multiselectcheckbox";
import { useNavigate } from "react-router-dom";
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from "@coreui/react";
import { CIcon } from "@coreui/icons-react";
import { cilOptions } from "@coreui/icons";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { facebookCategories } from "../../constants/facebookCategories";
import { toast } from "react-toastify";

const EditProduct = () => {
  const { id: productId } = useParams();
  const [categories, setCategories] = useState([]);
  const [subCategoryData, setSubCategoryData] = useState({});
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
    metaCategoryTag: "",
    weight: "",
    warranty: "",
    category: [],
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
    subCategories: [],
    sku: "",
    code: "",
    parentId: "null",
  });
  console.log("Form", form);
  const [attributes, setAttributes] = useState([]);
  const [newAttributes, setNewAttributes] = useState([]);
  const [attribute, setAttribute] = useState({
    keyName: "",
    value: "",
    position: "",
  });
  const [variations, setVariations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingAttribute, setEditingAttribute] = useState({
    keyName: "",
    value: "",
    position: "",
  });
  const navigate = useNavigate();

  const [webpCover, setWebpCover] = useState(null);
  const [existingWebpCover, setExistingWebpCover] = useState(null);

  const [productState, setProductState] = useState(null);

  const removeAttribute = (idx, isNew = false) => {
    if (isNew) {
      setNewAttributes((prev) => prev.filter((_, i) => i !== idx));
    } else {
      setAttributes((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleEditClick = (index, attr, isNew = false) => {
    if (
      editingIndex?.index === index &&
      editingIndex?.isNew === isNew &&
      JSON.stringify(editingAttribute) === JSON.stringify(attr)
    ) {
      return;
    }

    setEditingIndex({ index, isNew });
    setEditingAttribute({ ...attr });
  };

  const handleSaveEdit = () => {
    if (!editingAttribute.keyName?.trim() || !editingAttribute.value?.trim())
      return;

    const updatedAttribute = {
      ...editingAttribute,
      position: Number(editingAttribute.position) || 0,
    };

    if (editingIndex.isNew) {
      setNewAttributes((prev) =>
        prev.map((attr, i) =>
          i === editingIndex.index ? updatedAttribute : attr,
        ),
      );
    } else {
      setAttributes((prev) =>
        prev.map((attr, i) =>
          i === editingIndex.index ? updatedAttribute : attr,
        ),
      );
    }

    setEditingIndex(null);
    setEditingAttribute({ keyName: "", value: "", position: "" });
  };

  const handleCancelEdit = () => {
    if (editingIndex?.isNew) {
      const updated = [...newAttributes];
      updated.splice(editingIndex.index, 1);
      setNewAttributes(updated);
    }
    setEditingIndex(null);
    setEditingAttribute(null);
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getProductById(productId);
        const product = data.product;
        const productDetails = data;
        const initialSelectedCategories = [];
        const initialSelectedSubCategories = [];
        setProductState(product);

        if (product.category && Array.isArray(product.category)) {
          product.category.forEach((cat) => {
            if (cat.id === cat.parentId) {
              initialSelectedCategories.push(cat.id);
            } else {
              initialSelectedSubCategories.push(cat.id);
              if (!initialSelectedCategories.includes(cat.parentId)) {
                initialSelectedCategories.push(cat.parentId);
              }
            }
          });
        }

        setForm((prevForm) => ({
          ...prevForm,
          name: product.name || "",
          slug: product.slug || "",
          shortDesc: productDetails.shortDescription || "",
          description: productDetails.description || "",
          purchasePrice: product.purchasingPrice || "",
          regularPrice: product.regularPrice || "",
          salePrice: product.salePrice || "",
          stockStatus: product.stockStatus || "",
          stockQty: product.stockQuantity || "",
          productType: productDetails.type || "",
          productStatus: product.status || "",
          weight: productDetails.weight || "",
          warranty: productDetails.warranty || "",
          metaCategoryTag: productDetails.metaCategoryTag || "",
          category: initialSelectedCategories,
          subCategories: initialSelectedSubCategories,
          sku: product.sku || "",
          code: product.code || "",
          parentId: product.parentId || "",
          dimensions: {
            length: product.dimensions?.length || "",
            width: product.dimensions?.width || "",
            height: product.dimensions?.height || "",
          },
        }));
        console.log("ParentId : ", product.parentId);
        console.log("Name : ", product.name);
        console.log("Fetched full data : ", data);
        console.log("product.parentId : ", product.parentId);

        const fetchedAttributes = Object.values(
          productDetails.attributes || {},
        ).map((attr) => ({
          id: attr.id,
          keyName: attr.slug.replace(/-/g, " "),
          value: attr.options.join(","),
          position: attr.position.toString(),
        }));
        setAttributes(fetchedAttributes);
        setVariations(data.variations || []);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const handleNavigateCreateVariant = () => {
    if (!productId) {
      console.error("Product ID is not available.");
      return;
    }
    navigate(`/products/create-variant-product/${productId}`);
    console.log("Navigating to create variant for product ID:", productId);
  };

  useEffect(() => {
    const fetchAllCategoriesAndSubcategories = async () => {
      try {
        const categoryData = await getCategories();
        const categories = categoryData;
        const mainCategories = categories.filter(
          (cat) => cat.parent === cat.id,
        );
        const subCategoryMap = {};
        mainCategories.forEach((main) => {
          subCategoryMap[main.id] = [];
        });

        categories.forEach((cat) => {
          if (cat.parent !== cat.id && subCategoryMap[cat.parent]) {
            subCategoryMap[cat.parent].push(cat);
          }
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
    } else if (name === "dimensions") {
      const parts = value.split("*").map((v) => v.trim());
      setForm((f) => ({
        ...f,
        dimensions: {
          height: parts[0] || "",
          width: parts[1] || "",
          length: parts[2] || "",
        },
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

  const handleRichTextChange = (html) => {
    setForm((f) => ({ ...f, description: html }));
  };
  const handleShortDescRichTextChange = (html) => {
    setForm((f) => ({ ...f, shortDesc: html }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: form.name,
        description: form.description,
        type: form.productType,
        short_description: form.shortDesc,
        status: form.productStatus,
        regular_price: form.regularPrice,
        sale_price: form.salePrice,
        purchasingPrice: form.purchasePrice,
        on_sale: true,
        stock_quantity: parseInt(form.stockQty, 10),
        manage_stock: true,
        weight: form.weight,
        warranty: form.warranty,
        sku: form.sku,
        code: form.code,
        parentId: form.parentId,
        meta_category_tag: form.metaCategoryTag,
        categories: [...new Set([...form.category, ...form.subCategories])].map((id) => ({ id })),
        attributes: attributes.map((attr, index) => ({
          id: attr.id,
          name: attr.keyName.trim(),
          slug: attr.keyName.trim().toLowerCase().replace(/\s+/g, "-"),
          position: parseInt(attr.position || index, 10),
          visible: true,
          variation: form.productType === "variable",
          options: attr.value.split(",").map((v) => v.trim()),
        })),
        newAttributes: newAttributes.map((attr, index) => ({
          name: attr.keyName.trim(),
          slug: attr.keyName.trim().toLowerCase().replace(/\s+/g, "-"),
          position: parseInt(attr.position || attributes.length + index, 10),
          visible: true,
          variation: form.productType === "variable",
          options: attr.value.split(",").map((v) => v.trim()),
        })),
        dimensions: {
          length: form.dimensions.length || "",
          width: form.dimensions.width || "",
          height: form.dimensions.height || "",
        },
      };

      const createResponse = await updateProduct(productId, payload);
      console.log("Product created : ", createResponse);

      toast.success("Product updated successfully!");
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error("Failed to update product. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading product details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-5">{error}</div>;
  }

  console.log("Parent Id:", form.parentId);
  {
    console.log("form.parentId value:", form.parentId, typeof form.parentId);
  }

  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <form onSubmit={handleSubmit}>
        {form.productType === "variable" && (
          <div className="d-flex justify-content-end mb-0">
            <CDropdown variant="btn-group">
              <CDropdownToggle color="transparent" caret={false}>
                <CIcon icon={cilOptions} size="lg" />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={handleNavigateCreateVariant}>
                  Create Variant Products
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </div>
        )}

        <div className="row mb-3">
          <div className="mb-3 col-md-5">
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

          <div className="mb-3">
            <label className="form-label">Short Description</label>
            <RichTextField
              value={form.shortDesc}
              onChange={handleShortDescRichTextChange}
              placeholder="Enter short product description here..."
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <RichTextField
            value={form.description}
            onChange={handleRichTextChange}
            placeholder="Enter full product description here..."
          />
        </div>
        {form.productType === "variable" && (
          <div className="row mb-3">
            <div className="col-12">
              <label className="form-label">Categories</label>
              <div>
                {categories.map((category) => (
                  <div key={category.id} className="mb-2">
                    {/* Main Category Checkbox */}
                    <CheckBox
                      id={`category-${category.id}`}
                      label={category.name}
                      checked={form.category.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      color="primary"
                    />

                    {/* Subcategories */}
                    {form.category.includes(category.id) &&
                      subCategoryData[category.id]?.length > 0 && (
                        <div style={{ marginLeft: "24px", marginTop: "4px" }}>
                          {subCategoryData[category.id].map((subcategory) => (
                            <div key={subcategory.id} className="mb-1">
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
        )}

        <div className="row mb-3">
          <div className="col-md-3">
            <label htmlFor="meta category tag" className="form-label">
              Facebook Category
            </label>
            <select
              id="metaCategoryTag"
              name="metaCategoryTag"
              className="form-select"
              value={form.metaCategoryTag}
              onChange={handleChange}
              required
            >
              <option value="">Choose...</option>
              {facebookCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-3">
            <label htmlFor="purchasePrice" className="form-label">
              Your Price (LKR)
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
            <label htmlFor="regularPrice" className="form-label">
              Bigmall Regular Price (LKR)
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
          <div className="col-md-3">
            <label htmlFor="salePrice" className="form-label">
              Bigmall Selling Price (LKR)
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
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
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

          {form.productType === "variable" && (
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
                <option value="simple">Simple</option>
                <option value="variable">Parent</option>
              </select>
            </div>
          )}
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="publish">Publish</option>
              <option value="future">Future</option>
              <option value="trash">Trash</option>
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
            <div className="row gx-2 align-items-end">
              <div className="col-4">
                <label className="form-label small">Height</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="H"
                  name="height"
                  value={form.dimensions.height || ""}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "height",
                        value: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="col-4">
                <label className="form-label small">Width</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="W"
                  name="width"
                  value={form.dimensions.width || ""}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "width",
                        value: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="col-4">
                <label className="form-label small">Length</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="L"
                  name="length"
                  value={form.dimensions.length || ""}
                  onChange={(e) =>
                    handleChange({
                      target: {
                        name: "length",
                        value: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn bg-white text-success border border-success mb-3"
        >
          "Update Product"
        </button>
      </form>

      <CTable bordered striped hover responsive>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell scope="col">Key</CTableHeaderCell>
            <CTableHeaderCell scope="col">Value</CTableHeaderCell>
            <CTableHeaderCell scope="col">Position</CTableHeaderCell>
            <CTableHeaderCell scope="col">Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {/* Existing Attributes */}
          {attributes.map((attr, i) => {
            const isEditing = editingIndex?.index === i && !editingIndex.isNew;
            return (
              <CTableRow key={`attr-${i}`}>
                {isEditing ? (
                  <>
                    <CTableDataCell>
                      <input
                        value={editingAttribute.keyName}
                        onChange={(e) =>
                          setEditingAttribute((prev) => ({
                            ...prev,
                            keyName: e.target.value,
                          }))
                        }
                        className="form-control"
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <input
                        value={editingAttribute.value}
                        onChange={(e) =>
                          setEditingAttribute((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        className="form-control"
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <input
                        type="number"
                        value={editingAttribute.position}
                        onChange={(e) =>
                          setEditingAttribute((prev) => ({
                            ...prev,
                            position: e.target.value,
                          }))
                        }
                        className="form-control"
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={handleSaveEdit}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </CTableDataCell>
                  </>
                ) : (
                  <>
                    <CTableDataCell>{attr.keyName}</CTableDataCell>
                    <CTableDataCell>{attr.value}</CTableDataCell>
                    <CTableDataCell>{attr.position}</CTableDataCell>
                    <CTableDataCell>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditClick(i, attr, false)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeAttribute(i)}
                      >
                        Remove
                      </button>
                    </CTableDataCell>
                  </>
                )}
              </CTableRow>
            );
          })}

          {/* New Attributes */}
          {newAttributes.map((attr, i) => {
            const isEditing = editingIndex?.index === i && editingIndex.isNew;
            return (
              <CTableRow key={`new-${i}`}>
                {isEditing ? (
                  <>
                    <CTableDataCell>
                      <input
                        value={editingAttribute.keyName}
                        onChange={(e) =>
                          setEditingAttribute((prev) => ({
                            ...prev,
                            keyName: e.target.value,
                          }))
                        }
                        className="form-control"
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <input
                        value={editingAttribute.value}
                        onChange={(e) =>
                          setEditingAttribute((prev) => ({
                            ...prev,
                            value: e.target.value,
                          }))
                        }
                        className="form-control"
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <input
                        type="number"
                        value={editingAttribute.position}
                        onChange={(e) =>
                          setEditingAttribute((prev) => ({
                            ...prev,
                            position: e.target.value,
                          }))
                        }
                        className="form-control"
                      />
                    </CTableDataCell>
                    <CTableDataCell>
                      <button
                        className="btn btn-sm btn-primary me-2"
                        onClick={handleSaveEdit}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </CTableDataCell>
                  </>
                ) : (
                  <>
                    <CTableDataCell>{attr.keyName}</CTableDataCell>
                    <CTableDataCell>{attr.value}</CTableDataCell>
                    <CTableDataCell>{attr.position}</CTableDataCell>
                    <CTableDataCell>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditClick(i, attr, true)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeAttribute(i, true)}
                      >
                        Remove
                      </button>
                    </CTableDataCell>
                  </>
                )}
              </CTableRow>
            );
          })}
        </CTableBody>
      </CTable>

      {/* Add Attribute Button */}
      <button
        className="btn bg-white text-success border border-success"
        onClick={() => {
          const newAttr = { keyName: "", value: "", position: 0 };
          setNewAttributes((prev) => [...prev, newAttr]);
          setEditingAttribute(newAttr);
          setEditingIndex({ index: newAttributes.length, isNew: true });
        }}
      >
        + Add Attribute
      </button>

      {form.productType === "variable" && variations.length > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <h6 className="fw-bold mb-3">Variants</h6>
            {variations.map((variation, index) => (
              <div key={index} className="mb-4">
                <CTable bordered striped responsive align="middle">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Name</CTableHeaderCell>
                      <CTableHeaderCell>SKU</CTableHeaderCell>
                      <CTableHeaderCell>Code</CTableHeaderCell>
                      <CTableHeaderCell>Regular Price (LKR)</CTableHeaderCell>
                      <CTableHeaderCell>Sale Price (LKR)</CTableHeaderCell>
                      <CTableHeaderCell>Stock Quantity</CTableHeaderCell>
                      <CTableHeaderCell>Stock Status</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    <CTableRow key={variation.product.id}>
                      <CTableDataCell>{variation.product.name}</CTableDataCell>
                      <CTableDataCell>{variation.product.sku}</CTableDataCell>
                      <CTableDataCell>{variation.product.code}</CTableDataCell>
                      <CTableDataCell>
                        {variation.product.regularPrice?.toFixed(2)}
                      </CTableDataCell>
                      <CTableDataCell>
                        {variation.product.salePrice
                          ? variation.product.salePrice.toFixed(2)
                          : "—"}
                      </CTableDataCell>
                      <CTableDataCell>
                        {variation.product.stockQuantity}
                      </CTableDataCell>
                      <CTableDataCell>
                        {variation.product.stockStatus}
                      </CTableDataCell>
                    </CTableRow>
                  </CTableBody>
                </CTable>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProduct;
