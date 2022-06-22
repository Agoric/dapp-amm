import { createContext } from 'react';

export const Errors = {
  IN_PROGRESS: 'Swap in progress.',
  SLIPPAGE: 'Slippage must be between 0.1 and 5 percent.',
  EMPTY_AMOUNTS: 'Please enter the amounts first.',
  NO_BRANDS: 'Please select the assets first.',
  NO_PURSES: 'Please select the purses first.',
};

export const defaultToastProperties = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  containerId: 'Info',
};

const SwapContext = createContext([{}, () => {}]);

export default SwapContext;
