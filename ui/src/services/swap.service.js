import { E } from '@endo/captp';

export const makeSwapOffer = async (
  walletP,
  inputPurse,
  inputValue,
  outputPurse,
  outputValue,
) => {
  // FIXME(https://github.com/Agoric/agoric-sdk/issues/5959): Read from chain.
  const AMM_INSTANCE_BOARD_ID = 'board00917';
  const offerConfig = {
    invitationMaker: {
      method: 'makeSwapInInvitation',
    },
    instanceHandleBoardId: AMM_INSTANCE_BOARD_ID,
    proposalTemplate: {
      give: {
        In: {
          pursePetname: inputPurse.pursePetname,
          value: Number(inputValue),
        },
      },
      want: {
        Out: {
          pursePetname: outputPurse.pursePetname,
          value: Number(outputValue),
        },
      },
    },
  };

  console.info('OFFER CONFIG: ', offerConfig);
  return E(walletP).addOffer(offerConfig);
};
