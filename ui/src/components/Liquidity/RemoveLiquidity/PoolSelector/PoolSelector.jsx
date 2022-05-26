import { useApplicationContext } from 'context/Application';
import PoolContext from 'context/PoolContext';
import React, { useContext } from 'react';
import { makeDisplayFunctions } from 'utils/helpers';

const PoolSelector = ({ setOpen }) => {
  const {
    state: { brandToInfo, autoswap },
  } = useApplicationContext();
  const { centralBrand } = autoswap ?? {};
  const { displayBrandPetname } = makeDisplayFunctions(brandToInfo);
  const { brandToRemove } = useContext(PoolContext);

  return (
    <div className="flex justify-between">
      <h2 className="text-lg font-medium">
        {brandToRemove
          ? `${displayBrandPetname(centralBrand)} / ${displayBrandPetname(
              brandToRemove,
            )} Pool`
          : 'No Pool Selected'}
      </h2>

      <a
        className="text-lg text-primary hover:underline cursor-pointer"
        onClick={() => {
          setOpen(true);
        }}
      >
        {brandToRemove ? `Change Pool` : 'Choose'}
      </a>
    </div>
  );
};

export default PoolSelector;
