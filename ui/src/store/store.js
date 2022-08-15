// The code in this file requires an understanding of Autodux.
// See: https://github.com/ericelliott/autodux
import autodux from 'autodux';

export const {
  reducer,
  initial: defaultState,
  actions: {
    setApproved,
    mergeBrandToInfo,
    addToBrandToInfo,
    updateOffers,
    resetState,
    setAutoswap,
    setPurses,
    setError,
    setPoolState,
    setPoolBrands,
    setCentral,
    setPoolFee,
    setProtocolFee,
    setLiquidityIssuerId,
  },
} = autodux({
  slice: 'treasury',
  initial: {
    approved: true,
    purses: null,
    brandToInfo: [], // [[brand, infoObj] ...]
    autoswap: null,
    assets: [],
    walletOffers: [],
    error: {},
    central: null,
    poolStates: new Map(),
    liquidityBrands: new Map(),
    poolFee: null,
    protocolFee: null,
    liquidityIssuerIds: new Map(),
  },
  actions: {
    updateOffers: (state, offers) => {
      console.log(offers);
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
    setPoolState: (state, { brand, value }) => {
      const newPoolStates = new Map(state.poolStates.entries());
      newPoolStates.set(brand, value);
      return {
        ...state,
        poolStates: newPoolStates,
      };
    },
    setLiquidityIssuerId: (state, { brand, id }) => {
      const newLiquidityIssuerIds = new Map(state.liquidityIssuerIds.entries());
      newLiquidityIssuerIds.set(brand, id);
      return {
        ...state,
        liquidityIssuerIds: newLiquidityIssuerIds,
      };
    },
  },
});
