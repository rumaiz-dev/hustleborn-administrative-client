import React from 'react';
import { useLocation } from 'react-router-dom';
import routes from '../routes';
import {
  CBreadcrumb,
  CBreadcrumbItem
} from '@coreui/react';

const AppBreadcrumb = () => {
  const currentLocation = useLocation().pathname;

  const getRouteName = (pathname, routes) => {
    const currentRoute = routes.find((route) => {
      const routePathRegex = new RegExp(`^${route.path.replace(/:\w+/g, '[^/]+')}$`);
      return routePathRegex.test(pathname);
    });
    return currentRoute ? currentRoute.name : false;
  };

  const getBreadcrumbs = (location) => {
    const breadcrumbs = [];
    location.split('/').reduce((prev, curr, index, array) => {
      const currentPathname = `${prev}/${curr}`;
      const routeName = getRouteName(currentPathname, routes);
      routeName &&
        breadcrumbs.push({
          pathname: currentPathname,
          name: routeName,
          active: index + 1 === array.length,
        });
      return currentPathname;
    });
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(currentLocation);
  const pageTitle = getRouteName(currentLocation, routes);

  return (
    <div>
      <CBreadcrumb className="my-0" style={{fontSize:'12px'}}>
        <CBreadcrumbItem href="/">Home</CBreadcrumbItem>
        {breadcrumbs.map((breadcrumb, index) => (
          <CBreadcrumbItem
            {...(breadcrumb.active ? { active: true } : { href: breadcrumb.pathname })}
            key={index}
          >
            {breadcrumb.name}
          </CBreadcrumbItem>
        ))}
      </CBreadcrumb>
    </div>
  );
};

export default React.memo(AppBreadcrumb);
