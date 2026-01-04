export const hasPermission = (permissions, requiredPermission) => {
    return permissions.some((perm) => perm === requiredPermission)
}

export const filterNavigationItems = (navItems, permissions) => {
    return navItems
        .map((item) => {
            if (item.items) {
                const filteredItems = filterNavigationItems(
                    item.items,
                    permissions
                )

                if (filteredItems.length > 0) {
                    return { ...item, items: filteredItems }
                }
                return null
            }

            const requiredPermission = item.permission || item.name
            return hasPermission(permissions, requiredPermission) ? item : null
        })
        .filter(Boolean)
}
