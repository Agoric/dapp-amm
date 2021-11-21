/* eslint-disable no-nested-ternary */
import React, { useEffect, useState, useContext } from 'react';
import placeholderAgoric from 'assets/placeholder-agoric.png';

import AssetContext from 'context/AssetContext';
import { FiChevronDown } from 'react-icons/fi';

import DialogSwap from '../../Swap/DialogSwap/DialogSwap';

const SecondaryAssetLiquidity = ({ type, value, handleChange, disabled }) => {
  const [open, setOpen] = useState(false);

  const [asset] = useContext(AssetContext);
  const selected = asset[type];
  console.log(selected);

  return (
    <>
      <DialogSwap
        handleClose={() => setOpen(false)}
        open={open}
        type={type}
        asset={selected}
      />
      <div className="flex flex-col bg-alternative p-4 rounded-sm gap-2 select-none">
        <h3 className="text-xs uppercase text-gray-500 tracking-wide font-medium select-none">
          Input
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
          ) : selected ? (
            <div
              className="flex flex-col w-28  p-1 rounded-sm hover:bg-black cursor-pointer hover:bg-opacity-5"
              onClick={() => {
                setOpen(true);
              }}
            >
              <div className="flex  items-center justify-between">
                <h2 className="text-xl uppercase font-medium">
                  {selected?.code}
                </h2>
              </div>
              <h3 className="text-xs text-primary font-semibold flex items-center gap-1">
                Select Purse <FiChevronDown className="text-xl" />
              </h3>
            </div>
          ) : (
            <button
              disabled={disabled}
              className="btn-primary text-sm py-1 px-2 w-28"
              onClick={() => setOpen(true)}
            >
              Select asset
            </button>
          )}
          <div className="relative flex-grow">
            <input
              type="number"
              placeholder="0.0"
              value={value}
              onChange={handleChange}
              disabled={disabled}
              className="input-primary w-full"
            />
            {asset[type]?.purse && (
              <div className="absolute right-3 top-1.5 text-gray-400 flex flex-col text-right text-sm bg-white">
                <div>Balance: {asset[type].purse.balance}</div>
                <div>~ ${asset[type].purse.balanceUSD}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SecondaryAssetLiquidity;
