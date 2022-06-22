import { E } from '@endo/captp';
import { dappConfig } from '../utils/config.js';

export const makeSwapOffer = async (
  walletP,
  ammAPI,
  inputPurse,
  inputValue,
  outputPurse,
  outputValue,
) => {
  console.log('PURSES:', inputPurse, outputPurse);
  const id = `${Date.now()}`;
  const { AMM_INSTALLATION_BOARD_ID, AMM_INSTANCE_BOARD_ID } = dappConfig;
  const invitation = E(ammAPI).makeSwapInInvitation();

  const offerConfig = {
    id,
    invitation,
    installationHandleBoardId: AMM_INSTALLATION_BOARD_ID,
    instanceHandleBoardId: AMM_INSTANCE_BOARD_ID,
    proposalTemplate: {
      give: {
        In: {
          pursePetname: inputPurse.pursePetname,
          value: inputValue,
        },
      },
      want: {
        Out: {
          pursePetname: outputPurse.pursePetname,
          value: outputValue,
        },
      },
    },
  };

  console.info('OFFER CONFIG: ', offerConfig);
  await E(walletP).addOffer(offerConfig);
};
