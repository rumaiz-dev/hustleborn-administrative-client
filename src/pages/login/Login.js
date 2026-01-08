import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
    CButton,
    CCard,
    CCardBody,
    CCol,
    CContainer,
    CForm,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { useDispatch, useSelector } from 'react-redux'
import { login, fetchUserPermissions } from '../../api/authRequests'
import { jwtDecode } from 'jwt-decode'

const Login = () => {
    const dispatch = useDispatch()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const isAuthenticated = useSelector((state) => state.isAuthenticated)
    if (isAuthenticated) {
        return <Navigate to="/" />
    }
    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const response = await login(username, password)
            const { token } = response;
            localStorage.setItem('token', token);
            const decoded = jwtDecode(token);
            dispatch({
                type: 'set',
                userId: decoded.userId,
                accountId: decoded.accountId,
                username: decoded.username,
            })
            dispatch({ type: 'login', token })
            await fetchUserPermissions('Default')
                .then((permissions) => {
                    dispatch({ type: 'set_permissions', permissions })
                })
                .catch((error) => {
                    console.error('Failed to fetch permissions:', error)
                })
        } catch (err) {
            console.error('Login failed:', err)
            setError('Invalid username or password. Please try again.')
        }
    }

    return (
        <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
            <CContainer>
                <CRow className="justify-content-center">
                    <CCol md={4}>
                        <CCard className="p-4">
                            <CCardBody>
                                <CForm onSubmit={handleLogin}>
                                    <h1>Login</h1>
                                    <p className="text-body-secondary">
                                        Sign In to your account
                                    </p>
                                    {error && (
                                        <p className="text-danger">{error}</p>
                                    )}
                                    <CInputGroup className="mb-3">
                                        <CInputGroupText>
                                            <CIcon icon={cilUser} />
                                        </CInputGroupText>
                                        <CFormInput
                                            placeholder="Username"
                                            autoComplete="username"
                                            value={username}
                                            onChange={(e) =>
                                                setUsername(e.target.value)
                                            }
                                            required
                                        />
                                    </CInputGroup>
                                    <CInputGroup className="mb-4">
                                        <CInputGroupText>
                                            <CIcon icon={cilLockLocked} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type="password"
                                            placeholder="Password"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            required
                                        />
                                    </CInputGroup>
                                    <CRow>
                                        <CCol xs={6}>
                                            <CButton
                                                type="submit"
                                                color="primary"
                                                className="px-4"
                                            >
                                                Login
                                            </CButton>
                                        </CCol>
                                        <CCol xs={6} className="text-right">
                                            <CButton
                                                color="link"
                                                className="px-0"
                                            >
                                                Forgot password?
                                            </CButton>
                                        </CCol>
                                    </CRow>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default Login
