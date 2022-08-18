import { E } from '@endo/captp';

export const makeSwapOffer = async (
  walletP,
  inputPurse,
  inputValue,
  outputPurse,
  outputValue,
  instanceId,
) => {
  const offerConfig = {
    invitationMaker: {
      method: 'makeSwapInInvitation',
    },
    instanceHandleBoardId: instanceId,
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
