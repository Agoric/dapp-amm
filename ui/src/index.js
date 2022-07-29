/* eslint-disable import/no-extraneous-dependencies */
import './lockdown.js';
import '@endo/eventual-send/shim';
import React from 'react';
import { render } from 'react-dom';
import ApplicationContextProvider from 'context/Application';
import App from './App';

render(
  <ApplicationContextProvider>
    <App />
  </ApplicationContextProvider>,
  document.getElementById('root'),
);
