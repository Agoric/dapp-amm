import { useApplicationContext } from 'context/Application';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import CustomLoader from 'components/components/CustomLoader';
import AddLiquidity from './AddLiquidity/AddLiquidity';
import LiquidityPool from './LiquidityPools/LiquidityPools';
import RemoveLiquidity from './RemoveLiquidity/RemoveLiquidity';

const Liquidity = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const tabClass = index =>
    tabIndex === index
      ? 'border-b-4 border-alternativeBright rounded-b-sm text-alternativeBright w-[50%] text-center font-medium uppercase p-1'
      : 'bg-white text-gray-400 text-center w-[50%] font-medium uppercase p-1 pt-[6px] pb-[2px] cursor-pointer';
  const [open, setOpen] = useState(false);
  const { state } = useApplicationContext();
  const { purses, autoswap, liquidityBrands, poolStates } = state;
  const { poolBrands } = autoswap ?? {};

  const poolCount = poolBrands?.length;
  const assetsLoaded =
    poolBrands &&
    purses &&
    liquidityBrands.size === poolCount &&
    poolStates.size === poolCount;

  return (
    <>
      <LiquidityPool
        className="z-2"
        open={open}
        setOpen={setOpen}
        setTabIndex={setTabIndex}
      />
      <motion.div
        className="flex flex-col gap-2"
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button
          className="uppercase flex items-center text-sm gap-1 text-gray-500 hover:text-black"
          onClick={() => {
            setOpen(!open);
          }}
        >
          View Liquidity Pools <FiChevronRight className="text-lg" />
        </button>
        <motion.div
          className="flex flex-col p-4 rounded-sm gap-4 max-w-lg relative select-none w-screen overflow-hidden"
          initial={{ opacity: 0, boxShadow: 'none' }}
          animate={{
            opacity: 1,
            boxShadow: '0px 0px 99px var(--color-secondary)',
          }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col justify-between gap-2 ">
            <h1 className="text-2xl font-semibold">Liquidity</h1>
            <h2 className="text-gray-500 ">
              All liquidity pairs currently use IST.
            </h2>
          </div>
          <div>
            <div className="bg-white text-md rounded-sm flex mb-4">
              <div
                className={tabClass(0)}
                onClick={() => {
                  setTabIndex(0);
                }}
              >
                Add
              </div>
              <div
                className={tabClass(1)}
                onClick={() => {
                  setTabIndex(1);
                }}
              >
                Remove
              </div>
            </div>
            {tabIndex === 0 && (
              <motion.div>
                {!assetsLoaded ? (
                  <CustomLoader text="Loading Assets..." size={25} />
                ) : (
                  <AddLiquidity setOpen={setOpen} />
                )}
              </motion.div>
            )}
            {tabIndex === 1 && (
              <motion.div>
                {!assetsLoaded ? (
                  <CustomLoader text="Loading Assets..." size={25} />
                ) : (
                  <RemoveLiquidity setOpen={setOpen} />
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Liquidity;
