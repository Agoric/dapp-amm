import PoolContext from 'context/PoolContext';
import React, { useContext } from 'react';

const PoolSelector = ({ setOpen }) => {
  const [pool] = useContext(PoolContext);
  return (
    <div className="flex justify-between">
      <h2 className="text-lg font-medium">
        {pool?.selectRemove
          ? `${pool?.selectRemove?.central?.info.petname} / ${pool?.selectRemove?.liquidity?.info.petname} Pool`
          : 'No Pool Selected'}
      </h2>

      <a
        className="text-lg text-primary hover:underline cursor-pointer"
        onClick={() => {
          setOpen(true);
        }}
      >
        {pool?.selectRemove ? `Change Pool` : 'Choose'}
      </a>
    </div>
  );
};

export default PoolSelector;
