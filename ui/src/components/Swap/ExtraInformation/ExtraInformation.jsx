import { motion } from 'framer-motion';
import React from 'react';
import { BiTransfer } from 'react-icons/bi';

const SWAP_IN = 'IN';

const ExtraInformation = ({ want, rate, give, swapFrom, swapTo, swapType }) => {
  return (
    <motion.div className="flex flex-col" layout>
      <div className="flex text-gray-400 justify-between items-center">
        Exchange Rate
        <div className="flex flex-1 justify-end pr-2">
          1 {want.code} = {rate} {give.code}
        </div>
        <BiTransfer size={20} />
      </div>
      {swapType === SWAP_IN ? (
        <div className="flex gap-4 text-gray-400 justify-between">
          Receive at least:
          <div>
            {swapTo.limitDec} {want.code}
          </div>
        </div>
      ) : (
        <div className="flex gap-4 text-gray-400 justify-between">
          Give at most:
          <div>
            {swapFrom.limitDec} {want.code}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ExtraInformation;
