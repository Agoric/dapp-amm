import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { FiX } from 'react-icons/fi';
import AssetDialog from './AssetDialog';
import PurseDialog from './PurseDialog/PurseDialog';

const DialogSwap = ({
  open,
  handleClose,
  brands,
  selectedBrand,
  handleBrandSelected,
  handlePurseSelected,
  purseOnly,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key={selectedBrand || purseOnly ? 'purseDialog' : 'assetDialog'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-10 flex items-center justify-center px-4 py-6 z-50"
        >
          <div className="absolute  w-full h-full " onClick={handleClose} />
          <motion.div
            className="bg-white flex flex-col w-full max-w-md rounded-sm max-h-full  z-50"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <div className="flex  justify-between gap-4 p-3 border-b  items-center">
              <h2 className="text-xl font-semibold px-2">Select Asset</h2>
              <FiX
                className="text-3xl hover:bg-gray-100 p-1 rounded-sm cursor-pointer"
                onClick={handleClose}
              />
            </div>
            {selectedBrand || purseOnly ? (
              <PurseDialog
                purseOnly={purseOnly}
                brand={selectedBrand}
                resetBrand={() => handleBrandSelected(null)}
                handlePurseSelected={handlePurseSelected}
              />
            ) : (
              <AssetDialog
                handleBrandSelected={handleBrandSelected}
                brands={brands}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DialogSwap;
