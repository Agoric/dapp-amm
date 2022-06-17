import React, { createContext, useContext, useReducer } from 'react';
import 'json5';

import {
  makeAsyncIterableFromNotifier as iterateNotifier,
  makeNotifierFromAsyncIterable,
} from '@agoric/notifier';
import { E } from '@endo/eventual-send';

import WalletConnection from '../components/components/WalletConnection';
import { dappConfig, refreshConfigFromWallet } from '../utils/config';

import {
  reducer,
  defaultState,
  setPurses,
  setAutoswap,
  setApproved,
  updateOffers,
  setPoolState,
  setLiquidityBrand,
} from '../store/store';

import {
  updateBrandPetnames,
  storeAllBrandsFromTerms,
} from '../utils/storeBrandInfo';

/* eslint-disable */
let walletP;
/* eslint-enable */

export { walletP };

export const ApplicationContext = createContext();

export function useApplicationContext() {
  return useContext(ApplicationContext);
}

const watchPool = async (dispatch, ammAPI, brand) => {
  const updatePoolState = value => {
    console.log('updating pool state', brand, value);
    dispatch(setPoolState({ brand, value }));
  };
  const poolUpdater = async () => {
    const poolSubscription = await E(ammAPI).getPoolMetrics(brand);
    const poolNotifier = makeNotifierFromAsyncIterable(poolSubscription);
    for await (const value of iterateNotifier(poolNotifier)) {
      updatePoolState(value);
    }
  };
  poolUpdater().catch(err =>
    console.error('Brand watcher exception', brand, err),
  );
};

const fetchLiquidityBrand = async (poolBrand, dispatch, ammApi) => {
  const { Liquidity } = await E(ammApi).getPoolAllocation(poolBrand);
  if (Liquidity?.brand) {
    dispatch(
      setLiquidityBrand({ brand: poolBrand, liquidityBrand: Liquidity?.brand }),
    );
  }
};

const setupAMM = async (dispatch, brandToInfo, zoe, board, instanceID) => {
  const instance = await E(board).getValue(instanceID);
  const [ammAPI, terms] = await Promise.all([
    E(zoe).getPublicFacet(instance),
    E(zoe).getTerms(instance),
  ]);
  const {
    brands: { Central: centralBrand },
  } = terms;

  const [poolBrands, governedParams] = await Promise.all([
    E(ammAPI).getAllPoolBrands(),
    E(ammAPI).getGovernedParams(),
  ]);
  console.log('AMM brands:', centralBrand, poolBrands);
  console.log('AMM governed params:', governedParams);
  const poolFee = governedParams.PoolFee.value;
  const protocolFee = governedParams.ProtocolFee.value;
  dispatch(
    setAutoswap({
      instance,
      ammAPI,
      centralBrand,
      poolBrands,
      poolFee,
      protocolFee,
    }),
  );
  poolBrands.forEach(poolBrand => watchPool(dispatch, ammAPI, poolBrand));
  poolBrands.forEach(poolBrand =>
    fetchLiquidityBrand(poolBrand, dispatch, ammAPI),
  );

  await storeAllBrandsFromTerms({
    dispatch,
    terms,
    brandToInfo,
  });
};

function watchOffers(dispatch) {
  async function offersUpdater() {
    const offerNotifier = E(walletP).getOffersNotifier();
    for await (const offers of iterateNotifier(offerNotifier)) {
      console.log('======== OFFERS', offers);
      dispatch(updateOffers(offers));
    }
  }
  offersUpdater().catch(err => console.error('Offers watcher exception', err));
}

/* eslint-disable complexity, react/prop-types */
export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const { brandToInfo } = state;

  const retrySetup = async () => {
    await refreshConfigFromWallet(walletP);
    const {
      RUN_ISSUER_BOARD_ID,
      AMM_INSTALLATION_BOARD_ID,
      AMM_INSTANCE_BOARD_ID,
      AMM_NAME,
    } = dappConfig;
    console.log('dappConfig', dappConfig);

    const zoe = E(walletP).getZoe();
    const board = E(walletP).getBoard();
    if (board) {
      setApproved(true);
    }
    await Promise.all([
      // setupTreasury(dispatch, brandToInfo, zoe, board, INSTANCE_BOARD_ID),
      setupAMM(dispatch, brandToInfo, zoe, board, AMM_INSTANCE_BOARD_ID),
    ]);
    async function watchPurses() {
      const pn = E(walletP).getPursesNotifier();
      for await (const purses of iterateNotifier(pn)) {
        dispatch(setPurses(purses));
      }
    }
    watchPurses().catch(err => console.error('got watchPurses err', err));
    async function watchBrands() {
      console.log('BRANDS REQUESTED');
      const issuersN = E(walletP).getIssuersNotifier();
      for await (const issuers of iterateNotifier(issuersN)) {
        updateBrandPetnames({
          dispatch,
          brandToInfo,
          issuersFromNotifier: issuers,
        });
      }
    }
    watchBrands().catch(err => {
      console.error('got watchBrands err', err);
    });
    await Promise.all([
      E(walletP).suggestInstallation(
        `${AMM_NAME}Installation`,
        AMM_INSTALLATION_BOARD_ID,
      ),
      E(walletP).suggestInstance(`${AMM_NAME}Instance`, AMM_INSTANCE_BOARD_ID),
      E(walletP).suggestIssuer('RUN', RUN_ISSUER_BOARD_ID),
    ]);

    watchOffers(dispatch);
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
}
