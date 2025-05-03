import './utils/darkMode';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from "react-router-dom"
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
// import store from './redux/store.js'
// import { getTasks, getOwnerTasks } from './redux/slices/taskSlice.js'
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './redux/store.js';

// store.dispatch(getOwnerTasks())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <HelmetProvider>
        <HashRouter>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <App />
            </PersistGate>
          </Provider>
        </HashRouter>
      </HelmetProvider>
    </React.StrictMode>,
)
