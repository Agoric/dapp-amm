import React, { useContext } from 'react';
import AssetContext from 'context/AssetContext';

import { FiX } from 'react-icons/fi';
import AssetDialog from './AssetDialog';
import PurseDialog from './PurseDialog';

const DialogSwap = ({ open, handleClose }) => {
  const [asset] = useContext(AssetContext);

  if (!open) return null;
  return (
    <div className="fixed top-0 left-0 w-screen  h-screen bg-black bg-opacity-10 flex items-center justify-center px-4 py-6">
      <div className="bg-white flex flex-col w-full max-w-md rounded-sm max-h-full z-50">
        <div className="flex  justify-between gap-4 p-3 border-b  items-center">
          <h2 className="text-xl font-semibold px-2">Select Asset</h2>
          <FiX
            className="text-3xl hover:bg-gray-100 p-1 rounded-sm cursor-pointer"
            onClick={handleClose}
          />
        </div>
        {asset?.from ? (
          <PurseDialog handleClose={handleClose} />
        ) : (
          <AssetDialog />
        )}
      </div>
    </div>
  );
};

export default DialogSwap;
