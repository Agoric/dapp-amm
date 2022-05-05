import React, { createContext, useContext, useReducer } from 'react';
import 'json5';
import 'utils/installSESLockdown';

import { makeAsyncIterableFromNotifier as iterateNotifier } from '@agoric/notifier';
import { E } from '@endo/eventual-send';

import WalletConnection from '../components/components/WalletConnection';
import { dappConfig, refreshConfigFromWallet } from '../utils/config';

import {
  reducer,
  defaultState,
  setAssets,
  setAutoswap,
  setApproved,
  updateOffers,
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

const setupAMM = async (dispatch, brandToInfo, zoe, board, instanceID) => {
  const instance = await E(board).getValue(instanceID);
  const [ammAPI, terms] = await Promise.all([
    E(zoe).getPublicFacet(instance),
    E(zoe).getTerms(instance),
  ]);
  // TODO this uses getTerms.brands, but that includes utility tokens, etc.
  // We need a query/notifier for what are the pools supported
  const {
    brands: { Central: centralBrand },
  } = terms;
  const poolBrands = await E(ammAPI).getAllPoolBrands();
  console.log('AMM brands retrieved', centralBrand, poolBrands);

  dispatch(setAutoswap({ instance, ammAPI, centralBrand, poolBrands }));
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
        dispatch(setAssets(purses));
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
