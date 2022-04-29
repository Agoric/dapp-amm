import { useApplicationContext } from 'context/Application';
import React, { useMemo } from 'react';

function CustomInput({
  value,
  handleChange,
  asset,
  type,
  rateAvailable,
  useCase,
}) {
  const { state } = useApplicationContext();
  const { assets } = state;

  const balance = useMemo(() => {
    let purse;
    let exit = false;
    assets.forEach(assetobj => {
      if (exit) return;
      assetobj.purses.forEach(p => {
        if (exit) return;
        if (p?.name === asset[type]?.purse?.name) {
          purse = p;
          exit = true;
        }
      });
    });
    return purse?.balance;
  }, [assets, asset]);

  const onMax = () => {
    asset[type] && handleChange({ target: { value: balance } });
  };

  const showMaxButton = type === 'from' && balance;

  return (
    <div className="relative flex-grow">
      {showMaxButton && (
        <div className="absolute top-3 left-3">
          <button
            className={
              'bg-transparent hover:bg-gray-100 text-[#3BC7BE] font-semibold py-[3px] px-1 border border-[#3BC7BE] rounded text-xs leading-3'
            }
            disabled={rateAvailable}
            onClick={onMax}
          >
            Max
          </button>
        </div>
      )}
      <input
        type="number"
        placeholder="0.0"
        value={value}
        onChange={handleChange}
        className={`rounded-sm bg-white bg-opacity-100 text-xl p-3 leading-6 w-full hover:outline-none focus:outline-none border-none ${
          showMaxButton ? 'pl-[52px]' : 'pl-[12px]'
        }`}
        disabled={
          useCase === 'swap'
            ? rateAvailable || !asset.to || !asset.from
            : rateAvailable || !asset.central || !asset.secondary
        }
        min="0"
        max="10000000"
      />
      {asset[type]?.purse && (
        <div className="absolute right-3 top-1 text-gray-400 flex flex-col text-right text-sm bg-white">
          <div>Balance: {balance}</div>
          <div>~ ${asset[type].purse.balanceUSD}</div>
        </div>
      )}
    </div>
  );
}

export default CustomInput;
