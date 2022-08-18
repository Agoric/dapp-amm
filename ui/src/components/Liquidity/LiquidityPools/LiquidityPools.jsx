import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import BodyLiquidityPools from './BodyLiquidityPools';

const LiquidityPool = ({ open, setOpen, setTabIndex }) => {
  return (
    <AnimatePresence className="z-20">
      {open && (
        <motion.div
          key={'liquidity-pool'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 w-screen  h-screen bg-black bg-opacity-10 flex items-center justify-end z-50"
        >
          <div
            className="absolute w-full h-full "
            onClick={() => {
              setOpen(false);
            }}
          />
          <motion.div
            className="bg-white w-96 h-screen shadow-red-light-sm z-50 overflow-auto"
            animate={{ x: [100, 0] }}
            exit={{ x: [0, 100] }}
          >
            <button
              className="uppercase flex items-center text-sm font-medium gap-1 text-black hover:bg-gray-100 p-1 m-3 "
              onClick={() => {
                setOpen(!open);
              }}
            >
              <FiChevronLeft className="text-xl text-primary" />
              Close Liquidity Pools
            </button>
            <BodyLiquidityPools
              open={open}
              handleClose={() => setOpen(false)}
              setTabIndex={setTabIndex}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LiquidityPool;
