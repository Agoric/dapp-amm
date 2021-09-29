import React, { useState, useContext, useEffect } from 'react';

import placeholderAgoric from 'assets/placeholder-agoric.png';

import AssetContext from 'context/AssetContext';
import DialogSwap from '../DialogSwap/DialogSwap';

import { useApplicationContext } from 'context/Application';

const SectionSwap = ({ type }) => {
  const { state, walletP } = useApplicationContext();

  const [open, setOpen] = useState(false);

  const [asset] = useContext(AssetContext);
  const selected = asset[type];

  useEffect(() => {
    console.log("Here's the state: ", state);
  }, [state]);

  return (
    <>
      <DialogSwap handleClose={() => setOpen(false)} open={open} />
      <div className='flex flex-col bg-alternative p-4 rounded-sm gap-2'>
        <h3 className='text-xs uppercase text-gray-500 tracking-wide font-medium'>
          Swap From
        </h3>
        <div className='flex gap-3 items-center'>
          <div className='w-12 h-12 rounded-full bg-gray-500'>
            <img src={selected?.image || placeholderAgoric} />
          </div>
          <button
            className='btn-primary text-sm py-1 px-2'
            onClick={() => setOpen(true)}
          >
            Select asset
          </button>
          <input type='number' placeholder='0.0' className='flex-grow' />
        </div>
      </div>
    </>
  );
};

export default SectionSwap;
