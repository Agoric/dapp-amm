/* eslint-disable no-nested-ternary */
import React, { useState, useContext } from 'react';

import { FiChevronDown, FiPlus } from 'react-icons/fi';

import DialogSwap from 'components/Swap/DialogSwap/DialogSwap';
import CustomInput from 'components/components/CustomInput';
import PoolContext from 'context/PoolContext';
import { useApplicationContext } from 'context/Application';
import { makeDisplayFunctions } from 'utils/helpers';

const SecondaryAssetLiquidity = ({
  value,
  handleChange,
  disabled,
  setPoolMenuOpen,
}) => {
  const {
    state: { brandToInfo },
  } = useApplicationContext();
  const { displayBrandIcon, displayBrandPetname } =
    makeDisplayFunctions(brandToInfo);

  const { brandToAdd, purseToAdd, setPurseIdToAdd } = useContext(PoolContext);
  const [purseDialogOpen, setPurseDialogOpen] = useState(false);

  const handlePurseSelected = purse => {
    setPurseIdToAdd(purse?.pursePetname);
    setPurseDialogOpen(false);
  };

  return (
    <>
      <DialogSwap
        handleClose={() => setPurseDialogOpen(false)}
        open={purseDialogOpen}
        selectedBrand={brandToAdd}
        purseOnly={true}
        handlePurseSelected={handlePurseSelected}
      />
      <div className="relative flex flex-col bg-alternative p-4 rounded-sm gap-2 select-none">
        <FiPlus
          size="30"
          className="transform-gpu rotate-90 p-1 bg-alternative absolute text-3xl -top-6 left-6 border-4 border-white"
        />
        <h3 className="text-xs uppercase text-gray-500 tracking-wide font-medium select-none">
          Input
        </h3>
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12">
            <img src={displayBrandIcon(brandToAdd)} />
          </div>
          {purseToAdd ? (
            <div
              className="flex flex-col w-28 hover:bg-black cursor-pointer hover:bg-opacity-5 p-1 rounded-sm"
              onClick={() => {
                setPurseDialogOpen(true);
              }}
            >
              <div className="flex  items-center justify-between">
                <h2 className="text-xl uppercase font-medium">
                  {displayBrandPetname(brandToAdd)}
                </h2>
                <FiChevronDown className="text-xl" />
              </div>
              <h3 className="text-xs text-gray-500 font-semibold">
                Purse: <span>{purseToAdd?.pursePetname}</span>{' '}
              </h3>
            </div>
          ) : brandToAdd ? (
            <div
              className="flex flex-col w-28  p-1 rounded-sm hover:bg-black cursor-pointer hover:bg-opacity-5"
              onClick={() => {
                setPurseDialogOpen(true);
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl uppercase font-medium">
                  {displayBrandPetname(brandToAdd)}
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
              onClick={() => setPoolMenuOpen(true)}
            >
              Select asset
            </button>
          )}
          <CustomInput
            value={value}
            onChange={handleChange}
            purse={purseToAdd}
            brand={brandToAdd}
          />
        </div>
      </div>
    </>
  );
};

export default SecondaryAssetLiquidity;
