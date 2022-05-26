import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';

import { FiChevronDown } from 'react-icons/fi';
import CustomInput from 'components/components/CustomInput';
import SwapContext from 'context/SwapContext';
import { useApplicationContext } from 'context/Application';
import { displayPetname, makeDisplayFunctions } from 'utils/helpers';
import DialogSwap from '../DialogSwap/DialogSwap';

const SectionSwap = ({ type, value, handleChange }) => {
  const {
    state: { brandToInfo, autoswap },
  } = useApplicationContext();
  const { poolBrands, centralBrand } = autoswap ?? {};

  const { displayBrandIcon, displayBrandPetname } = makeDisplayFunctions(
    brandToInfo,
  );
  const {
    fromPurse,
    fromBrand,
    toPurse,
    toBrand,
    setToBrand,
    setFromBrand,
    setToPurseId,
    setFromPurseId,
  } = useContext(SwapContext);

  const [open, setOpen] = useState(false);

  const brand = type === 'to' ? toBrand : fromBrand;
  const purse = type === 'to' ? toPurse : fromPurse;

  const brands = [centralBrand, ...poolBrands].filter(b => {
    if (type === 'to') {
      return b !== fromBrand;
    }
    return b !== toBrand;
  });

  const handleBrandSelected = newBrand => {
    if (type === 'to') {
      setToBrand(newBrand);
    } else {
      setFromBrand(newBrand);
    }
  };

  const handlePurseSelected = ({ pursePetname: id }) => {
    if (type === 'to') {
      setToPurseId(id);
    } else {
      setFromPurseId(id);
    }
    setOpen(false);
  };

  return (
    <>
      <DialogSwap
        open={open}
        handleClose={() => setOpen(false)}
        brands={brands}
        selectedBrand={brand}
        handleBrandSelected={handleBrandSelected}
        handlePurseSelected={handlePurseSelected}
      />
      <motion.div
        className="flex flex-col bg-alternative p-4 rounded-sm gap-2 select-none"
        layout
      >
        <h3 className="text-xs uppercase text-gray-500 tracking-wide font-medium select-none">
          Swap {type.toUpperCase()}
        </h3>
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12">
            <img src={displayBrandIcon(brand)} />
          </div>
          {purse ? (
            <div
              className="flex flex-col w-28 hover:bg-black cursor-pointer hover:bg-opacity-5 p-1 rounded-sm"
              onClick={() => {
                setOpen(true);
              }}
            >
              <div className="flex  items-center justify-between">
                <h2 className="text-xl uppercase font-medium">
                  {displayBrandPetname(brand)}
                </h2>
                <FiChevronDown className="text-xl" />
              </div>
              <h3 className="text-xs text-gray-500 font-semibold">
                Purse: <span>{displayPetname(purse.pursePetname)}</span>{' '}
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
            onChange={handleChange}
            brand={brand}
            purse={purse}
            showMaxButton={type === 'from'}
          />
        </div>
      </motion.div>
    </>
  );
};

export default SectionSwap;
