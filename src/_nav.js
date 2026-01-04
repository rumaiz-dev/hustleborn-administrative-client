import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cibGhost, cilTask, cilTouchApp, cilSpreadsheet, cilUser } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const navStyle = { fontSize: '0.85rem', fontWeight: '500' };

const _nav = [
    {
        component: CNavItem,
        name: 'Dashboard',
        permission: 'Dashboard',
        to: '/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        style: navStyle,
    },
    {
        component: CNavGroup,
        name: 'Products',
        to: '/products',
        icon: <CIcon icon={cilTouchApp} customClassName="nav-icon" />,
        style: navStyle,
        items: [
            {
                component: CNavItem,
                name: 'Products',
                permission: 'Products',
                to: '/products/products',
                style: navStyle,
            },
        ],
    },
    
]

export default _nav
