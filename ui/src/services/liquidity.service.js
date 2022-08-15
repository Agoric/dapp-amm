import { E } from '@endo/captp';
import { parseAsNat } from '@agoric/ui-components/dist/display/natValue/parseAsNat';
import { stringifyNat } from '@agoric/ui-components/dist/display/natValue/stringifyNat';
import {
  calcLiqValueToMint,
  calcSecondaryRequired,
  calcValueToRemove,
} from '@agoric/zoe/src/contractSupport';

export const createNewPurse = async (
  walletP,
  secondaryBrandName,
  liquidityIssuerId,
) =>
  E(walletP).suggestIssuer(`${secondaryBrandName}Liquidity`, liquidityIssuerId);

export const addLiquidityService = (
  centralAmount,
  centralPurse,
  secondaryAmount,
  secondaryValuePurse,
  liquidityPurse,
  walletP,
  pool,
) => {
  // FIXME(https://github.com/Agoric/agoric-sdk/issues/5959): Read from chain.
  const AMM_INSTANCE_BOARD_ID = 'board00917';

  const secondaryToGive = calcSecondaryRequired(
    centralAmount.value,
    pool.centralAmount.value,
    pool.secondaryAmount.value,
    secondaryAmount.value,
  );

  const liquidityToWant = calcLiqValueToMint(
    pool.liquidityTokens.value,
    centralAmount.value,
    pool.centralAmount.value,
  );

  const offerConfig = {
    invitationMaker: {
      method: 'makeAddLiquidityInvitation',
    },
    instanceHandleBoardId: AMM_INSTANCE_BOARD_ID,
    proposalTemplate: {
      give: {
        Secondary: {
          pursePetname: secondaryValuePurse.pursePetname,
          value: Number(secondaryToGive),
        },
        Central: {
          pursePetname: centralPurse.pursePetname,
          value: Number(centralAmount.value),
        },
      },
      want: {
        Liquidity: {
          pursePetname: liquidityPurse.pursePetname,
          value: Number(liquidityToWant),
        },
      },
    },
  };

  console.log('OFFER CONFIG', offerConfig);
  return E(walletP).addOffer(offerConfig);
};

export const removeLiquidityService = async (
  centralPurse,
  secondaryPurse,
  amount,
  purses,
  walletP,
  pool,
) => {
  // FIXME(https://github.com/Agoric/agoric-sdk/issues/5959): Read from chain.
  const AMM_INSTANCE_BOARD_ID = 'board00917';
  const liquidityBrand = pool.liquidityTokens.brand;
  const liquidityPurse = purses.find(purse => purse.brand === liquidityBrand);
  assert(liquidityPurse, 'Cannot find a purse for liquidity tokens brand');

  // get central and secondary pool values
  const centralPool = pool.centralAmount;
  const secondaryPool = pool.secondaryAmount;

  const totalUserPurseBalanceForBrand = (purses ?? [])
    .filter(({ brand: purseBrand }) => purseBrand === liquidityBrand)
    .map(({ value }) => value)
    .reduce((prev, cur) => prev + cur, 0n);

  const userLiquidityFloat = parseFloat(
    stringifyNat(totalUserPurseBalanceForBrand, 0, 0),
  );

  // get new liquidity according to percentage reduction
  const newUserLiquidityNAT = parseAsNat(
    (userLiquidityFloat * (amount / 100)).toString(),
  );

  const centralTokenWant = calcValueToRemove(
    pool.liquidityTokens.value,
    centralPool.value,
    newUserLiquidityNAT,
  );

  const secondaryTokenWant = calcValueToRemove(
    pool.liquidityTokens.value,
    secondaryPool.value,
    newUserLiquidityNAT,
  );

  const offerConfig = {
    invitationMaker: {
      method: 'makeRemoveLiquidityInvitation',
    },
    instanceHandleBoardId: AMM_INSTANCE_BOARD_ID,
    proposalTemplate: {
      give: {
        Liquidity: {
          // The pursePetname identifies which purse we want to use
          pursePetname: liquidityPurse.pursePetname,
          value: Number(newUserLiquidityNAT),
        },
      },
      want: {
        Secondary: {
          // The pursePetname identifies which purse we want to use
          pursePetname: secondaryPurse.pursePetname,
          value: Number(secondaryTokenWant),
        },
        Central: {
          // The pursePetname identifies which purse we want to use
          pursePetname: centralPurse.pursePetname,
          value: Number(centralTokenWant),
        },
      },
    },
  };

  console.info('OFFER CONFIG: ', offerConfig);
  return E(walletP).addOffer(offerConfig);
};
