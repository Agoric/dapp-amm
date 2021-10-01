import React from 'react';

const ListItem = ({ children }) => {
  return (
    <div className="w-full h-16  border rounded-sm cursor-pointer hover:bg-gray-50 p-3 flex items-center">
      {children}
    </div>
  );
};

export default ListItem;
