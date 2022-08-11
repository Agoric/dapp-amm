import React, { useContext, useEffect } from 'react';
import { useApplicationContext } from 'context/Application';
import { filterPursesByBrand } from 'utils/helpers';
import PoolContext from 'context/PoolContext';
import PurseRemovePool from './PurseRemovePool';

const PursesRemovePool = ({ amount }) => {
  const { setCentralPurseIdToUse } = useContext(PoolContext);

  const {
    state: { central: centralBrand, purses },
  } = useApplicationContext();
  const centralPurses = purses ? filterPursesByBrand(purses, centralBrand) : [];

  useEffect(() => {
    if (centralPurses.length === 1) {
      setCentralPurseIdToUse(centralPurses[0].pursePetname);
    }
  }, [centralPurses]);

  return (
    <div className="flex flex-col text-lg gap-2 bg-alternative rounded-sm p-4">
      <h3>You Will Receive</h3>
      <div className="flex gap-4">
        <PurseRemovePool amount={amount} type="central" />
        <PurseRemovePool amount={amount} type="secondary" />
      </div>
    </div>
  );
};

export default PursesRemovePool;
