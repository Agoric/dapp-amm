import { motion } from 'framer-motion';
import React from 'react';
import { BiTransfer } from 'react-icons/bi';
import { useApplicationContext } from 'context/Application';
import { makeDisplayFunctions } from 'utils/helpers';
import { AmountMath } from '@agoric/ertp';
import { floorMultiplyBy } from '@agoric/zoe/src/contractSupport';

const ExtraInformation = ({
  fromBrand,
  toBrand,
  exchangeRate,
  receiveAtLeast,
}) => {
  const {
    state: { brandToInfo },
  } = useApplicationContext();

  const {
    displayBrandPetname,
    displayAmount,
    getDecimalPlaces,
  } = makeDisplayFunctions(brandToInfo);
  const decimalPlaces = getDecimalPlaces(fromBrand);
  const unitAmount = AmountMath.make(fromBrand, 10n ** BigInt(decimalPlaces));
  const unitPrice = floorMultiplyBy(unitAmount, exchangeRate);
  const fromBrandName = displayBrandPetname(fromBrand);
  const toBrandName = displayBrandPetname(toBrand);

  return (
    <motion.div className="flex flex-col" layout>
      <div className="flex text-gray-400 justify-between items-center">
        Exchange Rate
        <div className="flex flex-1 justify-end pr-2">
          1 {fromBrandName} = {displayAmount(unitPrice, 4)} {toBrandName}
        </div>
        <BiTransfer size={20} />
      </div>
      <div className="flex gap-4 text-gray-400 justify-between">
        Receive at least:
        <div>
          {receiveAtLeast ? displayAmount(receiveAtLeast, 4) : '0.0000'}{' '}
          {toBrandName}
        </div>
      </div>
    </motion.div>
  );
};

export default ExtraInformation;
