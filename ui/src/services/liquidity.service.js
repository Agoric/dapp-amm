import { E } from '@endo/captp';
import { stringifyPurseValue } from '@agoric/ui-components';
import { parseAsNat } from '@agoric/ui-components/dist/display/natValue/parseAsNat';
import { stringifyNat } from '@agoric/ui-components/dist/display/natValue/stringifyNat';
import {
  calcLiqValueToMint,
  calcSecondaryRequired,
  calcValueToRemove,
  makeRatio,
} from '@agoric/zoe/src/contractSupport';

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

export const getUserLiquidityService = async (ammAPI, pairs) => {
  // intermediate array for storing results
  const promises = [];

  try {
    pairs.forEach(pair => {
      promises.push(E(ammAPI).getLiquiditySupply(pair.Secondary.brand));
    });
  } catch (error) {
    console.error(error);
    return {
      status: 500,
      message: 'something went wrong while getting liquidity supply',
    };
  }
  console.log(pairs);

  let interArr = [];
  await Promise.allSettled(promises).then(results => {
    results = results?.map((item, index) => {
      // converting liquidities to float for easy percentage calculation
      const totalLiquidityDec = parseFloat(stringifyNat(item.value, 0, 0));
      const userLiquidityDec = parseFloat(
        stringifyNat(pairs[index].User.valueNAT, 0, 0),
      );

      const poolShare = parseFloat(
        ((userLiquidityDec / totalLiquidityDec) * 100).toFixed(8),
      );

      if (poolShare === 0) return [];

      return {
        ...item,
        userLiquidity: pairs[index].User.value,
        userLiquidityNAT: pairs[index].User.valueNAT,
        brand: pairs[index].User.brand,
        Central: pairs[index].Central,
        Secondary: pairs[index].Secondary,
        percentShare: poolShare,
      };
    });
    interArr = [...results.filter(item => item.status === 'fulfilled')];
  });

  console.log(interArr);

  return {
    status: interArr.length > 0 ? 200 : 204,
    message: 'Successfully extracted user liquidity',
    payload: interArr,
  };
};

export const getPoolAllocationService = async (ammAPI, assets) => {
  // intermediate array for storing results
  let interArr = [];
  const promises = [];
  let allPoolBrands;

  try {
    allPoolBrands = await E(ammAPI).getAllPoolBrands();
    console.log('ALL POOL BRANDS: ', allPoolBrands);
  } catch (error) {
    console.error(error);
  }

  /* eslint-disable no-await-in-loop */
  try {
    allPoolBrands.forEach(brand => {
      promises.push(E(ammAPI).getPoolAllocation(brand));
    });
  } catch (error) {
    console.error(error);
  }

  await Promise.allSettled(promises)
    .then(results => {
      results = results?.map((item, index) => {
        return { ...item, brand: allPoolBrands[index] };
      });
      interArr = results
        .filter(item => item.status === 'fulfilled')
        .map(item => {
          return item.value;
        });
    })
    .catch(error => {
      console.error(error);
      return {
        status: 500,
        message: 'something went wrong gathering allocation pools',
      };
    });

  const userLiquidityPairs = [];
  // identify brands of which user already has liquidity
  interArr = interArr?.map(elem => {
    const userLiquidityFound = assets.find(asset => {
      return asset.brand === elem.Liquidity.brand;
    });

    // if user has liquidity then add it in 'User' attribute
    if (userLiquidityFound) {
      const firstPurse = [...userLiquidityFound.purses].shift();
      const balance = stringifyPurseValue(firstPurse);
      const newElem = {
        ...elem,
        User: {
          brand: userLiquidityFound.brand,
          value: balance,
          valueNAT: firstPurse.currentAmount.value,
        },
      };

      // storing user liquidity pairs for further processing
      userLiquidityPairs.push(newElem);

      return newElem;
    }

    return elem;
  });

  return {
    status: 200,
    message: 'successfully extracted allocation pools',
    allocations: interArr,
    userPairs: userLiquidityPairs,
  };
};

