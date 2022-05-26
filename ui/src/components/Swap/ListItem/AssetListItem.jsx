import { useApplicationContext } from 'context/Application';
import React from 'react';
import { makeDisplayFunctions } from 'utils/helpers';
import { v4 as uuid } from 'uuid';

const AssetListItem = ({ brand }) => {
  const {
    state: { brandToInfo },
  } = useApplicationContext();

  const { displayBrandIcon, displayBrandPetname } = makeDisplayFunctions(
    brandToInfo,
  );

  return (
    <div
      key={uuid()}
      className="flex gap-3 items-center justify-between w-full"
    >
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-full">
          <img src={displayBrandIcon(brand)} alt={displayBrandPetname(brand)} />
        </div>

        <div className="flex flex-col">
          <h3 className="uppercase font-semibold">
            {displayBrandPetname(brand)}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default AssetListItem;
