# Improved Redux State Structure for Authentication Token Management

## Overview
This design proposes migrating from legacy Redux to Redux Toolkit (RTK) for modern, slice-based state management. The goal is to make Redux the single source of truth for authentication tokens, eliminating direct localStorage dependencies in API calls and centralizing token storage and retrieval.

## Current State Analysis
- **Token Storage**: Token is stored in both `localStorage` and Redux state, with Redux persisting to `sessionStorage` via `redux-persist`.
- **API Integration**: API requests retrieve tokens directly from `localStorage` in the request interceptor (`src/utils/api.js`).
- **Login Flow**: On successful login, token is set in `localStorage` and dispatched to Redux.
- **Logout Flow**: Clears `localStorage`, dispatches logout action, and purges persisted state.
- **Issues**: Dual storage creates potential synchronization issues; API depends on browser storage instead of application state.

## Proposed Architecture

### 1. Redux Toolkit Migration
Migrate from legacy `createStore` and switch-case reducers to RTK's `configureStore` and slice-based reducers for better TypeScript support, less boilerplate, and built-in immutability.

### 2. Auth Slice Design

#### State Shape
```typescript
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    id: number | null;
    username: string | null;
    accountId: number | null;
  };
  permissions: string[];
  loading: boolean;
  error: string | null;
}
```

#### Initial State
```typescript
const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  user: {
    id: null,
    username: null,
    accountId: null,
  },
  permissions: [],
  loading: false,
  error: null,
};
```

#### Actions and Reducers
- **login**: Sets token, user data, permissions, and authentication status.
- **logout**: Resets state to initial values.
- **refreshToken**: Updates token on refresh.
- **setPermissions**: Updates user permissions.
- **setLoading**: Manages loading states for async operations.
- **setError**: Handles error states.

#### Slice Definition
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; user: AuthState['user']; permissions: string[] }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.permissions = action.payload.permissions;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      return initialState;
    },
    refreshToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { login, logout, refreshToken, setPermissions, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
```

### 3. Selectors
```typescript
export const selectToken = (state: RootState) => state.auth.token;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectPermissions = (state: RootState) => state.auth.permissions;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
```

### 4. Store Configuration
```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session'; // sessionStorage
import authReducer from './slices/authSlice';
// ... other slices

const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'isAuthenticated', 'user', 'permissions'],
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    // ... other reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 5. API Integration
Modify `src/utils/api.js` to retrieve token from Redux store instead of localStorage.

```typescript
import { store } from '../store'; // Import the configured store

api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      try {
        const refreshResponse = await api.post('/auth/refresh');
        const newToken = refreshResponse.data.token;
        store.dispatch(refreshToken(newToken));
        // Retry the original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch (refreshError) {
        store.dispatch(logout());
        // Redirect to login or handle logout
      }
    }
    return Promise.reject(error);
  }
);
```

### 6. Token Refresh Mechanism
- Implement a `refreshToken` API function in `src/api/authRequests.js`.
- Use RTK Query or thunks for async token refresh.
- Automatic refresh on 401 responses in response interceptor.

### 7. Integration Points

#### Login Component (`src/pages/login/Login.js`)
- Dispatch `login` action with token, user data, and permissions.
- Remove `localStorage.setItem('token', token)`.
- Use async thunks for login API call.

#### Logout Component (`src/components/header/AppHeaderDropdown.js`)
- Dispatch `logout` action.
- Remove manual `localStorage` and cookie clearing (handled by Redux).
- Persistor purge remains for complete state reset.

#### Protected Routes (`src/ProtectedRoute.js`)
- Use `selectIsAuthenticated` selector.

#### Other Components
- Access token via `selectToken` selector if needed.
- Use `selectPermissions` for access control.

### 8. Migration Steps
1. Install Redux Toolkit and RTK Query if needed.
2. Create auth slice as described.
3. Update store configuration.
4. Modify API interceptors.
5. Update login/logout components.
6. Test persistence and token refresh.
7. Remove legacy localStorage dependencies.

### 9. Benefits
- **Single Source of Truth**: Redux manages all auth state.
- **Consistency**: No sync issues between localStorage and Redux.
- **Maintainability**: Slice-based structure is easier to maintain.
- **Type Safety**: Better TypeScript integration.
- **Automatic Persistence**: Seamless rehydration on app restart.

### 10. Considerations
- **Security**: Ensure tokens are not logged or exposed in development.
- **Token Expiry**: Implement proactive token refresh before expiry.
- **Error Handling**: Comprehensive error states for auth operations.
- **Testing**: Unit tests for slices, integration tests for API flows.