const createNewPurse = async (
  liquidityBrand,
  walletP,
  instanceID,
  contractName,
) => {
  console.log('CREATING PURSE');
  console.log(instanceID, contractName);
  const board = await E(walletP).getBoard();
  const zoe = await E(walletP).getZoe();
  const instance = await E(board).getValue(instanceID);
  const issuers = await E(zoe).getIssuers(instance);
  const liquidityBrandName = await E(liquidityBrand).getAllegedName();
  console.log("HERE's ISSUERS: ", issuers);

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
  centralValuePurse,
  secondaryAmount,
  secondaryValuePurse,
  ammAPI,
  walletP,
  purses,
) => {
  const {
    AMM_INSTALLATION_BOARD_ID,
    AMM_INSTANCE_BOARD_ID,
    CONTRACT_NAME,
  } = dappConfig;

  const alloc = await E(ammAPI).getPoolAllocation(secondaryValuePurse.brand);
  console.log(alloc);

  const centralPoolValue = alloc.Central.value;
  const secondaryPoolValue = alloc.Secondary.value;

  const secondaryValue = calcSecondaryRequired(
    centralAmount.value,
    centralPoolValue,
    secondaryPoolValue,
    secondaryAmount.value,
  );

  console.log(
    'Secondary Value: ',
    secondaryAmount.value,
    'New value: ',
    secondaryValue,
  );

  const liquidity = alloc.Liquidity;
  if (!liquidity) {
    return { status: 500, message: 'Liquidity brand not found' };
  }

  const actualLiquidity = await E(ammAPI).getLiquiditySupply(
    secondaryValuePurse.brand,
  );

  const liquidityValueTrue = calcLiqValueToMint(
    actualLiquidity,
    centralAmount.value,
    centralPoolValue,
  );

  let liquidityPurse = purses.find(purse => purse.brand === liquidity.brand);

  console.log('liquidity brand: ', liquidity.brand);
  console.log('PURSES', purses);
  console.log(liquidityPurse);

  if (liquidityPurse) {
    liquidityPurse = liquidityPurse.pursePetname;
  } else {
    liquidityPurse = await createNewPurse(
      liquidity.brand,
      walletP,
      AMM_INSTANCE_BOARD_ID,
      CONTRACT_NAME,
    );
  }

  console.log('LIQUIDITY PURSE', liquidityPurse, CONTRACT_NAME);

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

  const offerConfig = {
    id,
    invitation,
    installationHandleBoardId: AMM_INSTALLATION_BOARD_ID,
    instanceHandleBoardId: AMM_INSTANCE_BOARD_ID,
    proposalTemplate: {
      give: {
        Secondary: {
          // The pursePetname identifies which purse we want to use
          pursePetname: secondaryValuePurse.pursePetname,
          value: secondaryValue,
        },
        Central: {
          // The pursePetname identifies which purse we want to use
          pursePetname: centralValuePurse.pursePetname,
          value: centralAmount.value,
        },
      },
      want: {
        Liquidity: {
          // The pursePetname identifies which purse we want to use
          pursePetname: liquidityPurse,
          value: liquidityValueTrue,
        },
      },
    },
  };
  console.info('ADD LIQUIDITY CONFIG: ', offerConfig);

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
  central,
  secondary,
  amount,
  purses,
  ammAPI,
  walletP,
) => {
  if (!central.purse || !secondary.purse) {
    return {
      status: 400,
      message: 'Central or secondary purses not provided ',
    };
  }

  const { AMM_INSTALLATION_BOARD_ID, AMM_INSTANCE_BOARD_ID } = dappConfig;
  // determine value to be returned to users
  const { liquidityInfo } = secondary;
  const { userLiquidityNAT, totaLiquidity } = liquidityInfo.User;

  const liquidityBrand = liquidityInfo.User.brand;
  const liquidityPurse = purses.find(purse => purse.brand === liquidityBrand);

  if (!liquidityPurse) {
    return {
      status: 500,
      message: 'Cannot find a purse for liquidity tokens brand',
    };
  }

  // get central and secondary pool values
  const centralPool = liquidityInfo.Central;
  const secondaryPool = liquidityInfo.Secondary;

  // determine nat values of total pools
  const centralPoolValueNAT = parseAsNat(
    centralPool?.value,
    centralPool?.info?.decimalPlaces,
  );
  const secondaryPoolValueNAT = parseAsNat(
    secondaryPool?.value,
    secondaryPool?.info?.decimalPlaces,
  );

  const userLiquidityFloat = parseFloat(stringifyNat(userLiquidityNAT, 0, 0));
  // get new liquidity according to percentage reduction
  const newUserLiquidityNAT = parseAsNat(
    (userLiquidityFloat * (amount / 100)).toString(),
  );

  const centralTokenWant = calcValueToRemove(
    totaLiquidity,
    centralPoolValueNAT,
    newUserLiquidityNAT,
  );

  const secondaryTokenWant = calcValueToRemove(
    totaLiquidity,
    secondaryPoolValueNAT,
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
          pursePetname: secondary?.purse?.pursePetname,
          value: secondaryTokenWant,
        },
        Central: {
          // The pursePetname identifies which purse we want to use
          pursePetname: central?.purse?.pursePetname,
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
