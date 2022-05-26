import { AmountMath } from '@agoric/ertp';
import { useApplicationContext } from 'context/Application';
import React from 'react';
import { makeDisplayFunctions } from 'utils/helpers';

const PurseListItem = ({ purse }) => {
  const {
    state: { brandToInfo },
  } = useApplicationContext();
  const { displayAmount } = makeDisplayFunctions(brandToInfo);
  const balance = displayAmount(AmountMath.make(purse.brand, purse.value));

  return (
    <div className="flex gap-3 items-center justify-between w-full">
      <h3 className="text-md font-medium">{purse.pursePetname}</h3>
      <div className="text-right">
        <h4 className="text-sm text-gray-500">Balance: {balance}</h4>
      </div>
    </div>
  );
};

export default PurseListItem;
