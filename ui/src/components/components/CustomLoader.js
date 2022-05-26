import Loader from 'react-loader-spinner';
import React from 'react';

function CustomLoader({ text, size }) {
  return (
    <div className="flex flex-row justify-center items-center p-5 ">
      <Loader type="Oval" color="#62d2cb" height={size} width={size} />
      <div className="pl-2 animate-pulse text-lg">{text}</div>
    </div>
  );
}

export default CustomLoader;
