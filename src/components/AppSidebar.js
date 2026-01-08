import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { filterNavigationItems } from '../utils/accessControl'

import {
    CCloseButton,
    CSidebar,
    CSidebarBrand,
    CSidebarFooter,
    CSidebarHeader,
    CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { AppSidebarNav } from './AppSidebarNav'
import logo from '../assets/brand/hustlebornLogo.png'
import navigation from '../_nav'

const AppSidebar = () => {
    const dispatch = useDispatch()
    const unfoldable = useSelector((state) => state.sidebarUnfoldable)
    const sidebarShow = useSelector((state) => state.sidebarShow)
    const permissions = useSelector((state) => state.auth.permissions || [])

    const filteredNavigation = useMemo(
        () => filterNavigationItems(navigation, permissions),
        [navigation, permissions]
    )

    return (
        <CSidebar
            className="border-end"
            colorScheme="light"
            position="fixed"
            unfoldable={unfoldable}
            visible={sidebarShow}
            onVisibleChange={(visible) => {
                dispatch({ type: 'set', sidebarShow: visible })
            }}
        >
            <CSidebarHeader className="border-bottom" style={{height:'10px'}}>
                <CSidebarBrand to="/">
                    <img
                        src={logo}
                        alt="Bigmall Logo"
                        className="sidebar-brand-full"
                        height={40}
                    />
                    <CIcon
                        customClassName="sidebar-brand-narrow"
                        icon="cil-home"
                        height={32}
                    />
                </CSidebarBrand>
                <CCloseButton
                    className="d-lg-none"
                    dark
                    onClick={() =>
                        dispatch({ type: 'set', sidebarShow: false })
                    }
                />
            </CSidebarHeader>
     
            <AppSidebarNav items={filteredNavigation} />
            <CSidebarFooter className="border-top d-none d-lg-flex">
                <CSidebarToggler
                    onClick={() =>
                        dispatch({
                            type: 'set',
                            sidebarUnfoldable: !unfoldable,
                        })
                    }
                />
            </CSidebarFooter>
        </CSidebar>
    )
}

export default React.memo(AppSidebar)
