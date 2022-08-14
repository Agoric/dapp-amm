import React, { createContext, useContext, useReducer } from 'react';
import 'json5';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';
import { E } from '@endo/eventual-send';
import { iterateLatest, makeFollower, makeLeader } from '@agoric/casting';

import { unserializer } from 'utils/boardIdUnserializer';
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
  setLiquidityIssuerId,
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
    if (i === 0) {
      dispatch(setCentral(state.centralAmount.brand));
    }
  }
};

const watchPoolInit = async (dispatch, brand, i, leader) => {
  const f = makeFollower(`:published.amm.pool${i}.init`, leader, {
    unserializer,
  });

  for await (const { value: state } of iterateLatest(f)) {
    dispatch(
      setLiquidityIssuerId({ brand, id: state.liquidityIssuerRecord.issuer }),
    );
  }
};

const watchMetrics = async dispatch => {
  const f = E(walletP).makeFollower(':published.amm.metrics');
  const leader = makeLeader();

  for await (const { value: state } of iterateLatest(f)) {
    state.XYK.forEach((brand, i) => {
      watchPoolMetrics(dispatch, brand, i).catch(err =>
        console.error('got watchPoolMetrics err', err),
      );
      watchPoolInit(dispatch, brand, i, leader).catch(err =>
        console.error('got watchPoolInit err', err),
      );
    });
  }
};

const watchGovernedParams = async dispatch => {
  const f = E(walletP).makeFollower(':published.amm.governance');
  for await (const { value: state } of iterateLatest(f)) {
    const { PoolFee, ProtocolFee } = state.current;
    dispatch(setPoolFee(PoolFee.value));
    dispatch(setProtocolFee(ProtocolFee.value));
  }
};

const watchPurses = async (dispatch, brandToInfo) => {
  const n = await E(walletP).getPursesNotifier();
  console.log(n);
  for await (const purses of iterateNotifier(n)) {
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

    watchGovernedParams(dispatch).catch(err =>
      console.error('got watchGovernedParams err', err),
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
