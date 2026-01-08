import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CSpinner } from "@coreui/react";
import TitleUpdater from "./components/TitleUpdater";
import "./styles/style.scss";
import './styles/custom.css'
import { fetchUserPermissions } from "./api/authRequests";

const DefaultLayout = React.lazy(() => import("./layout/DefaultLayout"));
const Login = React.lazy(() => import("./pages/login/Login"));
const Page404 = React.lazy(() => import("./pages/page404/Page404"));
const Page500 = React.lazy(() => import("./pages/page500/Page500"));

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        dispatch({ type: "logout" });
        return;
      }
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp < currentTime) {
          localStorage.clear();
          window.location.href = '/login';
          return;
        }
        dispatch({
          type: 'set',
          userId: payload.userId,
          username: payload.username,
          accountId: payload.accountId,
        });
        dispatch({ type: 'login', token });
        const permissions = await fetchUserPermissions('Default');
        dispatch({ type: 'set_permissions', permissions });
      } catch (err) {
        console.error('Token decode error:', err);
        localStorage.clear();
        window.location.href = '/login';
      }
    };
    verifyAuth();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <TitleUpdater />
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route
            exact
            path="/login"
            name="Login Page"
            element={<Login />}
          />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />

          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
