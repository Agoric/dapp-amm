import clsx from 'clsx';
import { useApplicationContext } from 'context/Application';
import React from 'react';
import { FiChevronLeft } from 'react-icons/fi';
import { makeDisplayFunctions, filterPursesByBrand } from 'utils/helpers';
import ListItem from '../../ListItem/ListItem';
import PurseListItem from '../../ListItem/PurseListItem';
import SkeletonPurseDialog from './SkeletonPurseDialog';

const PurseDialog = ({ purseOnly, brand, resetBrand, handlePurseSelected }) => {
  const {
    state: { brandToInfo, purses },
  } = useApplicationContext();
  const { displayBrandPetname, displayBrandIcon } =
    makeDisplayFunctions(brandToInfo);

  if (!brand) return <SkeletonPurseDialog />;

  const pursesForBrand = filterPursesByBrand(purses, brand);

  return (
    <>
      {!purseOnly && (
        <button
          className="uppercase font-medium flex gap-1 hover:bg-gray-100 p-1 m-3 w-max"
          onClick={resetBrand}
        >
          <FiChevronLeft className="text-xl text-primary" />
          <div className="text-sm"> Go back to asset List</div>
        </button>
      )}

      <div
        className={clsx(
          'flex gap-3 items-center justify-between w-full border-b px-5 ',
          !purseOnly ? 'pb-3' : 'py-3',
        )}
      >
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full">
            <img
              src={displayBrandIcon(brand)}
              alt={displayBrandPetname(brand)}
            />
          </div>

          <div className="flex flex-col">
            <h3 className="uppercase font-semibold">
              {displayBrandPetname(brand)}
            </h3>
          </div>
        </div>
      </div>
      <div className="px-5 py-3">
        <h2 className="text-lg font-medium ">Select Purse</h2>
      </div>

      <div className="flex flex-col px-5 pb-5 gap-4 overflow-auto">
        {pursesForBrand?.map(purse => (
          <div
            key={purse.pursePetname}
            onClick={() => handlePurseSelected(purse)}
          >
            <ListItem>
              <PurseListItem purse={purse} />
            </ListItem>
          </div>
        ))}
        {!pursesForBrand?.length && (
          <h2 className="text-gray-500">No purses found.</h2>
        )}
      </div>
    </>
  );
};

export default PurseDialog;
