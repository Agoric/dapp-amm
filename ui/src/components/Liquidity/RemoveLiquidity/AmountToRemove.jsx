import React from 'react';

const AmountToRemove = ({ value, setValue, poolShare }) => {
  const updateVal = input => {
    setValue(input);
  };
  return (
    <div className="flex flex-col text-lg gap-2 bg-alternative rounded-sm p-4 ">
      <label htmlFor="amountToRemove">Amount To Remove</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={({ target }) =>
            target.value <= 100 && target.value >= 0 && setValue(target.value)
          }
          min={0}
          max={100}
          step={5}
          className="input-primary w-full"
          placeholder="0.00"
          id="amountToRemove"
        />
        <div className="text-xl absolute top-3 right-3 text-gray-400">%</div>
      </div>
      {poolShare && (
        <div className="flex justify-between text-sm">
          <div>
            <button
              className="rounded-full bg-blue-200 py-1 px-2 ml-2"
              onClick={() => updateVal(25)}
            >
              25%
            </button>
            <button
              className="rounded-full bg-blue-200 py-1 px-2 ml-2"
              onClick={() => updateVal(50)}
            >
              50%
            </button>
            <button
              className="rounded-full bg-blue-200 py-1 px-2 ml-2"
              onClick={() => updateVal(75)}
            >
              75%
            </button>
            <button
              className="rounded-full bg-blue-200 py-1 px-2 ml-2"
              onClick={() => updateVal(100)}
            >
              100%
            </button>
          </div>
          <div>
            Your pool share:{' '}
            <label htmlFor="amountToRemove" className="ml-1 text-green-500">
              {poolShare}%
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmountToRemove;
