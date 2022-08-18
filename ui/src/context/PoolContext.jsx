import { createContext } from 'react';

export const defaultToastProperties = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  containerId: 'Info',
};

export const Errors = {
  IN_PROGRESS: 'Offer in progress.',
  NO_BRANDS: 'Please select the asset first.',
  NO_PURSES: 'Please select the purses first.',
  NO_AMOUNTS: 'Please enter the amounts first.',
};

const PoolContext = createContext([{}, () => {}]);

export default PoolContext;
