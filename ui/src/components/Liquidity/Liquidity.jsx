import {
  getPoolAllocationService,
  getUserLiquidityService,
} from 'services/liquidity.service';
import { useApplicationContext } from 'context/Application';
import PoolContext from 'context/PoolContext';
import AssetWrapper from 'context/AssetWrapper';
import ErrorWrapper from 'context/ErrorWrapper';

import { motion } from 'framer-motion';
import React, { useState, useEffect, useContext } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import CustomLoader from 'components/components/CustomLoader';
import AddLiquidity from './AddLiquidity/AddLiquidity';
import LiquidityPool from './LiquidityPool/LiquidityPool';
import RemoveLiquidity from './RemoveLiquidity/RemoveLiquidity';

const Liquidity = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const tabClass = index =>
    tabIndex === index
      ? 'border-b-4 border-alternativeBright rounded-b-sm text-alternativeBright w-[50%] text-center font-medium uppercase p-1'
      : 'bg-white text-gray-400 text-center w-[50%] font-medium uppercase p-1 pt-[6px] pb-[2px] cursor-pointer';
  const [assetloader, setAssetLoader] = useState(false);
  const [open, setOpen] = useState(false);
  const liquidityHook = useState({ central: null, liquidity: null });
  const errorHook = useState(undefined);
  const [pool, setPool] = useContext(PoolContext);
  const { state } = useApplicationContext();
  const {
    assets,
    brandToInfo,
    approved,
    autoswap: { ammAPI },
  } = state;
  useEffect(() => {
    brandToInfo.length <= 0 || !approved
      ? setAssetLoader(true)
      : setAssetLoader(false);
  }, [brandToInfo, approved]);
  useEffect(() => {
    const getPool = async () => {
      const poolAllocations = await getPoolAllocationService(ammAPI, assets);
      if (poolAllocations.status === 200) {
        const { allocations } = poolAllocations;
        console.log('POOL ALLOCATIONS: ', allocations);
        const status = poolAllocations.status;
        setPool({ ...pool, allocations, allLiquidityStatus: status });
        console.log('poolAllocations userPairs:', poolAllocations.userPairs);
        const userLiquidity = await getUserLiquidityService(
          ammAPI,
          poolAllocations.userPairs,
        );
        if (userLiquidity.status === 200) {
          // TODO use userPairs to show user's liquidity in the screen.
          // console.log('User POOL ALLOCATIONS: ', userLiquidity.payload);
          const ustatus = userLiquidity.status;
          setPool({
            ...pool,
            allocations,
            allLiquidityStatus: status,
            userPairs: userLiquidity.payload,
            userLiquidityStatus: ustatus,
          });
        } else {
          // TODO: should be printed on screen
          console.error('Something went wrong');
        }
      } else {
        // TODO: should be printed on screen
        console.error('Something went wrong');
      }

      // further process userPairs to determine liquidity percentages
    };
    assets && ammAPI && getPool();
  }, [assets, ammAPI]);

  return (
    <AssetWrapper assetHook={liquidityHook}>
      <ErrorWrapper errorHook={errorHook}>
        <LiquidityPool
          className="z-2"
          open={open}
          setOpen={setOpen}
          setTabIndex={setTabIndex}
        />
        <motion.div className="flex flex-col gap-2">
          <button
            className="uppercase flex items-center text-sm gap-1 text-gray-500 hover:text-black"
            onClick={() => {
              setOpen(!open);
            }}
          >
            View Liquidity Positions <FiChevronRight className="text-lg" />
          </button>
          <motion.div
            className="flex flex-col p-4  rounded-sm gap-4 max-w-lg relative  select-none w-screen overflow-hidden"
            initial={{ opacity: 0, boxShadow: 'none' }}
            animate={{
              opacity: 1,
              boxShadow: '0px 0px 99px var(--color-secondary)',
            }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col justify-between  gap-2 ">
              <h1 className="text-2xl font-semibold">Liquidity</h1>
              <h2 className="text-gray-500 ">
                All liquidity pairs currently use RUN.
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
                  {assetloader ? (
                    <CustomLoader text="Loading Assets..." size={25} />
                  ) : (
                    <AddLiquidity />
                  )}
                </motion.div>
              )}
              {tabIndex === 1 && (
                <motion.div>
                  {assetloader ? (
                    <CustomLoader text="Loading Assets..." size={25} />
                  ) : (
                    <RemoveLiquidity setOpen={setOpen} />
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </ErrorWrapper>
    </AssetWrapper>
  );
};

export default Liquidity;
