import React, { useContext } from 'react';
import { useApplicationContext } from 'context/Application';
import AssetContext from 'context/AssetContext';
import PoolContext from 'context/PoolContext';
import ErrorContext from 'context/ErrorContext';

const YOURS = 'YOURS';

const ItemLiquidityPool = ({
  Central,
  Secondary,
  type,
  item,
  handleClose,
  setTabIndex,
}) => {
  // get state
  const { state } = useApplicationContext();
  const { assets } = state;

  const [_error, setError] = useContext(ErrorContext);
  const [asset, setAsset] = useContext(AssetContext);
  const [pool, setPool] = useContext(PoolContext);

  const setAddLiquidity = () => {
    setTabIndex(0);
    handleClose();
    const secondarySelected = item.Secondary;

    const assetSelected = assets.find(elem => {
      return elem.code === secondarySelected.info.petname;
    });
    if (!assetSelected) {
      setError("Can't find the selected asset in your wallet.");

      setTimeout(() => {
        setError('');
      }, 2500);
      return;
    }

    setAsset({
      ...asset,
      secondary: assetSelected,
    });
  };

  const setRemoveLiquidity = () => {
    setTabIndex(1);
    handleClose();
    const secondarySelected = item.Secondary;
    let assetSelected = assets.find(elem => {
      return elem.code === secondarySelected.info.petname;
    });

    if (!assetSelected) {
      setError("Can't find the selected asset in your wallet.");

      setTimeout(() => {
        setError('');
      }, 2500);
      return;
    }
    assetSelected = { ...assetSelected, liquidityInfo: { ...item } };
    setPool({
      ...pool,
      selectRemove: { central: item.Central, liquidity: item.Secondary },
    });
    setAsset({
      ...asset,
      centralRemove: item.Central,
      secondaryRemove: assetSelected,
    });
  };
  return (
    <div className="border w-full p-4 flex flex-col gap-2 text-gray-500">
      <h3 className="font-medium text-lg text-black">
        {Central?.info?.petname} / {Secondary?.info?.petname}
      </h3>
      {type === YOURS ? (
        <div className="flex justify-between text-black">
          <h4 className="text-md">Share of Pool:</h4>
          <h4>{item?.User?.share}%</h4>
        </div>
      ) : (
        ''
      )}
      <div className="flex justify-between">
        <h4>{Central?.info?.petname}</h4>
        <h4>{Central?.value}</h4>
      </div>
      <div className="flex justify-between">
        <h4>{Secondary?.info?.petname}</h4>
        <h4>{Secondary?.value}</h4>
      </div>
      <div className="flex gap-3 mt-2">
        <button className="btn-primary w-full p-0.5" onClick={setAddLiquidity}>
          Add
        </button>
        {type === YOURS ? (
          <button
            className="btn-primary w-full p-0.5"
            onClick={setRemoveLiquidity}
          >
            Remove
          </button>
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

export default ItemLiquidityPool;
