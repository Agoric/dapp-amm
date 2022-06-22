import React from 'react';
import { makeDisplayFunctions } from 'utils/helpers';
import { useApplicationContext } from 'context/Application';
import { floorMultiplyBy, makeRatio } from '@agoric/zoe/src/contractSupport';
import { AmountMath } from '@agoric/ertp';

const RateLiquidity = ({ secondaryBrand }) => {
  const {
    state: { brandToInfo, autoswap, poolStates },
  } = useApplicationContext();
  const { centralBrand } = autoswap ?? {};
  const { displayBrandPetname, displayAmount, getDecimalPlaces } =
    makeDisplayFunctions(brandToInfo);

  const decimalPlaces = getDecimalPlaces(secondaryBrand);
  const unitAmount = AmountMath.make(
    secondaryBrand,
    10n ** BigInt(decimalPlaces),
  );

  const pool = poolStates && poolStates.get(secondaryBrand);
  const exchangeRate =
    pool &&
    makeRatio(
      pool.centralAmount.value,
      pool.centralAmount.brand,
      pool.secondaryAmount.value,
      pool.secondaryAmount.brand,
    );
  const unitPrice = floorMultiplyBy(unitAmount, exchangeRate);

  const centralBrandName = displayBrandPetname(centralBrand);
  const secondaryBrandName = displayBrandPetname(secondaryBrand);

  return (
    <div className="flex gap-4 text-gray-400 justify-between">
      <div className="flex flex-col ">
        <h3>
          1 {secondaryBrandName} = {displayAmount(unitPrice, 4)}{' '}
          {centralBrandName}
        </h3>
      </div>
    </div>
  );
};

export default RateLiquidity;
