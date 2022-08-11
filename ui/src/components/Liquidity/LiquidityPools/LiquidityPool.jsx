import React from 'react';
import { useApplicationContext } from 'context/Application';
import { makeDisplayFunctions } from 'utils/helpers';
import { AmountMath } from '@agoric/ertp';
import { makeRatio } from '@agoric/zoe/src/contractSupport';

const LiquidityPool = ({
  brand,
  liquidityBrand,
  onAddClicked,
  onRemoveClicked,
}) => {
  const { state } = useApplicationContext();
  const { purses, poolStates, brandToInfo } = state;

  const poolState = poolStates.get(brand);
  const { displayBrandPetname, displayAmount, displayPercent } =
    makeDisplayFunctions(brandToInfo);

  const totalUserLiquidityForBrand =
    liquidityBrand &&
    (purses ?? [])
      .filter(({ brand: purseBrand }) => purseBrand === liquidityBrand)
      .map(({ value }) => value)
      .reduce((prev, cur) => prev + cur, 0n);
  const totalUserPurseBalanceForBrand = (purses ?? [])
    .filter(({ brand: purseBrand }) => purseBrand === brand)
    .map(({ value }) => value)
    .reduce((prev, cur) => prev + cur, 0n);

  const totalPoolTokens =
    totalUserLiquidityForBrand &&
    poolState &&
    (poolState.liquidityTokens.value < totalUserLiquidityForBrand
      ? totalUserLiquidityForBrand
      : poolState.liquidityTokens.value);

  const userPoolSharePercent =
    liquidityBrand &&
    totalUserLiquidityForBrand &&
    totalPoolTokens &&
    displayPercent(
      makeRatio(
        totalUserLiquidityForBrand,
        liquidityBrand,
        totalPoolTokens,
        liquidityBrand,
      ),
      7,
    );

  const centralPetname =
    poolState && displayBrandPetname(poolState.centralAmount.brand);
  const secondaryPetname =
    poolState && displayBrandPetname(poolState.secondaryAmount.brand);
  const centralAmount =
    poolState &&
    displayAmount(
      AmountMath.make(
        poolState.centralAmount.brand,
        poolState.centralAmount.value,
      ),
    );
  const secondaryAmount =
    poolState &&
    displayAmount(
      AmountMath.make(
        poolState.secondaryAmount.brand,
        poolState.secondaryAmount.value,
      ),
    );

  return (
    <div className="border w-full p-4 flex flex-col gap-2 text-gray-500">
      <h3 className="font-medium text-lg text-black">
        {centralPetname} / {secondaryPetname}
      </h3>
      {totalUserLiquidityForBrand && (
        <div className="flex justify-between text-black">
          <h4 className="text-md">Share of Pool:</h4>
          <h4>{userPoolSharePercent}%</h4>
        </div>
      )}
      <div className="flex justify-between">
        <h4>{centralPetname}</h4>
        <h4>{centralAmount}</h4>
      </div>
      <div className="flex justify-between">
        <h4>{secondaryPetname}</h4>
        <h4>{secondaryAmount}</h4>
      </div>
      <div className="flex gap-3 mt-2">
        {totalUserPurseBalanceForBrand || totalUserLiquidityForBrand ? (
          <button className="btn-primary w-full p-0.5" onClick={onAddClicked}>
            Add
          </button>
        ) : (
          <button className="btn-primary w-full p-0.5" disabled>
            Empty Wallet Balance
          </button>
        )}
        {totalUserLiquidityForBrand && (
          <button
            className="btn-primary w-full p-0.5"
            onClick={onRemoveClicked}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default LiquidityPool;
