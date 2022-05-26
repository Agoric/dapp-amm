import { E } from '@endo/captp';
import { parseAsNat } from '@agoric/ui-components/dist/display/natValue/parseAsNat';
import { stringifyNat } from '@agoric/ui-components/dist/display/natValue/stringifyNat';
import {
  calcLiqValueToMint,
  calcSecondaryRequired,
  calcValueToRemove,
} from '@agoric/zoe/src/contractSupport';

import { dappConfig } from '../utils/config.js';

const createNewPurse = async (
  liquidityBrand,
  walletP,
  instanceID,
  contractName,
) => {
  console.log(instanceID, contractName);
  const board = await E(walletP).getBoard();
  const zoe = await E(walletP).getZoe();
  const instance = await E(board).getValue(instanceID);
  const issuers = await E(zoe).getIssuers(instance);
  const liquidityBrandName = await E(liquidityBrand).getAllegedName();

  const liquidityIssuer = issuers[liquidityBrandName];

  if (!liquidityIssuer) {
    throw Error('Liquidity issuer not found in AMM');
  }
  const liquidityId = await E(board).getId(liquidityIssuer);
  await E(walletP).suggestIssuer(liquidityBrandName, liquidityId);

  // purseName of newly created purse will come out as array
  const newName = [];
  newName.push(contractName);
  newName.push(liquidityBrandName);

  return newName;
};

export const addLiquidityService = async (
  centralAmount,
  centralPurse,
  secondaryAmount,
  secondaryValuePurse,
  ammAPI,
  walletP,
  purses,
  pool,
) => {
  const {
    AMM_INSTALLATION_BOARD_ID,
    AMM_INSTANCE_BOARD_ID,
    CONTRACT_NAME,
  } = dappConfig;
  const liquidityBrand = pool.liquidityTokens.brand;
  let liquidityPurse = purses.find(purse => purse.brand === liquidityBrand);

  if (liquidityPurse) {
    liquidityPurse = liquidityPurse.pursePetname;
  } else {
    liquidityPurse = await createNewPurse(
      liquidityBrand,
      walletP,
      AMM_INSTANCE_BOARD_ID,
      CONTRACT_NAME,
    );
  }

  const id = `${Date.now()}`;
  let invitation;
  try {
    invitation = await E(ammAPI).makeAddLiquidityInvitation();
  } catch (error) {
    return {
      status: 500,
      message:
        error ||
        error.message ||
        error.error ||
        'Something went wrong while creating invitation for add liquidity',
    };
  }

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
    id,
    invitation,
    installationHandleBoardId: AMM_INSTALLATION_BOARD_ID,
    instanceHandleBoardId: AMM_INSTANCE_BOARD_ID,
    proposalTemplate: {
      give: {
        Secondary: {
          pursePetname: secondaryValuePurse.pursePetname,
          value: secondaryToGive,
        },
        Central: {
          pursePetname: centralPurse.pursePetname,
          value: centralAmount.value,
        },
      },
      want: {
        Liquidity: {
          pursePetname: liquidityPurse,
          value: liquidityToWant,
        },
      },
    },
  };

  try {
    await E(walletP).addOffer(offerConfig);
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message:
        error ||
        error.message ||
        error.error ||
        'Something went wrong while sending remove liquidity offer',
    };
  }

  return { status: 200, message: 'Add liquidity offer successfully sent' };
};

export const removeLiquidityService = async (
  centralPurse,
  secondaryPurse,
  amount,
  purses,
  ammAPI,
  walletP,
  pool,
) => {
  if (!centralPurse || !secondaryPurse) {
    return {
      status: 400,
      message: 'Central or secondary purses not provided ',
    };
  }

  const { AMM_INSTALLATION_BOARD_ID, AMM_INSTANCE_BOARD_ID } = dappConfig;

  const liquidityBrand = pool.liquidityTokens.brand;
  const liquidityPurse = purses.find(purse => purse.brand === liquidityBrand);

  if (!liquidityPurse) {
    return {
      status: 500,
      message: 'Cannot find a purse for liquidity tokens brand',
    };
  }

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

  const id = `${Date.now()}`;

  let invitation;
  try {
    invitation = await E(ammAPI).makeRemoveLiquidityInvitation();
  } catch (error) {
    return {
      status: 500,
      message:
        error ||
        error.message ||
        error.error ||
        'Something went wrong while creating invitation for remove liquidity',
    };
  }

  const offerConfig = {
    id,
    invitation,
    installationHandleBoardId: AMM_INSTALLATION_BOARD_ID,
    instanceHandleBoardId: AMM_INSTANCE_BOARD_ID,
    proposalTemplate: {
      give: {
        Liquidity: {
          // The pursePetname identifies which purse we want to use
          pursePetname: liquidityPurse.pursePetname,
          value: newUserLiquidityNAT,
        },
      },
      want: {
        Secondary: {
          // The pursePetname identifies which purse we want to use
          pursePetname: secondaryPurse.pursePetname,
          value: secondaryTokenWant,
        },
        Central: {
          // The pursePetname identifies which purse we want to use
          pursePetname: centralPurse.pursePetname,
          value: centralTokenWant,
        },
      },
    },
  };

  console.info('REMOVE LIQUIDITY CONFIG: ', offerConfig);

  try {
    await E(walletP).addOffer(offerConfig);
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message:
        error ||
        error.message ||
        error.error ||
        'Something went wrong while sending remove liquidity offer',
    };
  }

  return { status: 200, message: 'Remove liquidity offer successfully sent' };
};
