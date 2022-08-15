import React, { createContext, useContext, useReducer } from 'react';
import 'json5';
import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';
import { E } from '@endo/eventual-send';
import { iterateLatest, makeFollower, makeLeader } from '@agoric/casting';

import { boardIdUnserializer } from 'utils/boardIdUnserializer';
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
  setInstanceId,
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
      dispatch(updateOffers(offers));
    }
  }
  offersUpdater().catch(err => console.error('Offers watcher exception', err));
};

const watchPoolMetrics = async (dispatch, brand, i, leader, unserializer) => {
  const f = makeFollower(`:published.amm.pool${i}.metrics`, leader, {
    unserializer,
  });

  for await (const { value } of iterateLatest(f)) {
    dispatch(setPoolState({ brand, value }));
    if (i === 0) {
      dispatch(setCentral(value.centralAmount.brand));
    }
  }
};

const loadPoolInit = async (dispatch, brand, i, leader) => {
  const f = makeFollower(`:published.amm.pool${i}.init`, leader, {
    unserializer: boardIdUnserializer,
  });

  // TODO: Find a more elegant way to read just the first value.
  for await (const { value } of iterateLatest(f)) {
    dispatch(
      setLiquidityIssuerId({ brand, id: value.liquidityIssuerRecord.issuer }),
    );
    return;
  }
};

const watchMetrics = async (dispatch, leader, unserializer) => {
  const f = makeFollower(':published.amm.metrics', leader, { unserializer });

  for await (const { value } of iterateLatest(f)) {
    value.XYK.forEach((brand, i) => {
      watchPoolMetrics(dispatch, brand, i, leader, unserializer).catch(err =>
        console.error('got watchPoolMetrics err', err),
      );
      loadPoolInit(dispatch, brand, i, leader).catch(err =>
        console.error('got loadPoolInit err', err),
      );
    });
  }
};

const watchGovernedParams = async (dispatch, leader, unserializer) => {
  const f = makeFollower(':published.amm.governance', leader, { unserializer });

  for await (const { value } of iterateLatest(f)) {
    const { PoolFee, ProtocolFee } = value.current;
    dispatch(setPoolFee(PoolFee.value));
    dispatch(setProtocolFee(ProtocolFee.value));
  }
};

const watchPurses = async (dispatch, brandToInfo) => {
  const n = await E(walletP).getPursesNotifier();
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

const loadInstanceId = async (dispatch, leader) => {
  const f = makeFollower(`:published.agoricNames.instance`, leader, {
    unserializer: boardIdUnserializer,
  });

  // TODO: Find a more elegant way to read just the first value.
  for await (const { value } of iterateLatest(f)) {
    const mappedEntries = new Map(value);
    dispatch(setInstanceId(mappedEntries.get('amm')));
    return;
  }
};

const Provider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { brandToInfo } = state;

  const leader = makeLeader();

  const retrySetup = async () => {
    const unserializer = await E(walletP).getUnserializer();
    watchPurses(dispatch, brandToInfo).catch(err =>
      console.error('got watchPurses err', err),
    );

    watchMetrics(dispatch, leader, unserializer).catch(err =>
      console.error('got watchMetrics err', err),
    );

    watchGovernedParams(dispatch, leader, unserializer).catch(err =>
      console.error('got watchGovernedParams err', err),
    );

    loadInstanceId(dispatch, leader).catch(err =>
      console.error('got loadInstanceId err', err),
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
