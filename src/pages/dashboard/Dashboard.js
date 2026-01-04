import { useEffect, useState, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTable,
  CWidgetStatsA,
  CFormInput,
} from '@coreui/react'
import { S3_BASE_URL } from '../../constants/consts'
import { getTopSellingProducts, getSalesData, getVendorOrderStatusesCount } from '../../api/DashboardRequests'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import { PRIMARY, INFO, WARNING, SUCCESS } from '../../constants/colorConstants'

const Dashboard = () => {
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)

  const formatDate = (date) => date.toISOString().split('T')[0]


  const [startDate, setStartDate] = useState(formatDate(thirtyDaysAgo))
  const [endDate, setEndDate] = useState(formatDate(today))
  const [tempStartDate, setTempStartDate] = useState(formatDate(thirtyDaysAgo))
  const [tempEndDate, setTempEndDate] = useState(formatDate(today))
  const [chartLabels, setChartLabels] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [statusCounts, setStatusCounts] = useState({})

  const fetchTopSellingProducts = async (from, to) => {
    if (!from || !to) return
    try {
      const response = await getTopSellingProducts({
        startDate: `${from}T00:00:00`,
        endDate: `${to}T23:59:59`,
      })

      if (response?.object?.length) {
        const products = response.object.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image?.[0] || null,
        }))
        setTopSellingProducts(products)
      } else {
        setTopSellingProducts([])
      }
    } catch (error) {
      console.error('Error fetching top selling products:', error)
    }
  }

  const fetchSalesData = async (from, to) => {
    if (!from || !to) return;
    try {
      const response = await getSalesData({
        startDate: `${from}T00:00:00`,
        endDate: `${to}T23:59:59`,
      });

      if (response?.object?.length) {
        const labels = response.object.map((item) => item.labels);
        const data = response.object.map((item) => Number(item.data));

        setChartLabels(labels);
        setChartData(data);
      } else {
        setChartLabels([]);
        setChartData([]);
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const fetchStatusCounts = async (from, to) => {
    if (!from || !to) return;
    try {
      const response = await getVendorOrderStatusesCount({
        startDate: `${from}T00:00:00`,
        endDate: `${to}T23:59:59`,
      });
      setStatusCounts(response);
    } catch (error) {
      console.error('Error fetching vendor order counts:', error);
      setStatusCounts({});
    }
  };


  const chartRef = useRef(null)

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  const applyFilter = () => {
    setStartDate(tempStartDate)
    setEndDate(tempEndDate)
  }


  useEffect(() => {
    fetchStatusCounts(startDate, endDate);
    fetchSalesData(startDate, endDate);
    fetchTopSellingProducts(startDate, endDate);
  }, [startDate, endDate]);


  return (
    <CCard className="mb-4">
      <CCol sm={4} className="mt-5 mx-2" >
        <div className="d-flex justify-content-end align-items-center gap-2">
          <CFormInput
            type="date"
            max={formatDate(today)}
            value={tempStartDate}
            onChange={(e) => setTempStartDate(e.target.value)}
            className="form-control-sm"
            style={{ width: '160px' }}
          />
          <CFormInput
            type="date"
            max={formatDate(today)}
            value={tempEndDate}
            onChange={(e) => setTempEndDate(e.target.value)}
            className="form-control-sm"
            style={{ width: '160px' }}
          />
          <button
            type="submit"
            onClick={applyFilter}
            className="btn btn-sm btn-filter"
          >
            Filter
          </button>
        </div>
      </CCol>


      <CRow className="mt-4 mb-4 mx-4" xs={{ gutter: 4 }}>
        <CCol sm={6} xl={4} xxl={3}>
          <CWidgetStatsA
            color={PRIMARY}
            value={statusCounts[1]?.count || "0"}
            title={'Processing Orders'}
            chart={<div className="mt-3 mx-3" style={{ height: '70px' }} />}
          />
        </CCol>

        <CCol sm={6} xl={4} xxl={3}>
          <CWidgetStatsA
            color={INFO}
            value={statusCounts[2]?.count || "0"}
            title={'Assigned Orders'}
            chart={<div className="mt-3 mx-3" style={{ height: '70px' }} />}
          />
        </CCol>

        <CCol sm={6} xl={4} xxl={3}>
          <CWidgetStatsA
            color={WARNING}
            value={statusCounts[3]?.count || "0"}
            title={'Orders On Hold'}
            chart={<div className="mt-3 mx-3" style={{ height: '70px' }} />}
          />
        </CCol>

        <CCol sm={6} xl={4} xxl={3}>
          <CWidgetStatsA
            color={SUCCESS}
            value={statusCounts[4]?.count || "0"}
            title={'Confirmed Orders'}
            chart={<div className="mt-3 mx-3" style={{ height: '70px' }} />}
          />
        </CCol>

        <CCol sm={6} xl={4} xxl={3}>
          <CWidgetStatsA
            color={SUCCESS}
            value={statusCounts[5]?.count || "0"}
            title={'Money Received Orders'}
            chart={<div className="mt-3 mx-3" style={{ height: '70px' }} />}
          />
        </CCol>
      </CRow>



      <CCardBody className="mx-4">
        <CRow>
          <CCol sm={5}>
            <h4 className="card-title mb-0">Sales Overview</h4>
            <div className="small text-body-secondary">Filtered by Date Range</div>
          </CCol>
        </CRow>

        <CChartLine
          style={{ height: '300px', marginTop: '40px' }}
          data={{
            labels: chartLabels.length ? chartLabels : ['No data'],
            datasets: [
              {
                label: 'Sales',
                backgroundColor: `rgba(${getStyle('--cui-info-rgb') || '0,123,255'}, .1)`,
                borderColor: getStyle('--cui-info') || '#007bff',
                pointHoverBackgroundColor: getStyle('--cui-info') || '#007bff',
                borderWidth: 2,
                data: chartData.length ? chartData : [0],
                fill: true,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                grid: {
                  color: getStyle('--cui-border-color-translucent'),
                  drawOnChartArea: false,
                },
                ticks: {
                  color: getStyle('--cui-body-color'),
                },
              },
              y: {
                beginAtZero: true,
                suggestedMax: Math.ceil(Math.max(...chartData, 10) * 1.2),
                border: {
                  color: getStyle('--cui-border-color-translucent'),
                },
                grid: {
                  color: getStyle('--cui-border-color-translucent'),
                },
                ticks: {
                  color: getStyle('--cui-body-color'),
                  maxTicksLimit: 5,
                  stepSize: 50,
                },
              },
            },
            elements: {
              line: {
                tension: 0.4,
              },
              point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4,
                hoverBorderWidth: 3,
              },
            },
          }}
        />
      </CCardBody>

      <CRow >
        <CCol md={7} className="mb-4 ml-4 mx-4">
          <CCardBody>
            <CRow>
              <CCol sm={12}>
                <h4 className="card-title mb-0">Trending Products</h4>
                <div className="small text-body-secondary">Filtered by Date Range</div>
              </CCol>
            </CRow>

            <CTable align="middle" className="mb-0 border mt-3">
              <CTableHead className="text-nowrap">
                <CTableRow>
                  <CTableHeaderCell className="bg-body-tertiary">Product</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-center">Quantity Sold</CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody>
                {topSellingProducts.map((item, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>
                      <div className="d-flex align-items-center gap-3">
                        {item.image ? (
                          <img
                            src={S3_BASE_URL + item.image}
                            alt={item.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              boxShadow: '0 0 3px rgba(0,0,0,0.2)',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '6px',
                              backgroundColor: '#f0f0f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#999',
                              fontSize: '12px',
                            }}
                          >
                            N/A
                          </div>
                        )}
                        <div>{item.name}</div>
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end text-nowrap">
                      {item.quantity.toLocaleString('en-IN')}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCol>
      </CRow>

    </CCard>

  )
}

export default Dashboard
