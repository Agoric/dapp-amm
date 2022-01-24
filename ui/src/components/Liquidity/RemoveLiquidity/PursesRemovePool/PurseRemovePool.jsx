import React, { useContext, useState, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import placeholderAgoric from 'assets/placeholder-agoric.png';

import AssetContext from 'context/AssetContext';

import DialogSwap from 'components/Swap/DialogSwap/DialogSwap';
import { parseAsNat } from '@agoric/ui-components/dist/display/natValue/parseAsNat';
import { stringifyNat } from '@agoric/ui-components/dist/display/natValue/stringifyNat';
import { calcValueToRemove } from '@agoric/zoe/src/contractSupport';

const PurseRemovePool = ({ pool, type, amount }) => {
  const [asset] = useContext(AssetContext);

  const [open, setOpen] = useState(false);
  const [increment, setIncrement] = useState(0);

  useEffect(() => {
    const calcIncrement = () => {
      const secondaryAsset = asset.secondaryRemove;
      const { liquidityInfo } = secondaryAsset;
      const { userLiquidityNAT, totaLiquidity } = liquidityInfo.User;

      const userLiquidityFloat = parseFloat(
        stringifyNat(userLiquidityNAT, 0, 0),
      );
      // get new liquidity according to percentage reduction
      const newUserLiquidityNAT = parseAsNat(
        (userLiquidityFloat * (amount / 100)).toString(),
      );

      if (type === 'centralRemove') {
        // get central pool values
        const centralPool = liquidityInfo.Central;
        // determine nat values of central pool
        const centralPoolValueNAT = parseAsNat(
          centralPool?.value,
          centralPool?.info?.decimalPlaces,
        );
        const centralTokenWant = calcValueToRemove(
          totaLiquidity,
          centralPoolValueNAT,
          newUserLiquidityNAT,
        );
        const centralTokenWantDec = stringifyNat(
          centralTokenWant,
          centralPool?.info?.decimalPlaces,
          2,
        );

        setIncrement(centralTokenWantDec);
      } else if (type === 'secondaryRemove') {
        // get secondary pool values
        const secondaryPool = liquidityInfo.Secondary;

        // determine nat values of secondary pool
        const secondaryPoolValueNAT = parseAsNat(
          secondaryPool?.value,
          secondaryPool?.info?.decimalPlaces,
        );

        const secondaryTokenWant = calcValueToRemove(
          totaLiquidity,
          secondaryPoolValueNAT,
          newUserLiquidityNAT,
        );

        const secondaryTokenWantDec = stringifyNat(
          secondaryTokenWant,
          secondaryPool?.info?.decimalPlaces,
          2,
        );

        setIncrement(secondaryTokenWantDec);
      }
    };
    asset.centralRemove && asset.secondaryRemove && amount && calcIncrement();
  }, [amount]);

  if (!pool)
    return (
      <div className="flex  flex-grow w-1/2 gap-3 bg-white h-18    p-3 rounded-sm items-center">
        <div className="w-10 h-10 rounded-full bg-gray-500">
          <img src={placeholderAgoric} />
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex  items-center justify-between">
            <h2 className="text-xl uppercase font-medium text-gray-500">
              EMPTY
            </h2>
          </div>

          <h3 className="text-xs  font-semibold flex items-center gap-1 text-gray-500">
            Select Purse <FiChevronDown className="text-xl" />
          </h3>
        </div>
      </div>
    );

  return (
    <>
      <DialogSwap
        handleClose={() => setOpen(false)}
        open={open}
        type={type}
        purseOnly
        asset={pool}
      />
      {asset[type]?.purse ? (
        <div
          className="flex  flex-grow w-1/2 gap-3 h-18 bg-white  cursor-pointer hover:bg-gray-50 p-3 rounded-sm items-center"
          onClick={() => {
            setOpen(true);
          }}
        >
          <div className="w-10 h-10  rounded-full bg-gray-500 overflow-hidden">
            <img src={pool.image} />
          </div>

          <div className="flex flex-col flex-grow">
            <div className="flex  items-center justify-between">
              <h2 className="text-xl uppercase font-medium">{pool.code}</h2>

              {/* The amount here needs to be extracted from the correct source */}
              {amount && <h2 className="text-green-600">+{increment}</h2>}
            </div>
            <h3 className="text-xs text-gray-500 font-semibold flex items-center gap-1">
              Purse:{' '}
              <span className="text-black ">
                {asset[type]?.purse.name
                  .split(' ')
                  .slice(0, 2)
                  .join(' ')}
              </span>
              <FiChevronDown className="text-xl" />
            </h3>
          </div>
        </div>
      ) : (
        <div
          className="flex  flex-grow w-1/2 gap-3 h-18 bg-white  cursor-pointer hover:bg-gray-50 p-3 rounded-sm items-center"
          onClick={() => {
            setOpen(true);
          }}
        >
          <div className="w-10 h-10 rounded-full bg-gray-500 overflow-hidden">
            <img src={pool.image} />
          </div>

          <div className="flex flex-col flex-grow">
            <div className="flex  items-center justify-between">
              <h2 className="text-xl uppercase font-medium">{pool.code}</h2>
            </div>

            <h3 className="text-xs text-primary font-semibold flex items-center gap-1">
              Select Purse <FiChevronDown className="text-xl" />
            </h3>
          </div>
        </div>
      )}
    </>
  );
};

export default PurseRemovePool;
