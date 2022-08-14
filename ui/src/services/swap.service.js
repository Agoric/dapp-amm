import { E } from '@endo/captp';

export const makeSwapOffer = async (
  walletP,
  inputPurse,
  inputValue,
  outputPurse,
  outputValue,
) => {
  // TODO: Get this a better way?
  const AMM_INSTANCE_BOARD_ID = 'board00917';
  const offerConfig = {
    invitationMaker: {
      description: 'makeSwapInInvitation',
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
