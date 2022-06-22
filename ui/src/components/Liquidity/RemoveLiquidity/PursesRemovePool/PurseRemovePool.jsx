import React, { useContext, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import placeholderAgoric from 'assets/placeholder-agoric.png';

import DialogSwap from 'components/Swap/DialogSwap/DialogSwap';
import { parseAsNat } from '@agoric/ui-components/dist/display/natValue/parseAsNat';
import { stringifyNat } from '@agoric/ui-components/dist/display/natValue/stringifyNat';
import { calcValueToRemove } from '@agoric/zoe/src/contractSupport';
import PoolContext from 'context/PoolContext';
import { useApplicationContext } from 'context/Application';
import { makeDisplayFunctions, displayPetname } from 'utils/helpers';
import { AmountMath } from '@agoric/ertp';
import RemovePoolContext from 'context/RemovePoolContext';

const PurseRemovePool = ({ type, amount }) => {
  const [open, setOpen] = useState(false);
  const {
    state: { purses, autoswap, brandToInfo, poolStates, liquidityBrands },
  } = useApplicationContext();
  const { centralBrand } = autoswap ?? {};

  const { centralPurseToUse, setCentralPurseIdToUse } = useContext(PoolContext);
  const { purseToRemove, brandToRemove, setPurseIdToRemove } =
    useContext(RemovePoolContext);

  const { displayBrandPetname, displayBrandIcon, displayAmount } =
    makeDisplayFunctions(brandToInfo);

  const brand = type === 'central' ? centralBrand : brandToRemove;
  const purse = type === 'central' ? centralPurseToUse : purseToRemove;

  const calcIncrement = () => {
    const pool = poolStates.get(brandToRemove);
    const totalLiquidity = pool.liquidityTokens.value;
    const liquidityBrand = liquidityBrands.get(brandToRemove);
    const userLiquidity =
      liquidityBrand &&
      (purses ?? [])
        .filter(({ brand: purseBrand }) => purseBrand === liquidityBrand)
        .map(({ value }) => value)
        .reduce((prev, cur) => prev + cur, 0n);
    const userLiquidityFloat = parseFloat(stringifyNat(userLiquidity, 0, 0));
    const newUserLiquidity = parseAsNat(
      (userLiquidityFloat * (amount / 100)).toString(),
    );

    if (type === 'central') {
      const centralTokenWant = calcValueToRemove(
        totalLiquidity,
        pool.centralAmount.value,
        newUserLiquidity,
      );

      return AmountMath.make(centralBrand, centralTokenWant);
    } else {
      const secondaryTokenWant = calcValueToRemove(
        totalLiquidity,
        pool.secondaryAmount.value,
        newUserLiquidity,
      );

      return AmountMath.make(brandToRemove, secondaryTokenWant);
    }
  };
  const increment = brandToRemove && amount && displayAmount(calcIncrement());

  if (!brand)
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

  const handlePurseSelected = selected => {
    if (type === 'central') {
      setCentralPurseIdToUse(selected?.pursePetname);
    } else {
      setPurseIdToRemove(selected?.pursePetname);
    }
    setOpen(false);
  };

  return (
    <>
      <DialogSwap
        handleClose={() => setOpen(false)}
        open={open}
        type={type}
        purseOnly
        selectedBrand={brand}
        handlePurseSelected={handlePurseSelected}
      />
      {purse ? (
        <div
          className="flex  flex-grow w-1/2 gap-3 h-18 bg-white  cursor-pointer hover:bg-gray-50 p-3 rounded-sm items-center"
          onClick={() => {
            setOpen(true);
          }}
        >
          <div className="w-10 h-10  rounded-full bg-gray-500 overflow-hidden">
            <img src={displayBrandIcon(brand)} />
          </div>

          <div className="flex flex-col flex-grow">
            <div className="flex  items-center justify-between">
              <h2 className="text-xl uppercase font-medium">
                {displayBrandPetname(brand)}
              </h2>
              {increment && <h2 className="text-green-600">+{increment}</h2>}
            </div>
            <h3 className="text-xs text-gray-500 font-semibold flex items-center gap-1">
              Purse:{' '}
              <span className="text-black whitespace-nowrap">
                {displayPetname(purse.pursePetname).length > 12
                  ? `${displayPetname(purse.pursePetname).slice(0, 9)}...`
                  : displayPetname(purse.pursePetname)}
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
            <img src={displayBrandIcon(brand)} />
          </div>
          <div className="flex flex-col flex-grow">
            <div className="flex  items-center justify-between">
              <h2 className="text-xl uppercase font-medium">
                {displayBrandPetname(brand)}
              </h2>
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
