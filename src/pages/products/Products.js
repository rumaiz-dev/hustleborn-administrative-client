import { useEffect, useState, useCallback } from "react";
import {
  CTable,
  CTableBody,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTableDataCell,
  CContainer,
  CCard,
  CCardBody,
  CCol,
  CFormSelect,
  CRow,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CFormInput,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilOptions, cilPencil } from "@coreui/icons";
import ReactPaginate from "react-paginate";
import { getProducts } from "../../api/productRequests";
import "../../styles/custom.css";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [productTypeFilter, setProductTypeFilter] = useState("parent");
  const [tempFilter, setTempFilter] = useState("parent");
  const [productNameFilter, setProductNameFilter] = useState("");
  const [productSkuFilter, setProductSkuFilter] = useState("");
  const [productCodeFilter, setProductCodeFilter] = useState("");
  const [tempNameFilter, setTempNameFilter] = useState("");
  const [productStatuFilter, setProductStatusFilter] = useState("all");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [tempSkuFilter, setTempSkuFilter] = useState("");
  const [tempCodeFilter, setTempCodeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let isParent = null;
      if (productTypeFilter === "parent") {
        isParent = false;
      } else if (productTypeFilter === "variant") {
        isParent = true;
      }

      const res = await getProducts({
        page: currentPage,
        size: 10,
        isParent: isParent ?? true,
        status: productStatuFilter !== "all" ? productStatuFilter : undefined,
        name: productNameFilter?.trim() || undefined,
        sku: productSkuFilter?.trim() || undefined,
        code: productCodeFilter?.trim() || undefined,
        startDate: startDate ? `${startDate}T00:00:00` : undefined,
        endDate: endDate ? `${endDate}T23:59:59` : undefined,
      });

      const data = res;
      if (data && data.content) {
        setProducts(data.content);
        setTotalElements(data.totalElements);
        setTotalPages(data.totalPages);
      } else {
        setProducts([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    productTypeFilter,
    productNameFilter,
    productSkuFilter,
    productCodeFilter,
    productStatuFilter,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleProductTypeFilterChange = (e) => {
    setTempFilter(e.target.value);
  };

  const applyFilter = () => {
    setProductTypeFilter(tempFilter);
    setProductNameFilter(tempNameFilter);
    setProductStatusFilter(tempStatusFilter);
    setProductSkuFilter(tempSkuFilter);
    setProductCodeFilter(tempCodeFilter);
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setCurrentPage(0);
  };

  const handleEditProductClick = (productId) => {
    navigate(`/products/edit-product/${productId}`);
  };

  const handleNavigateCreateProduct = () => {
    navigate(`/products/create-product`);
  };

  return (
    <CCard>
      <CCardBody>
        <CRow className="mb-3">
          <CCol xs={12} className="d-flex flex-wrap gap-2 align-items-end">
            <CCol>
              <label htmlFor="product-type" className="form-label small mb-1">
                Product Type
              </label>
              <CFormSelect
                size="sm"
                aria-label="Filter by Product Type"
                value={tempFilter}
                onChange={handleProductTypeFilterChange}
                style={{ width: "190px" }}
              >
                <option value="parent">Parent Products</option>
                <option value="variant">Variant Products</option>
              </CFormSelect>
            </CCol>

            <CCol>
              <label htmlFor="search-name" className="form-label small mb-1">
                Search by Name
              </label>
              <CFormInput
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by name"
                value={tempNameFilter}
                onChange={(e) => setTempNameFilter(e.target.value)}
                style={{ width: "190px" }}
              />
            </CCol>

            <CCol>
              <label htmlFor="search-sku" className="form-label small mb-1">
                Search by SKU
              </label>
              <CFormInput
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by SKU"
                value={tempSkuFilter}
                onChange={(e) => setTempSkuFilter(e.target.value)}
                style={{ width: "200px" }}
              />
            </CCol>

            <CCol>
              <label htmlFor="search-code" className="form-label small mb-1">
                Search by Code
              </label>
              <CFormInput
                type="text"
                className="form-control form-control-sm"
                placeholder="Search by Code"
                value={tempCodeFilter}
                onChange={(e) => setTempCodeFilter(e.target.value)}
                style={{ width: "200px" }}
              />
            </CCol>

            <CCol>
              <label htmlFor="start-date" className="form-label small mb-1">
                Start Date (Created At)
              </label>
              <CFormInput
                type="date"
                max={today}
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                className="form-control-sm"
                style={{ width: "190px" }}
              />
            </CCol>

            <CCol>
              <label htmlFor="end-date" className="form-label small mb-1">
                End Date (Created At)
              </label>
              <CFormInput
                type="date"
                max={today}
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                className="form-control-sm"
                style={{ width: "180px" }}
              />
            </CCol>
          </CCol>
        </CRow>

        <CRow className="mb-3">
          <CCol xs={12} className="d-flex gap-2 align-items-end">
            <CCol style={{ maxWidth: "160px" }}>
              <label htmlFor="status-filter" className="form-label small mb-1">
                Status
              </label>
              <CFormSelect
                size="sm"
                value={tempStatusFilter}
                onChange={(e) => setTempStatusFilter(e.target.value)}
                style={{ width: "160px" }}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="publish">Publish</option>
                <option value="draft">Draft</option>
                <option value="trash">Trash</option>
              </CFormSelect>
            </CCol>

            <CCol style={{ maxWidth: "fit-content", paddingTop: "24px" }}>
              <button
                type="submit"
                onClick={applyFilter}
                className="btn btn-sm btn-filter"
              >
                Filter
              </button>
            </CCol>

            <CCol className="text-end">
              <CDropdown variant="btn-group">
                <CDropdownToggle color="transparent" caret={false}>
                  <CIcon icon={cilOptions} size="lg" />
                </CDropdownToggle>

                <CDropdownMenu>
                  <CDropdownItem onClick={handleNavigateCreateProduct}>
                    Create Product
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCol>
          </CCol>
        </CRow>

        {loading ? (
          <p className="text-muted small">Loading...</p>
        ) : error ? (
          <p className="text-danger small">{error}</p>
        ) : !products || products.length === 0 ? (
          <p className="text-muted small">No products found.</p>
        ) : (
          <>
            <CTable
              striped
              hover
              responsive
              align="middle"
              className="text-start small"
            >
              <CTableHead className="table-light">
                <CTableRow>
                  <CTableHeaderCell>Name</CTableHeaderCell>
                  <CTableHeaderCell>Price</CTableHeaderCell>
                  <CTableHeaderCell>Sale Price</CTableHeaderCell>
                  <CTableHeaderCell>SKU</CTableHeaderCell>
                  <CTableHeaderCell>Code</CTableHeaderCell>
                  <CTableHeaderCell>Quantity</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Created At</CTableHeaderCell>
                  <CTableHeaderCell className="text-center">
                    Actions
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {products.map((product) => (
                  <CTableRow key={product.id}>
                    <CTableDataCell
                      style={{
                        width: "400px",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                      }}
                    >
                      {product.name}
                    </CTableDataCell>
                    <CTableDataCell>Rs. {product.price}</CTableDataCell>
                    <CTableDataCell>Rs. {product.salePrice}</CTableDataCell>
                    <CTableDataCell>{product.sku}</CTableDataCell>
                    <CTableDataCell>{product.code}</CTableDataCell>
                    <CTableDataCell>{product.stockQuantity}</CTableDataCell>
                    <CTableDataCell>{product.status}</CTableDataCell>
                    <CTableDataCell>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </CTableDataCell>
                    <CTableDataCell className="text-center">
                      <CIcon
                        icon={cilPencil}
                        className="text-primary"
                        onClick={() => handleEditProductClick(product.id)}
                        style={{ cursor: "pointer" }}
                        title="Edit Product"
                      />
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>

            <CCol xs={12}>
              <div className="mt-3 d-flex justify-content-center small">
                <ReactPaginate
                  previousLabel="‹"
                  nextLabel="›"
                  breakLabel="..."
                  pageCount={totalPages}
                  marginPagesDisplayed={1}
                  pageRangeDisplayed={2}
                  onPageChange={handlePageClick}
                  containerClassName="pagination pagination-sm justify-content-center"
                  pageClassName="page-item"
                  pageLinkClassName="page-link"
                  previousClassName="page-item"
                  previousLinkClassName="page-link"
                  nextClassName="page-item"
                  nextLinkClassName="page-link"
                  breakClassName="page-item"
                  breakLinkClassName="page-link"
                  activeClassName="active"
                  forcePage={currentPage}
                />
              </div>
              <div className="text-center mt-2 small text-muted">
                Page {currentPage + 1} of {totalPages} ({totalElements} total
                products)
              </div>
            </CCol>
          </>
        )}
      </CCardBody>
    </CCard>
  );
};

export default Products;
