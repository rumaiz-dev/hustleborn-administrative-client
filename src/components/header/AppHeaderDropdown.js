import {
    CAvatar,
    CDropdown,
    CDropdownHeader,
    CDropdownMenu,
    CDropdownToggle,
} from '@coreui/react'
import { cilSettings } from '@coreui/icons'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { persistor } from '../../store'
import CIcon from '@coreui/icons-react'
import { useSelector } from 'react-redux'
import { logout } from '../../slices/authSlice'


const AppHeaderDropdown = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const username = useSelector(state => state.username)

    const handleLogout = async () => {
        Cookies.remove('accessToken')
        dispatch(logout())
        persistor.purge()
        navigate('/login')
    }

    return (
        <div className="d-flex align-items-center gap-3">

            <CDropdown variant="nav-item">
                <CDropdownToggle className="py-0 pe-0" caret={false}>
                    <span className="me-2">{username}</span>
                    <CAvatar color="primary" textColor="white">
                        <CIcon icon={cilSettings} />
                    </CAvatar>
                </CDropdownToggle>
                <CDropdownMenu className="pt-0" placement="bottom-end">
                    <CDropdownHeader
                        className="bg-body-secondary fw-semibold my-2"
                        onClick={handleLogout}
                    >
                        Logout
                    </CDropdownHeader>
                </CDropdownMenu>
            </CDropdown>
        </div>
    )
}

export default AppHeaderDropdown
