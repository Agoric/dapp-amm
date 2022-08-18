import Loader from 'react-loader-spinner';
import { useApplicationContext } from 'context/Application';
import React, { useContext } from 'react';
import { motion } from 'framer-motion';

import PoolContext from 'context/PoolContext';
import RemovePoolContext from 'context/RemovePoolContext';
import LiquidityPool from './LiquidityPool';

const BodyLiquidityPools = ({ setTabIndex, handleClose }) => {
  const { state } = useApplicationContext();
  const { poolStates, purses } = state;
  const { setBrandToAdd } = useContext(PoolContext);
  const { setBrandToRemove } = useContext(RemovePoolContext);
  const arePoolsLoaded = purses && poolStates?.size;

  const myPools = arePoolsLoaded
    ? [...poolStates.entries()].filter(
        ([_brand, poolState]) =>
          purses.find(
            ({ brand: purseBrand, value }) =>
              purseBrand === poolState?.liquidityTokens?.brand && value > 0n,
          ) !== undefined,
      )
    : [];

  const allOtherPools = arePoolsLoaded
    ? [...poolStates.entries()].filter(
        ([_brand, poolState]) =>
          purses.find(
            ({ brand: purseBrand, value }) =>
              purseBrand === poolState?.liquidityTokens?.brand && value > 0n,
          ) === undefined,
      )
    : [];

  const handleAddBrand = brand => {
    setBrandToAdd(brand);
    setTabIndex(0);
    handleClose();
  };

  const handleRemoveBrand = brand => {
    setBrandToRemove(brand);
    setTabIndex(1);
    handleClose();
  };

  return (
    <>
      <div className="px-5 py-3">
        <h2 className="text-lg text-gray-500 font-medium">Your Pools:</h2>
      </div>
      <motion.div className="flex flex-col p-5 gap-6 ">
        {myPools.map(([brand, poolState]) => {
          const onAddClicked = () => handleAddBrand(brand);
          const onRemoveClicked = () => handleRemoveBrand(brand);
          return (
            <LiquidityPool
              key={brand}
              brand={brand}
              liquidityBrand={poolState?.liquidityTokens?.brand}
              onAddClicked={onAddClicked}
              onRemoveClicked={onRemoveClicked}
            />
          );
        })}
        {arePoolsLoaded && !myPools.length && (
          <h4 className="text-lg">You have no liquidity positions.</h4>
        )}
        {!arePoolsLoaded && (
          <div className="flex flex-row justify-left items-center text-gray-400">
            <Loader type="Oval" color="#62d2cb" height={15} width={15} />
            <div className="pl-2 text-lg">
              Fetching your liquidity posititions...
            </div>
          </div>
        )}
      </motion.div>
      <div className="border-b px-5 py-3">
        <h2 className="text-lg font-medium">All Pools</h2>
      </div>
      <motion.div className="flex flex-col p-5 gap-6 ">
        {allOtherPools.map(([brand]) => {
          const onAddClicked = () => handleAddBrand(brand);

          return (
            <LiquidityPool
              key={brand}
              brand={brand}
              onAddClicked={onAddClicked}
            />
          );
        })}
        {arePoolsLoaded && !allOtherPools.length && (
          <h4 className="text-lg">No liquidity pools found.</h4>
        )}
        {!arePoolsLoaded && (
          <div className="flex flex-row justify-left items-center text-gray-400">
            <Loader type="Oval" color="#62d2cb" height={15} width={15} />
            <div className="pl-2 text-lg">Fetching all liquidity pools...</div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default BodyLiquidityPools;
