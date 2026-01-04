import { useState, useEffect } from "react";
import { getMainCategories } from "../../api/categoryRequests";
import RichTextField from "../../components/textEditor/RichText";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { createProduct, checkIfCodeExists } from "../../api/productRequests";
import { Tooltip } from "react-tooltip";
import { CheckBox } from "../../components/multiselectcheckbox";
import { facebookCategories } from "../../constants/facebookCategories";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const backendUrl = import.meta.env.VITE_BACKEND_URL;
const MAX_IMAGES = 6;
const MIN_IMAGES = 1;
const MAX_SIZE_BYTES = 200 * 1024;
const MAX_DIMENSION = 300;

const CreateProduct = () => {
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
  });
  const [images, setImages] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [attribute, setAttribute] = useState({
    keyName: "",
    value: "",
    position: "",
  });
  const [webpCover, setWebpCover] = useState(null);

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
        const categoryData = await getMainCategories();
        const categories = categoryData;
        const mainCategories = categories.filter(cat => cat.parent === cat.id);
        const subCategoryMap = {};
        mainCategories.forEach(main => {
          subCategoryMap[main.id] = [];
        });

        categories.forEach(cat => {
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
            (subcat) => subcat.id
          );

          updatedSubCategories = updatedSubCategories.filter(
            (subId) => !subCategoryIdsToRemove.includes(subId)
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


  const makeCover = (idx) => {
    if (idx === 0) return;
    setImages((imgs) => {
      const chosen = imgs[idx];
      return [chosen, ...imgs.filter((_, i) => i !== idx)];
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

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images];

    for (let file of files) {
      if (newImages.length >= MAX_IMAGES) {
        alert(`You can only upload up to ${MAX_IMAGES} images.`);
        break;
      }
      if (file.size > MAX_SIZE_BYTES) {
        alert(`${file.name}: exceeds 200 KB.`);
        continue;
      }
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
          alert(
            `${file.name}: dimensions ${img.width}×${img.height} exceed 300×300 px.`
          );
        } else {
          newImages.push({
            file,
            preview: img.src,
            width: img.width,
            height: img.height,
          });
          setImages(newImages);
        }
      };
    }
    e.target.value = null;
  };

  const handleWebpFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".webp")) {
      alert("Please upload only webp images");
      e.target.value = null;
      return;
    }

    if (file.size > 60 * 1024) {
      alert(`${file.name} exceeds 60KB limit`);
      e.target.value = null;
      return;
    }
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        alert(
          `${file.name}: dimensions ${img.width}×${img.height} exceed 300×300 px.`
        );
      } else {
        setWebpCover({
          file,
          preview: img.src,
          width: img.width,
          height: img.height,
        });
      }
    };
    e.target.value = null;
  };

  const removeImage = (idx) => {
    setImages((imgs) => imgs.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length < MIN_IMAGES || images.length > MAX_IMAGES) {
      alert(`Please upload between ${MIN_IMAGES} and ${MAX_IMAGES} images.`);
      return;
    }

    if (!webpCover) {
      alert("Please upload a WebP cover image before submitting.");
      return;
    }

    try {
      const uploadPromises = images.map(({ file }) => {
        const fd = new FormData();
        const ext = file.name.split(".").pop();
        const keyName = `${uuidv4()}.${ext}`;
        fd.append("uploadFile", file);
        return axios
          .post(
            `${backendUrl}/public/v2/bigmall/objects/upload/file?folderName=product-images&keyName=${keyName}`,
            fd,
            { headers: { "Content-Type": "multipart/form-data" } }
          )
          .then((res) => keyName);
      });

      const uploadedKeys = await Promise.all(uploadPromises);
      const firstImageKey = uploadedKeys.length > 0 ? uploadedKeys[0] : null;
      const webpKeyName = await handleUploadWebp(firstImageKey);
      if (!webpKeyName) return;

      const dimensionsObject = {
        height: form.dimensions.height || "0",
        width: form.dimensions.width || "0",
        length: form.dimensions.length || "0",
      };

      const productDto = {
        name: form.name,
        description: form.description,
        type: form.productType,
        status: form.productStatus,
        sku: form.sku,
        code: form.code,
        on_sale: false,
        stock_quantity: parseInt(form.stockQty, 10),
        manage_stock: true,
        regular_price: form.regularPrice,
        sale_price: form.salePrice,
        short_description: form.shortDesc,
        stock_status: form.stockStatus,
        slug: form.slug,
        purchasable: true,
        weight: form.weight,
        images: uploadedKeys.map((key) => ({ src: key })),
        categories: form.subCategories.map(id => ({ id })),
        mainImage: webpKeyName,
        dimensions: dimensionsObject,
        purchasingPrice: form.purchasePrice,
      };

      const productDetailDto = {
        description: form.description,
        type: form.productType,
        status: form.productStatus,
        on_sale: false,
        stock_quantity: parseInt(form.stockQty, 10),
        regular_price: form.regularPrice,
        short_description: form.shortDesc,
        facebook_category: form.facebookCategory,
        sale_price: form.salePrice,
        stock_status: form.stockStatus,
        slug: form.slug,
        purchasable: true,
        productName: form.name,
        productSku: form.sku,
        productImages: uploadedKeys.map((key, idx) => [key, String(idx)]),
        weight: form.weight,
        warranty: form.warranty,
        attributes: attributes.reduce((m, attr) => {
          m[attr.keyName.toLowerCase().replace(/\s+/g, "-")] = {
            slug: attr.keyName.toLowerCase().replace(/\s+/g, "-"),
            options: attr.value.split(","),
            position: parseInt(attr.position || "0", 10),
            visible: true,
            variation: true,
          };
          return m;
        }, {}),
      };

      const code = productDto.code;
      const response = await checkIfCodeExists(code);

      const message = response.message;
      const duplicates = response.object || [];

      if (duplicates.length > 0) {
        toast.error(`${message}: ${duplicates.join(", ")}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const payload = { productDto, productDetailDto };
      console.log("Final payload:", payload);

      const createResponse = await createProduct(payload);
      console.log("Product created : ", createResponse);
      setForm(form => ({
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
      }));
      setImages([]);
      setAttributes([]);
      setAttribute({ keyName: "", value: "", position: "" });
      setSubCategoryData({});
      setCategories([]);
      toast.success("Product created successfully!");
    } catch (err) {
      toast.error("Failed to create product: " + err.message);
    }
  };

  const handleUploadWebp = async (firstImageKey = null) => {
    if (!webpCover || !webpCover.file) {
      alert("Please select a WebP cover image first.");
      return null;
    }
    try {
      const fd = new FormData();
      let keyName;
      if (firstImageKey) {
        const baseName = firstImageKey.split(".")[0];
        keyName = `${baseName}.webp`;
      } else {
        const ext = webpCover.file.name.split(".").pop();
        keyName = `${uuidv4()}.${ext}`;
      }
      fd.append("uploadFile", webpCover.file);
      const res = await axios.post(
        `${backendUrl}/public/v2/bigmall/objects/upload/webp?folderName=product-images-webp&keyName=${keyName}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("WebP cover image uploaded successfully !");
      setWebpCover(null);
      console.log("WebP cover image uploaded : ", keyName);
      return keyName;
    } catch (err) {
      toast.error("Failed to upload WebP cover image : " + err.message);
      return null;
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
                                subcategory.id
                              )}
                              onChange={() =>
                                handleSubcategoryChange(
                                  subcategory.id
                                )
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

        <div className="mb-3 col-md-3">
          <label htmlFor="facebookCategory" className="form-label">
            Facebook category
          </label>
          <select
            id="facebookCategory"
            name="facebookCategory"
            className="form-select"
            value={form.facebookCategory}
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

        <div className="mb-4">
          <label htmlFor="webpUpload" className="form-label">
            Upload webp cover image
          </label>
          <input
            id="webpUpload"
            type="file"
            accept="image/webp"
            className="form-control"
            onChange={handleWebpFile}
          />
        </div>

        {webpCover && (
          <div className="text-center mt-3">
            <div className="position-relative d-inline-block">
              <img
                src={webpCover.preview}
                alt="WebP Cover"
                className="img-thumbnail"
                style={{
                  maxWidth: "200px",
                  border: "2px solid #007bff",
                }}
              />
              <span className="badge bg-primary position-absolute top-0 start-0">
                Cover
              </span>
              <button
                type="button"
                className="btn btn-sm btn-danger position-absolute top-0 end-0"
                onClick={() => setWebpCover(null)}
              >
                &times;
              </button>
            </div>
            <small className="text-muted d-block mt-2">
              {webpCover.width}×{webpCover.height}px,{" "}
              {(webpCover.file.size / 1024).toFixed(1)} KB
            </small>
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="imageUpload" className="form-label">
            Upload between {MIN_IMAGES} to {MAX_IMAGES} images
          </label>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            multiple
            className="form-control"
            onChange={handleFiles}
          />
        </div>

        <div className="row mb-3">
          {images.map((imgObj, idx) => (
            <div key={idx} className="col-6 col-md-3 text-center mb-3">
              <div className="position-relative">
                <img
                  src={imgObj.preview}
                  alt={`Preview ${idx + 1}`}
                  className="img-thumbnail"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    border: idx === 0 ? "2px solid #007bff" : undefined,
                  }}
                />

                <button
                  type="button"
                  className="btn btn-sm btn-danger position-absolute top-0 end-0"
                  onClick={() => removeImage(idx)}
                >
                  &times;
                </button>

                {idx !== 0 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary position-absolute bottom-0 start-50 translate-middle-x"
                    style={{ fontSize: "0.7rem" }}
                    onClick={() => makeCover(idx)}
                  >
                    Make Cover
                  </button>
                )}
              </div>
              <small className="text-muted d-block mt-1">
                {imgObj.width}×{imgObj.height}px,{" "}
                {(imgObj.file.size / 1024).toFixed(1)} KB
              </small>
            </div>
          ))}
        </div>

        {images.length < MIN_IMAGES && (
          <div className="alert alert-warning">
            Please upload at least {MIN_IMAGES - images.length} image
            {MIN_IMAGES - images.length > 1 ? "s" : ""}.
          </div>
        )}

        <button
          type="submit"
          className="btn btn-success"
          disabled={images.length < MIN_IMAGES || images.length > MAX_IMAGES}
        >
          {images.length >= MIN_IMAGES && images.length <= MAX_IMAGES
            ? "Submit Product"
            : "Adjust Images to Enable Submission"}
        </button>
      </form>

      <Tooltip id="purchasePriceTooltip" place="top" effect="solid" />
      <Tooltip id="salePriceTooltip" place="top" effect="solid" />
      <Tooltip id="regularPriceTooltip" place="top" effect="solid" />
    </div>
  );
};

export default CreateProduct;