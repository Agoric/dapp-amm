import React, { useContext, useEffect, useState } from 'react';

import { FiChevronDown } from 'react-icons/fi';

import DialogSwap from 'components/Swap/DialogSwap/DialogSwap';
import { useApplicationContext } from 'context/Application';
import CustomInput from 'components/components/CustomInput';
import { filterPursesByBrand, makeDisplayFunctions } from 'utils/helpers';
import PoolContext from 'context/PoolContext';

const CentralAssetLiquidity = ({ value, handleChange }) => {
  const {
    state: { autoswap, purses, brandToInfo },
  } = useApplicationContext();
  const { centralBrand } = autoswap ?? {};
  const { displayBrandIcon, displayBrandPetname } =
    makeDisplayFunctions(brandToInfo);
  const { centralPurseToUse, setCentralPurseIdToUse, purseToAdd } =
    useContext(PoolContext);

  const [open, setOpen] = useState(false);
  const centralPurses = purses ? filterPursesByBrand(purses, centralBrand) : [];

  useEffect(() => {
    if (centralPurses.length === 1) {
      setCentralPurseIdToUse(centralPurses[0].pursePetname);
    }
  }, [centralPurses]);

  const centralPetname = displayBrandPetname(centralBrand);

  const AssetSelector = () => {
    switch (centralPurses.length) {
      case 1:
        return (
          <div className="flex flex-col w-28  p-1 rounded-sm">
            <div className="flex  items-center justify-between">
              <h2 className="text-xl uppercase font-medium">
                {centralPetname}
              </h2>
            </div>
            <h3 className="text-xs text-gray-500 font-semibold">
              Purse: <span>{centralPurseToUse?.pursePetname}</span>
            </h3>
          </div>
        );

      case 0:
        return (
          <div className="flex flex-col w-28    p-1 rounded-sm">
            <div className="flex  items-center justify-between">
              <h2 className="text-xl uppercase font-medium">
                {centralPetname}
              </h2>
            </div>
            <h3 className="text-xs text-gray-500 font-semibold">No Purses</h3>
          </div>
        );

      default:
        return centralPurseToUse ? (
          <div
            className="flex flex-col w-28 hover:bg-black cursor-pointer hover:bg-opacity-5 p-1 rounded-sm"
            onClick={() => {
              setOpen(true);
            }}
          >
            <div className="flex  items-center justify-between">
              <h2 className="text-xl uppercase font-medium">
                {centralPetname}
              </h2>
              <FiChevronDown className="text-xl" />
            </div>
            <h3 className="text-xs text-gray-500 font-semibold">
              Purse: <span>{centralPurseToUse.pursePetname}</span>
            </h3>
          </div>
        ) : (
          <div
            className="flex flex-col w-28  p-1 rounded-sm hover:bg-black cursor-pointer hover:bg-opacity-5"
            onClick={() => {
              setOpen(true);
            }}
          >
            <div className="flex  items-center justify-between">
              <h2 className="text-xl uppercase font-medium">
                {centralPetname}
              </h2>
            </div>
            <h3 className="text-xs text-primary font-semibold flex items-center gap-1">
              Select Purse <FiChevronDown className="text-xl" />
            </h3>
          </div>
        );
    }
  };

  return (
    <>
      <DialogSwap
        handleClose={() => setOpen(false)}
        open={open}
        purseOnly={true}
        brand={centralBrand}
        handlePurseSelected={({ pursePetname }) =>
          setCentralPurseIdToUse(pursePetname)
        }
      />
      <div className="flex flex-col bg-alternative p-4 rounded-sm gap-2 select-none">
        <h3 className="text-xs uppercase text-gray-500 tracking-wide font-medium select-none">
          Input
        </h3>
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 rounded-full bg-gray-500">
            <img src={displayBrandIcon(centralBrand)} />
          </div>
          <AssetSelector />
          <CustomInput
            value={value}
            onChange={handleChange}
            purse={centralPurseToUse}
            disabled={!purseToAdd}
            brand={centralBrand}
          />
        </div>
      </div>
    </>
  );
};

export default CentralAssetLiquidity;
