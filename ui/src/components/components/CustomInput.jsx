import { AmountMath, AssetKind } from '@agoric/ertp';
import { useApplicationContext } from 'context/Application';
import React, { useState } from 'react';
import { makeDisplayFunctions } from 'utils/helpers';
import { parseAsValue, stringifyValue } from '@agoric/ui-components';

function CustomInput({
  value,
  onChange,
  showMaxButton,
  purse,
  disabled,
  brand,
}) {
  const {
    state: { brandToInfo },
  } = useApplicationContext();
  const { displayAmount, getDecimalPlaces } = makeDisplayFunctions(brandToInfo);

  const decimalPlaces = (brand && getDecimalPlaces(brand)) || 0;
  const onMax = () => purse && onChange(purse.value);

  const amountString = stringifyValue(value, AssetKind.NAT, decimalPlaces, 4);
  const [fieldString, setFieldString] = useState(
    value === null ? '0' : amountString,
  );

  const currentAmount = purse
    ? displayAmount(AmountMath.make(purse.brand, purse.value), 4)
    : '0.0';

  const handleInputChange = ev => {
    const str = ev.target.value.replace('-', '').replace('e', '');
    setFieldString(str);
    const parsed = parseAsValue(str, AssetKind.NAT, decimalPlaces);
    onChange(parsed);
  };

  const displayString =
    value === parseAsValue(fieldString, AssetKind.NAT, decimalPlaces)
      ? fieldString
      : amountString;

  return (
    <div className="relative flex-grow">
      {showMaxButton && (
        <div className="absolute top-3 left-3">
          <button
            className={
              'bg-transparent hover:bg-gray-100 text-[#3BC7BE] font-semibold py-[3px] px-1 border border-[#3BC7BE] rounded text-xs leading-3'
            }
            disabled={disabled}
            onClick={onMax}
          >
            Max
          </button>
        </div>
      )}
      <input
        type="number"
        placeholder="0.0"
        value={displayString}
        onChange={handleInputChange}
        className={`rounded-sm bg-white bg-opacity-100 text-xl p-3 leading-6 w-full hover:outline-none focus:outline-none border-none ${
          showMaxButton ? 'pl-[52px]' : 'pl-[12px]'
        }`}
        disabled={disabled || !purse}
        min="0"
      />
      {purse && (
        <div className="absolute right-1 top-0 text-gray-400 flex flex-col text-right text-sm">
          <div>Balance: {currentAmount}</div>
        </div>
      )}
    </div>
  );
}

export default CustomInput;
