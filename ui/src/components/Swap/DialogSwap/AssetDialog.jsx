import React from 'react';
import { v4 } from 'uuid';
import AssetListItem from '../ListItem/AssetListItem';
import ListItem from '../ListItem/ListItem';
import SkeletonListItem from '../ListItem/SkeletonListItem';

const AssetDialog = ({ brands, handleBrandSelected }) => {
  if (!(brands && brands.length))
    return (
      <div className="flex flex-col gap-4 p-5 overflow-auto ">
        {Array(4)
          .fill({})
          .map(() => (
            <ListItem key={v4()}>
              <SkeletonListItem />
            </ListItem>
          ))}
      </div>
    );

  return (
    <div className="flex flex-col gap-4 p-5 overflow-auto ">
      {brands.map(brand => (
        <div
          key={v4()}
          onClick={() => {
            handleBrandSelected(brand);
          }}
        >
          <ListItem>
            <AssetListItem brand={brand} />
          </ListItem>
        </div>
      ))}
    </div>
  );
};

export default AssetDialog;
