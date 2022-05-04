// The code in this file requires an understanding of Autodux.
// See: https://github.com/ericelliott/autodux
import autodux from 'autodux';
import { v4 as uuidv4 } from 'uuid';
import agoricLogo from 'assets/crypto-icons/agoric-logo.png';
import bldLogo from 'assets/crypto-icons/bld-logo.png';
import kirkLogo from 'assets/crypto-icons/kirk-logo.png';
import usdcLogo from 'assets/crypto-icons/usdc-logo.png';
import { stringifyPurseValue } from '@agoric/ui-components';

export const {
  reducer,
  initial: defaultState,
  actions: {
    setApproved,
    setConnected,
    mergeBrandToInfo,
    addToBrandToInfo,
    updateOffers,
    resetState,
    setAutoswap,
    setAssets,
    setError,
  },
} = autodux({
  slice: 'treasury',
  initial: {
    approved: true,
    connected: false,
    purses: null,
    brandToInfo: [], // [[brand, infoObj] ...]
    autoswap: {},
    assets: [],
    walletOffers: [],
    error: {},
  },
  actions: {
    updateOffers: (state, offers) => {
      console.log('============Update offer reducer=====================');
      console.log(offers);
      console.log('============Update offer reducer=====================');
      return {
        ...state,
        walletOffers: offers,
      };
    },
    resetState: state => ({
      ...state,
      purses: null,
    }),
    mergeBrandToInfo: (state, newBrandToInfo) => {
      const merged = new Map([...state.brandToInfo, ...newBrandToInfo]);
      const brandToInfo = [...merged.entries()];
      return {
        ...state,
        brandToInfo,
      };
    },
    setError: (state, error) => {
      return {
        ...state,
        error,
      };
    },
    setAssets: (state, purses) => {
      const filteredPurses = purses?.filter(
        purse => purse.displayInfo.assetKind !== 'set',
      );
      // used for storing intermediate response
      const interArr = [];
      filteredPurses?.forEach(purse => {
        const balance = stringifyPurseValue(purse);
        // if such asset already inserted
        const similarAssetIndex = interArr.findIndex(elem => {
          return elem.code === purse.brandPetname;
        });

        if (similarAssetIndex !== -1) {
          interArr[similarAssetIndex].balance += balance;

          interArr[similarAssetIndex].purses.push({
            id: uuidv4(),
            name: purse.pursePetname,
            balance,
            // cmt(danish): balance USD not available right now
            balanceUSD: undefined,
            ...purse,
          });
          // skip if already includes but add in purse
          console.log('skipping: ', purse);
          return;
        }

        // setting default image as agoric logo
        let image = agoricLogo;
        switch (purse.brandPetname) {
          case 'RUN':
            image = agoricLogo;
            break;
          case 'BLD':
            image = bldLogo;
            break;
          case 'LINK':
            image = kirkLogo;
            break;
          case 'USDC':
            image = usdcLogo;
            break;
          default:
            break;
        }

        interArr.push({
          id: uuidv4(),
          code: purse.brandPetname,
          name: purse.brandPetname,
          brand: purse.brand,
          // cmt(danish): no images defined now
          image,
          balance,
          purses: [
            {
              id: uuidv4(),
              name: purse.pursePetname,
              balance,
              // cmt(danish): balance USD not available right now
              balanceUSD: undefined,
              ...purse,
            },
          ],
        });
      });
      console.log('asset being updated :', interArr);
      return {
        ...state,
        purses,
        assets: interArr,
      };
    },
  },
});
