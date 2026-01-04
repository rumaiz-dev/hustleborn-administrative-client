import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import routes from '../routes'; 

const TitleUpdater = () => {
    const location = useLocation();

    useEffect(() => {
        const getRouteName = (pathname, routes) => {
            const currentRoute = routes.find((route) => {
                const routePathRegex = new RegExp(`^${route.path.replace(/:\w+/g, '[^/]+')}$`);
                return routePathRegex.test(pathname);
            });
            return currentRoute ? currentRoute.name : null;
        };

        const pageTitle = getRouteName(location.pathname, routes) || 'Hustleborn Admin';
        document.title = pageTitle;
    }, [location]);

    return null;
};

export default TitleUpdater;
