import { E } from '@endo/captp';
import { makeRatio } from '@agoric/zoe/src/contractSupport';
import { dappConfig } from '../utils/config.js';

export const requestRatio = async (brand, makeRate, centralBrand, ammAPI) => {
  if (brand === centralBrand) {
    // See marketPrice comment above
    return {
      brand: centralBrand,
      ratio: makeRatio(100000000n, centralBrand, 100000000n, centralBrand),
    };
  }
  let poolRate = { brand, ratio: null };
  const alloc = await E(ammAPI).getPoolAllocation(brand);

  // only update if the brand hasn't changed
  const ratio = makeRate(alloc.Central, alloc.Secondary);
  console.log(`Pool allocation`, alloc, ratio);

  poolRate = poolRate.brand === brand ? { brand, ratio } : poolRate;
  // poolRate = poolRate(q => (q.brand === brand ? { brand, ratio } : q));
  return poolRate;
};

export const makeSwapOffer = async (
  walletP,
  ammAPI,
  inputPurse,
  inputAmount,
  outputPurse,
  outputAmount,
  isSwapIn,
) => {
  console.log('PURSES:', inputPurse, outputPurse);
  const id = `${Date.now()}`;

  const { AMM_INSTALLATION_BOARD_ID, AMM_INSTANCE_BOARD_ID } = dappConfig;

  const invitation = isSwapIn
    ? E(ammAPI).makeSwapInInvitation()
    : E(ammAPI).makeSwapOutInvitation();

  const offerConfig = {
    id,
    invitation,
    installationHandleBoardId: AMM_INSTALLATION_BOARD_ID,
    instanceHandleBoardId: AMM_INSTANCE_BOARD_ID,
    proposalTemplate: {
      give: {
        In: {
          // The pursePetname identifies which purse we want to use
          pursePetname: inputPurse.pursePetname,
          value: inputAmount,
        },
      },
      want: {
        Out: {
          pursePetname: outputPurse.pursePetname,
          value: outputAmount,
        },
      },
    },
  };

  console.info('OFFER CONFIG: ', offerConfig);

  await E(walletP).addOffer(offerConfig);
};
