// import { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';

// import CIcon from '@coreui/icons-react';
// import { cilSearch } from '@coreui/icons';
// import '../../styles/HeaderSearch.css';

// const HeaderSearch = () => {
//   const [orderId, setOrderId] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');
//   const formRef = useRef(null);
//   const navigate = useNavigate();

//   // const handleSearch = async (e) => {
//   //   e.preventDefault();
//   //   setErrorMessage('');

//   //   if (!orderId.trim()) return;

//   //   // try {
//   //   //   const response = await getOrderByAccountId(orderId);
//   //   //   if (response?.object) {
//   //   //     if (typeof response.object === 'string') {
//   //   //       setErrorMessage(response.object);
//   //   //     } else {
//   //   //       navigate('/order-details', { state: response.object });
//   //   //     }
//   //   //   } else {
//   //   //     setErrorMessage('Order not found!');
//   //   //   }
//   //   // } catch (error) {
//   //   //   console.error('Fetch error:', error);
//   //   //   setErrorMessage('Order not found!');
//   //   // }

//   //   setOrderId('');
//   // };

//   return (
//     <div className="search-container">
//       <form
//         ref={formRef}
//         onSubmit={handleSearch}
//         className="search-form"
//       >
//         <div className="search-input-container">
//           <input
//             type="text"
//             placeholder="Search Orders"
//             value={orderId}
//             onChange={(e) => {
//               const value = e.target.value;
//               if (/^\d*$/.test(value)) {
//                 setOrderId(value);
//                 if (errorMessage) setErrorMessage('');
//               } else {
//                 setErrorMessage('Please enter numbers only.');
//               }
//             }}

//             className="search-input"
//           />

//           <button
//             type="submit"
//             title="Search"
//             className="search-button"
//           >
//             <CIcon icon={cilSearch} size="sm" className="search-icon" />
//           </button>
//         </div>
//       </form>

//       {errorMessage && (
//         <div
//           className="error-message"
//           onClick={() => setErrorMessage('')}
//           title="Click to dismiss"
//         >
//           {errorMessage}
//         </div>
//       )}
//     </div>
//   );
// };

// export default HeaderSearch;
