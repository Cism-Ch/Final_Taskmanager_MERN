import { combineReducers, configureStore } from "@reduxjs/toolkit";
import taskReducer from "./slices/taskSlice"
import {stateValidationMiddleware }  from './slices/authSlice';
import authReducer from "./slices/authSlice"
import categoryReducer from './slices/categorySlice'
import {persistReducer, persistStore} from 'redux-persist'
import storageSession from 'redux-persist/lib/storage/session'
// import dotenv from 'dotenv'
// dotenv.config()



// const taskPersistConfig = {
//     key: 'task',
//     storage: storageSession
// }

const persistConfig = {
    key: 'root',
    storage: storageSession,
    whitelist: ['auth', 'tasks', 'categories']
};

const rootReducer = combineReducers({
    auth: authReducer,
    tasks: taskReducer,
    categories: categoryReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);
// const persistedReducer = persistReducer(persistConfig, reducers)


export const store = configureStore({
    reducer: persistedReducer,
    // devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore ces actions dans la vérification de sérialisation
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(stateValidationMiddleware),
})

export const persistor = persistStore(store)
// export default store;