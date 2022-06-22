import { FiHelpCircle } from 'react-icons/fi';

import React from 'react';
import { motion } from 'framer-motion';

const OptionsSwap = ({ slippage, setSlippage }) => {
  const slippageToolTip =
    'With Slippage Tolerance, you can set the maximum % of price movement you will accept. If exceeded, your order will not execute.';
  return (
    <motion.div
      layout
      className="w-full py-1 flex justify-between items-center"
    >
      <div className="flex gap-2 items-center align-items">
        <h2>Slippage Tolerance</h2>
        <FiHelpCircle
          id="btn"
          aria-describedby="tooltip"
          data-tooltip-text={slippageToolTip}
          onMouseLeave={() => {
            const tooltip = document.querySelector('#tooltip');
            tooltip.classList.add('hidden');
          }}
          onMouseEnter={() => {
            const btn = document.querySelector('#btn');
            const tooltip = document.querySelector('#tooltip');
            tooltip.innerHTML = btn.dataset.tooltipText;
            tooltip.classList.remove('hidden');
          }}
          size={20}
          className="p-1 te xt-2xl hover:bg-gray-100 rounded-full cursor-pointer"
        />
        <div
          className="z-20 w-[50%] text-xs mb-[100px] ml-[70px] bg-black text-white p-1 absolute rounded bg-opacity-60 shadow-xl hidden"
          id="tooltip"
          role="tooltip"
        ></div>
      </div>

      <div className="flex gap-3">
        <div className="relative">
          <input
            type="number"
            className=" p-2 pr-5 focus:outline-none bg-gray-100 rounded-sm"
            placeholder="0.5"
            onChange={({ target }) => {
              setSlippage(target.value);
            }}
            value={slippage}
            min="0.1"
            max="5"
            step="0.1"
          />
          <div className="text-lg absolute top-1.5 right-2  text-gray-400">
            %
          </div>
        </div>
        <button
          className="btn-primary py-2 px-4"
          onClick={() => {
            setSlippage(0.5);
          }}
        >
          Auto
        </button>
      </div>
    </motion.div>
  );
};

export default OptionsSwap;
