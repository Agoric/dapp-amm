import { useApplicationContext } from 'context/Application';
import AssetContext from 'context/AssetContext';
import React, { useContext } from 'react';
import { v4 } from 'uuid';
import AssetListItem from '../ListItem/AssetListItem';
import ListItem from '../ListItem/ListItem';
import SkeletonListItem from '../ListItem/SkeletonListItem';

const AssetDialog = ({ type, setSelectedAsset }) => {
  const [selectedAsset] = useContext(AssetContext);
  const { state } = useApplicationContext();

  const {
    assets,
    autoswap: { centralBrand, poolBrands },
  } = state;

  const filteredAssets = (assets || []).filter(
    ({ brand }) => poolBrands.includes(brand) || brand === centralBrand,
  );

  if (!filteredAssets.length)
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
      {filteredAssets.map(item => (
        <div
          key={v4()}
          onClick={() => {
            setSelectedAsset({
              ...selectedAsset,
              [type]: item,
            });
          }}
        >
          <ListItem>
            <AssetListItem {...item} />
          </ListItem>
        </div>
      ))}
    </div>
  );
};

export default AssetDialog;
