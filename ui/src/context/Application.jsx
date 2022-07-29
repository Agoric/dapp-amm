import React, { createContext, useContext, useReducer } from 'react';
import 'json5';

import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';
import { E } from '@endo/eventual-send';
import { iterateLatest } from '@agoric/casting';

import WalletConnection from '../components/components/WalletConnection';

import {
  reducer,
  defaultState,
  setPurses,
  setApproved,
  updateOffers,
  setPoolState,
  setCentral,
  setPoolFee,
  setProtocolFee,
} from '../store/store';

import { storePurseBrand } from '../utils/storeBrandInfo';

/* eslint-disable */
let walletP;
/* eslint-enable */

export { walletP };

export const ApplicationContext = createContext();

export const useApplicationContext = () => useContext(ApplicationContext);

const watchOffers = dispatch => {
  async function offersUpdater() {
    const offerNotifier = E(walletP).getOffersNotifier();
    for await (const offers of iterateNotifier(offerNotifier)) {
      console.log('======== OFFERS', offers);
      dispatch(updateOffers(offers));
    }
  }
  offersUpdater().catch(err => console.error('Offers watcher exception', err));
};

const watchPoolMetrics = async (dispatch, brand, i) => {
  const f = E(walletP).makeFollower(`:published.amm.pool${i}.metrics`);
  for await (const { value: state } of iterateLatest(f)) {
    dispatch(setPoolState({ brand, value: state }));
  }
};

const watchMetrics = async dispatch => {
  const f = E(walletP).makeFollower(':published.amm.metrics');
  for await (const { value: state } of iterateLatest(f)) {
    dispatch(setCentral(state.central[1]));
    dispatch(setPoolFee(state.poolFee));
    dispatch(setProtocolFee(state.protocolFee));
    state.XYK.forEach((brand, i) =>
      watchPoolMetrics(dispatch, brand, i).catch(err =>
        console.error('got watchPoolMetrics err', err),
      ),
    );
  }
};

const watchPurses = async (dispatch, brandToInfo) => {
  const n = await E(walletP).getPursesNotifier();
  for await (const purses of iterateNotifier(n)) {
    console.log('PURSES:', purses);
    dispatch(setPurses(purses));
    purses.forEach(({ brand, displayInfo, brandPetname: petname }) =>
      storePurseBrand({
        dispatch,
        brandToInfo,
        brand,
        petname,
        displayInfo,
      }),
    );
  }
};

const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { brandToInfo } = state;

  const retrySetup = async () => {
    watchPurses(dispatch, brandToInfo).catch(err =>
      console.error('got watchPurses err', err),
    );

    watchMetrics(dispatch).catch(err =>
      console.error('got watchMetrics err', err),
    );

    watchOffers(dispatch);
    setApproved(true);
  };

  const setWalletP = async bridge => {
    walletP = bridge;
    await retrySetup();
  };

  return (
    <ApplicationContext.Provider value={{ state, dispatch, walletP }}>
      {children}
      <WalletConnection setWalletP={setWalletP} dispatch={dispatch} />
    </ApplicationContext.Provider>
  );
};

export default Provider;
