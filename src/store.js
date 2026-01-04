import { legacy_createStore as createStore } from 'redux'
import { persistStore, persistReducer } from 'redux-persist'
import sessionStorage from 'redux-persist/lib/storage/session'

const initialState = {
    sidebarShow: true,
    theme: 'light',
    isAuthenticated: false,
    permissions: [],
    userId: null,
    accountId: null,
    username: null,
}

const changeState = (state = initialState, { type, ...rest }) => {
    switch (type) {
        case 'set':
            return { ...state, ...rest }
        case 'login':
            return { ...state, isAuthenticated: true }
        case 'logout':
            return { ...state, isAuthenticated: false, permissions: [], userId: null, accountId: null, username: null }
        case 'set_permissions':
            return {
                ...state,
                permissions: rest.permissions,
                isAuthenticated: true,
            }
        default:
            return state
    }
}

// Redux Persist configuration
const persistConfig = {
    key: 'root',
    storage: sessionStorage,
    whitelist: ['isAuthenticated', 'permissions', 'userId', 'accountId', 'username'], // Only persist specific keys if desired

}

const persistedReducer = persistReducer(persistConfig, changeState)

const store = createStore(persistedReducer)
const persistor = persistStore(store)

export { store, persistor }
