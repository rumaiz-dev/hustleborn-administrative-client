import { useState, useEffect } from "react";
import RichTextField from "../../components/textEditor/RichText";
import { v4 as uuidv4 } from "uuid";
import { createProductVariants, getProductById, checkIfCodeExists } from "../../api/productRequests";
import { useParams, useNavigate } from "react-router-dom";
import { CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem } from '@coreui/react';
import { BsTrash } from 'react-icons/bs';
import { CIcon } from '@coreui/icons-react';
import { cilOptions } from '@coreui/icons';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const MAX_IMAGES = 6;
const MAX_SIZE_BYTES = 200 * 1024;
const MAX_DIMENSION = 300;
const CreateVariantProduct = () => {

    const [variants, setVariants] = useState([
        {
            id: uuidv4(),
            name: "",
            shortDesc: "",
            description: "",
            attributes: [],
            images: [],
            purchasePrice: "",
            regularPrice: "",
            salePrice: "",
            stockStatus: "instock",
            stockQty: 0,
            sku: "",
            code: "",
            weight: "",
            warranty: "",
            dimensions: {
                length: "",
                width: "",
                height: "",
            },
            productStatus: "publish",
            selectedAttribute: "",
            selectedValue: ""
        }
    ]);

    const { id: productId } = useParams();
    const navigate = useNavigate();
    const [availableAttributes, setAvailableAttributes] = useState([]);
    const [attributeOptionsMap, setAttributeOptionsMap] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleVariantChange = (variantId, field, value) => {
        setVariants(prev =>
            prev.map(v => {
                if (v.id !== variantId) return v;
                if (field === "selectedAttribute") {
                    return {
                        ...v,
                        selectedAttribute: value,
                        selectedValue: ""
                    };
                }
                if (['length', 'width', 'height'].includes(field)) {
                    return {
                        ...v,
                        dimensions: {
                            ...v.dimensions,
                            [field]: value
                        }
                    };
                }
                return { ...v, [field]: value };
            })
        );
    };

    let allDetailsProduct = {
        parentProduct: {
            attributes: {},
        },
    };

    const transformAttributes = (selectedAttributesArray) => {
        const transformed = {};
        selectedAttributesArray.forEach(attr => {
            const attributeName = attr.keyName.toLowerCase().replace(/\s/g, '');
            transformed[attributeName] = attr.value;
        });
        return transformed;
    };


    const handleVariantRichTextChange = (variantId, html) => {
        handleVariantChange(variantId, "description", html);
    };


    const addVariant = () => {
        setVariants(prev => {
            const baseVariant = prev[0];
            return [
                ...prev,
                {
                    id: uuidv4(),
                    name: baseVariant.name,
                    suffix: "",
                    shortDesc: baseVariant.shortDesc,
                    description: baseVariant.description,
                    attributes: [],
                    images: [],
                    purchasePrice: baseVariant.purchasePrice,
                    regularPrice: baseVariant.regularPrice,
                    salePrice: baseVariant.salePrice,
                    stockStatus: baseVariant.stockStatus,
                    stockQty: baseVariant.stockQty,
                    sku: baseVariant.sku,
                    code: baseVariant.code,
                    weight: baseVariant.weight,
                    warranty: baseVariant.warranty,
                    dimensions: { ...baseVariant.dimensions },
                    productStatus: baseVariant.productStatus,
                    selectedAttribute: "",
                    selectedValue: ""
                }
            ];
        });
    };

    const removeVariant = (id) => {
        if (variants.length <= 1) {
            toast.warning("You need at least one variant", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }
        setVariants(prev => prev.filter(v => v.id !== id));
    };

    const addVariantAttribute = (variantId) => {
        setVariants(prev =>
            prev.map(v => {
                if (v.id !== variantId) return v;

                const normalize = (str) => str.toLowerCase().replace(/\s/g, '');
                const newKeyNormalized = normalize(v.selectedAttribute);
                const newValueNormalized = normalize(v.selectedValue);

                const keyExists = v.attributes.some(attr =>
                    normalize(attr.keyName) === newKeyNormalized
                );

                const valueExists = v.attributes.some(attr =>
                    normalize(attr.keyName) === newKeyNormalized &&
                    normalize(attr.value) === newValueNormalized
                );

                if (keyExists) {
                    toast.warning(
                        `This variant already has a "${v.selectedAttribute}" attribute`,
                        { position: "top-right", autoClose: 3000 }
                    );
                    return v;
                }

                if (valueExists) {
                    toast.warning(
                        `"${v.selectedValue}" already exists for "${v.selectedAttribute}"`,
                        { position: "top-right", autoClose: 3000 }
                    );
                    return v;
                }

                if (!v.selectedAttribute || !v.selectedValue) {
                    toast.error("Please select both an attribute and a value", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                    return v;
                }

                return {
                    ...v,
                    attributes: [
                        ...v.attributes,
                        {
                            keyName: v.selectedAttribute,
                            value: v.selectedValue,
                            position: v.attributes.length.toString()
                        }
                    ],
                    selectedValue: ""
                };
            })
        );
    };

    const removeVariantAttribute = (variantId, attrIndex) => {
        setVariants(prev =>
            prev.map(v => {
                if (v.id !== variantId) return v;
                return {
                    ...v,
                    attributes: v.attributes.filter((_, idx) => idx !== attrIndex)
                };
            })
        );
    };

    const handleVariantFiles = (variantId, e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        e.target.value = null;

        setVariants(prevVariants =>
            prevVariants.map(variant => {
                if (variant.id !== variantId) return variant;

                const currentImages = [...variant.images];
                let availableSlots = MAX_IMAGES - currentImages.length;

                if (availableSlots <= 0) {
                    toast.warning(`You can only upload up to ${MAX_IMAGES} images per variant.`);
                    return variant;
                }

                const filesToProcess = files.slice(0, availableSlots);

                filesToProcess.forEach(file => {
                    if (file.size > MAX_SIZE_BYTES) {
                        toast.error(`${file.name}: exceeds ${(MAX_SIZE_BYTES / 1024).toFixed(0)} KB.`);
                        return;
                    }

                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    img.onload = () => {
                        if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
                            toast.error(
                                `${file.name}: dimensions ${img.width}×${img.height} exceed ${MAX_DIMENSION}×${MAX_DIMENSION} px.`
                            );
                            URL.revokeObjectURL(img.src);
                        } else {
                            setVariants(prev =>
                                prev.map(v => {
                                    if (v.id !== variantId) return v;
                                    return {
                                        ...v,
                                        images: [
                                            ...v.images,
                                            {
                                                file,
                                                preview: img.src,
                                                width: img.width,
                                                height: img.height,
                                                name: file.name,
                                                size: (file.size / 1024).toFixed(1) + "KB",
                                            },
                                        ],
                                    };
                                })
                            );
                        }
                    };

                    img.onerror = () => {
                        toast.error(`${file.name}: Failed to load image.`);
                        URL.revokeObjectURL(img.src);
                    };
                });

                if (files.length > availableSlots) {
                    const skipped = files.length - availableSlots;
                    toast.info(`${skipped} image(s) skipped due to slot limitations.`);
                }

                return variant;
            })
        );
    };

    const makeVariantCover = (variantId, idx) => {
        if (idx === 0) return;

        setVariants(prev =>
            prev.map(v => {
                if (v.id !== variantId) return v;

                const chosen = v.images[idx];
                const filtered = v.images.filter((_, i) => i !== idx);
                return {
                    ...v,
                    images: [chosen, ...filtered]
                };
            })
        );
    };

    const removeVariantImage = (variantId, idx) => {
        setVariants(prev =>
            prev.map(v => {
                if (v.id !== variantId) return v;
                return {
                    ...v,
                    images: v.images.filter((_, i) => i !== idx)
                };
            })
        );
    };


    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId) return;

            try {
                const data = await getProductById(productId);
                const product = data.parentProduct.product;
                allDetailsProduct = data;
                const productDetails = data.parentProduct;
                setVariants([{
                    id: uuidv4(),
                    name: `${product.name}`,
                    shortDesc: productDetails.shortDescription || "",
                    description: productDetails.description || "",
                    attributes: [],
                    images: [],
                    purchasePrice: product.purchasingPrice || "",
                    regularPrice: product.regularPrice || "",
                    salePrice: product.salePrice || "",
                    stockStatus: product.stockStatus || "instock",
                    stockQty: product.stockQuantity || 0,
                    sku: product.sku || "",
                    code: product.code || "",
                    weight: productDetails.weight || "",
                    warranty: productDetails.warranty || "",
                    dimensions: {
                        length: product.dimensions?.length || "",
                        width: product.dimensions?.width || "",
                        height: product.dimensions?.height || "",
                    },
                    productStatus: product.productStatus || "publish",
                    selectedAttribute: "",
                    selectedValue: ""
                }]);

                const parentAttributes = productDetails.attributes;
                if (parentAttributes) {
                    const names = Object.keys(parentAttributes).map((key) =>
                        key.replace(/-/g, " ")
                    );
                    setAvailableAttributes(names);

                    const optionsMap = {};
                    Object.values(parentAttributes).forEach((attr) => {
                        optionsMap[attr.slug.replace(/-/g, " ")] = attr.options;
                    });
                    setAttributeOptionsMap(optionsMap);
                }

            } catch (error) {
                toast.error("Please select both an attribute and a value", error.message, {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        };

        fetchProductDetails();
    }, [productId]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const uploadPromises = [];
            const variantImageMap = {};

            variants.forEach(variant => {
                variantImageMap[variant.id] = [];

                variant.images.forEach(image => {
                    if (image.file) {
                        const uploadPromise = (() => {
                            const fd = new FormData();
                            const ext = image.file.name.split(".").pop();
                            const keyName = `${uuidv4()}.${ext}`;
                            fd.append("uploadFile", image.file);

                            return axios
                                .post(
                                    `${backendUrl}/public/v2/bigmall/objects/upload/file?folderName=product-images&keyName=${keyName}`,
                                    fd,
                                    { headers: { "Content-Type": "multipart/form-data" } }
                                )
                                .then((res) => {
                                    variantImageMap[variant.id].push(keyName);
                                    return keyName;
                                });
                        })();

                        uploadPromises.push(uploadPromise);
                    }
                });
            });

            await Promise.all(uploadPromises);

            const variationsToSubmit = variants.map((variationItem) => {
                const transformedVariationAttributes = transformAttributes(
                    variationItem.attributes
                );

                return {
                    productName: variationItem.name,
                    sku: variationItem.sku || "",
                    code: variationItem.code || "",
                    description: variationItem.description || "",
                    regularPrice: parseFloat(variationItem.regularPrice) || null,
                    salePrice: parseFloat(variationItem.salePrice) || null,
                    purchasingPrice: parseFloat(variationItem.purchasePrice) || null,
                    stockQuantity: parseInt(variationItem.stockQty, 10) || null,
                    stockStatus: variationItem.stockStatus,
                    suffix: variationItem.suffix || "",
                    selectedAttributes: transformedVariationAttributes,
                    images: variantImageMap[variationItem.id] || [],
                    status: variationItem.productStatus,
                    variant: Object.values(transformedVariationAttributes).join("-"),
                    type: "variation",
                    warranty: variationItem.warranty || "",
                    weight: variationItem.weight || "",
                    videoURL: "",
                    dimensions: {
                        height: variationItem.dimensions.height || "",
                        width: variationItem.dimensions.width || "",
                        length: variationItem.dimensions.length || ""
                    },
                };
            });

            const payload = {
                type: "variation",
                variations: variationsToSubmit,
            };

            const codes = variationsToSubmit.map(v => v.code).filter(Boolean);
            const response = await checkIfCodeExists(codes);

            const message = response.message;
            const duplicates = response.object || [];

            if (duplicates.length > 0) {
                toast.error(`${message}: ${duplicates.join(", ")}`, {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            console.log("Submitting payload:", payload);
            const resp = await createProductVariants(productId, payload);
            const message1 = resp.message;
            toast.success(`${message1}`, {
                position: "top-right",
                autoClose: 3000,
            }
            );
            navigate(`/products/edit-product/${productId}`);
        }
        catch (error) {
            toast.error(error.message || "Failed to create variants", {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container">
            <ToastContainer position="top-right" autoClose={5000} />

            <form onSubmit={handleFormSubmit}>
                <div className="d-flex justify-content-end mb-0">
                    <CDropdown variant="btn-group">
                        <CDropdownToggle color="transparent" caret={false}>
                            <CIcon icon={cilOptions} size="lg" />
                        </CDropdownToggle>
                        <CDropdownMenu>
                            <CDropdownItem onClick={addVariant}>
                                Create Variation
                            </CDropdownItem>
                        </CDropdownMenu>
                    </CDropdown>
                </div>

                {variants.map((variant, idx) => (
                    <div key={variant.id} className="card mb-4 border-black">
                        <div className="card-header text-black d-flex justify-content-between align-items-center">
                            <p className="mb-0">Variation {idx + 1} of {variant.name}</p>
                            {variants.length > 1 && (
                                <BsTrash
                                    className="text-danger cursor-pointer"
                                    onClick={() => removeVariant(variant.id)}
                                    size={20}
                                />
                            )}
                        </div>

                        <div className="card-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Variation Name*</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={variant.name}
                                        onChange={(e) => handleVariantChange(variant.id, 'name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Suffix*</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={variant.suffix}
                                        onChange={(e) => handleVariantChange(variant.id, 'suffix', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Short Description</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={variant.shortDesc}
                                        onChange={(e) => handleVariantChange(variant.id, 'shortDesc', e.target.value)}
                                        maxLength={150}
                                        disabled={idx === 0}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={variant.productStatus}
                                        onChange={(e) => handleVariantChange(variant.id, 'productStatus', e.target.value)}
                                    >
                                        <option value="">Choose...</option>
                                        <option value="draft">Draft</option>
                                        <option value="pending">Pending</option>
                                        <option value="publish">Publish</option>
                                        <option value="future">Future</option>
                                        <option value="trash">Trash</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Description</label>
                                <RichTextField
                                    value={variant.description}
                                    onChange={(html) => handleVariantRichTextChange(variant.id, html)}
                                    placeholder="Enter full product description here..."
                                />
                            </div>

                            {/* Attributes Section */}
                            <div className="row align-items-end mb-3">
                                <div className="col-md-5">
                                    <label className="form-label">Attribute</label>
                                    <select
                                        className="form-select form-select-sm"
                                        value={variant.selectedAttribute}
                                        onChange={(e) => handleVariantChange(variant.id, 'selectedAttribute', e.target.value)}
                                    >
                                        <option value="">Select Attribute</option>
                                        {availableAttributes.map((attrName) => (
                                            <option key={attrName} value={attrName}>
                                                {attrName}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-5">
                                    <label className="form-label">Value</label>
                                    <div className="input-group input-group-sm">
                                        <select
                                            className="form-select"
                                            value={variant.selectedValue}
                                            onChange={(e) => handleVariantChange(variant.id, 'selectedValue', e.target.value)}
                                            disabled={!variant.selectedAttribute}
                                        >
                                            <option value="">Select Value</option>
                                            {variant.selectedAttribute &&
                                                attributeOptionsMap[variant.selectedAttribute]?.map((option) => (
                                                    <option key={option} value={option}>
                                                        {option}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-dark btn-sm w-50"
                                        onClick={() => addVariantAttribute(variant.id)}
                                        disabled={!variant.selectedAttribute || !variant.selectedValue}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {variant.attributes.length > 0 && (
                                <div className="mb-2">
                                    <label className="form-label">Selected Attributes</label>
                                    <div className="d-flex flex-wrap gap-2">
                                        {variant.attributes.map((attr, attrIndex) => (
                                            <span
                                                key={attrIndex}
                                                className="badge bg-light text-dark border d-flex align-items-center px-2 py-1"
                                            >
                                                {attr.keyName}: {attr.value}
                                                <button
                                                    type="button"
                                                    className="btn-close btn-close-sm ms-2"
                                                    aria-label="Remove"
                                                    onClick={() => removeVariantAttribute(variant.id, attrIndex)}
                                                ></button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <label className="form-label">Purchase Price (LKR)*</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={variant.purchasePrice}
                                        onChange={(e) => handleVariantChange(variant.id, 'purchasePrice', e.target.value)}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Selling Price (LKR)*</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={variant.salePrice}
                                        onChange={(e) => handleVariantChange(variant.id, 'salePrice', e.target.value)}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Regular Price (LKR)*</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={variant.regularPrice}
                                        onChange={(e) => handleVariantChange(variant.id, 'regularPrice', e.target.value)}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">SKU*</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={variant.sku}
                                        onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Code*</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={variant.code}
                                        onChange={(e) => handleVariantChange(variant.id, 'code', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <label className="form-label">Stock Status*</label>
                                    <select
                                        className="form-select"
                                        value={variant.stockStatus}
                                        onChange={(e) => handleVariantChange(variant.id, 'stockStatus', e.target.value)}
                                    >
                                        <option value="instock">In Stock</option>
                                        <option value="outofstock">Out of Stock</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Stock Quantity*</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={variant.stockQty}
                                        onChange={(e) => handleVariantChange(variant.id, 'stockQty', e.target.value)}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Weight (kg)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={variant.weight}
                                        onChange={(e) => handleVariantChange(variant.id, 'weight', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">Warranty</label>
                                    <select
                                        id="warranty"
                                        name="warranty"
                                        className="form-select"
                                        value={variant.warranty}
                                        onChange={(e) => handleVariantChange(variant.id, 'warranty', e.target.value)}
                                    >
                                        <option value="">Choose...</option>
                                        <option value="checking">Checking</option>
                                        <option value="3_months">3 Months</option>
                                        <option value="6_months">6 Months</option>
                                        <option value="1_year">1 Year</option>
                                    </select>
                                </div>
                            </div>

                     
                            <div className="row g-1 align-items-end mb-2">
                                <div className="col-auto">
                                    <label className="form-label mb-0">Length (cm)</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        style={{ maxWidth: "80px" }}
                                        value={variant.dimensions.length}
                                        onChange={(e) => handleVariantChange(variant.id, 'length', e.target.value)}
                                    />
                                </div>
                                <div className="col-auto">
                                    <label className="form-label mb-0">Width (cm)</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        style={{ maxWidth: "80px" }}
                                        value={variant.dimensions.width}
                                        onChange={(e) => handleVariantChange(variant.id, 'width', e.target.value)}
                                    />
                                </div>
                                <div className="col-auto">
                                    <label className="form-label mb-0">Height (cm)</label>
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        style={{ maxWidth: "80px" }}
                                        value={variant.dimensions.height}
                                        onChange={(e) => handleVariantChange(variant.id, 'height', e.target.value)}
                                    />
                                </div>
                            </div>


                            {/* Image Upload Section */}
                            <div className="mb-3">
                                <label className="form-label">
                                    Images ({variant.images.length}/{MAX_IMAGES})
                                </label>
                                <input
                                    type="file"
                                    className="form-control"
                                    onChange={(e) => handleVariantFiles(variant.id, e)}
                                    accept="image/*"
                                    multiple
                                />
                                <small className="form-text text-muted">
                                    Max {MAX_IMAGES} images per variant. Max size: {Math.round(MAX_SIZE_BYTES / 1024)} KB. Max dimensions: {MAX_DIMENSION}×{MAX_DIMENSION} px.
                                </small>
                            </div>

                            <div className="d-flex flex-wrap gap-3 mb-3">
                                {variant.images.map((image, imageIdx) => (
                                    <div
                                        key={imageIdx}
                                        className="position-relative border rounded shadow-sm p-1 bg-white"
                                        style={{ width: '110px', height: '130px' }}
                                    >
                                        <img
                                            src={image.preview || `${backendUrl}/uploads/${image.name}`}
                                            alt={`Variant Image ${imageIdx + 1}`}
                                            className="img-fluid rounded mb-1"
                                            style={{ objectFit: 'cover', width: '100%', height: '100px' }}
                                        />

                                        {imageIdx === 0 && (
                                            <span className="badge bg-success position-absolute top-0 start-0 m-1">
                                                Cover
                                            </span>
                                        )}

                                        <div
                                            className="d-flex justify-content-between px-1"
                                            style={{ height: '28px', overflow: 'hidden' }}
                                        >
                                            {imageIdx !== 0 ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-success flex-shrink-0 text-truncate"
                                                    style={{ maxWidth: '70px', padding: '0 6px' }}
                                                    onClick={() => makeVariantCover(variant.id, imageIdx)}
                                                    title="Set as Cover Image"
                                                >
                                                    Cover
                                                </button>
                                            ) : (
                                                <span className="text-muted small flex-shrink-0">#1</span>
                                            )}

                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger flex-shrink-0"
                                                onClick={() => removeVariantImage(variant.id, imageIdx)}
                                                title="Remove Image"
                                                style={{ padding: '0 6px' }}
                                            >
                                                <BsTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>
                    </div>
                ))}

                <div className="d-flex justify-content-end">
                    <button
                        type="submit"
                        className="btn btn-outline-success"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Creating Variants..." : "Create Variants"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CreateVariantProduct;