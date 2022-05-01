import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';

import placeholderAgoric from 'assets/placeholder-agoric.png';
import AssetContext from 'context/AssetContext';
import { FiChevronDown } from 'react-icons/fi';
import CustomInput from 'components/components/CustomInput';
import DialogSwap from '../DialogSwap/DialogSwap';

const SectionSwap = ({ type, value, handleChange, rateAvailable }) => {
  const [open, setOpen] = useState(false);
  const [asset] = useContext(AssetContext);
  const selected = asset[type];
  useEffect(() => {
    console.log('show asset', asset);
  });
  return (
    <>
      <DialogSwap handleClose={() => setOpen(false)} open={open} type={type} />

      <motion.div
        className="flex flex-col bg-alternative p-4 rounded-sm gap-2 select-none"
        layout
      >
        <h3 className="text-xs uppercase text-gray-500 tracking-wide font-medium select-none">
          Swap {type.toUpperCase()}
        </h3>
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 rounded-full bg-gray-500">
            <img src={selected?.image || placeholderAgoric} />
          </div>
          {selected?.purse ? (
            <div
              className="flex flex-col w-28 hover:bg-black cursor-pointer hover:bg-opacity-5 p-1 rounded-sm"
              onClick={() => {
                setOpen(true);
              }}
            >
              <div className="flex  items-center justify-between">
                <h2 className="text-xl uppercase font-medium">
                  {selected.code}
                </h2>
                <FiChevronDown className="text-xl" />
              </div>
              <h3 className="text-xs text-gray-500 font-semibold">
                Purse: <span>{selected.purse.name}</span>{' '}
              </h3>
            </div>
          ) : (
            <button
              className="btn-primary text-sm py-1 px-2 w-28"
              onClick={() => setOpen(true)}
            >
              Select asset
            </button>
          )}
          <CustomInput
            value={value}
            handleChange={handleChange}
            asset={asset}
            type={type}
            rateAvailable={rateAvailable}
            useCase="swap"
          />
        </div>
      </motion.div>
    </>
  );
};

export default SectionSwap;
