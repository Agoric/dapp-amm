import 'json5';
import '@agoric/install-ses';
import React from 'react';
import { render } from 'react-dom';

import ApplicationContextProvider from './contexts/Application';
import App from './pages/App';

render(
  <ApplicationContextProvider>
    <App />
  </ApplicationContextProvider>,
  document.getElementById('root'),
);
