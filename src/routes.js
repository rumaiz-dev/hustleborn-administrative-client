import React from 'react'
import ProtectedRoute from './ProtectedRoute'

const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'))

const Unauthorized = React.lazy(
    () => import('./pages/unauthorized/Unauthorized')
)

const CreateProduct = React.lazy(
    () => import('./pages/products/CreateProduct')
)

const Products = React.lazy(
    () => import('./pages/products/Products')
)

const EditProduct = React.lazy(
    () => import('./pages/products/EditProduct')
)

const CreateVariantProduct = React.lazy(
    () => import('./pages/products/CreateVariantProduct')
)

const routes = [
    { path: '/', exact: true, name: 'Home' },
    {
        path: '/dashboard',
        name: 'Dashboard',
        element: (props) => (
            <ProtectedRoute
                element={Dashboard}
                requiredPermission="Dashboard"
                {...props}
            />
        ),
    },
    {
        path: '/unauthorized',
        name: 'Unauthorized',
        element: (props) => (
            <ProtectedRoute
                element={Unauthorized}
                requiredPermission="Unauthorized"
                {...props}
            />
        ),
    },
    {
        path: '/products/create-product',
        name: 'Create Product',
        element: (props) => (
            <ProtectedRoute
                element={CreateProduct}
                requiredPermission="Create Product"
                {...props}
            />
        ),
    },
    {
        path: '/products/create-variant-product/:id',
        name: 'Create Variant Products',
        element: (props) => (
            <ProtectedRoute
                element={CreateVariantProduct}
                requiredPermission="Create Variant Products"
                {...props}
            />
        ),

    },
    {
        path: '/products/products',
        name: 'Products',
        element: (props) => (
            <ProtectedRoute
                element={Products}
                requiredPermission="Products"
                {...props}
            />
        ),
    },
    {
        path: '/products/edit-product/:id',
        name: 'Edit Product',
        element: (props) => (
            <ProtectedRoute
                element={EditProduct}
                requiredPermission="Edit Product"
                {...props}
            />
        ),
    },
  
   
 
  
]

export default routes
