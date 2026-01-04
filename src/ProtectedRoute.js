/* eslint-disable prettier/prettier */
import React from 'react'
import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Utility function to check permissions
const hasPermission = (permissions, requiredPermission) => {
    const permission = permissions.find((perm) => perm === requiredPermission)
    return permission
}

const ProtectedRoute = ({ element: Component, requiredPermission }) => {
    const isAuthenticated = useSelector((state) => state.isAuthenticated)
    const permissions = useSelector((state) => state.permissions || [])
    if (!isAuthenticated) {
        return <Navigate to="/login" />
    }

    if (!hasPermission(permissions, requiredPermission)) {
        return <Navigate to="/unauthorized" /> // Redirect to an unauthorized page
    }

    return <Component />
}
ProtectedRoute.propTypes = {
    element: PropTypes.elementType.isRequired, // Component to render
    requiredPermission: PropTypes.string.isRequired, // Permission resource
}

export default ProtectedRoute
