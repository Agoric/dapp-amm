import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoRadioSharp } from 'react-icons/io5';
import { useApplicationContext } from '../../context/Application';

function ApprovalToast() {
  const [Id, setId] = useState('Approved');
  const { state } = useApplicationContext();
  const properties = {
    position: 'top-right',
    hideProgressBar: true,
    closeOnClick: true,
    newestOnTop: true,
    draggable: false,
    progress: false,
    containerId: 'Wallet',
  };
  const component = (
    <div className="flex flex-row items-center">
      <div className="p-[6px] bg-[#E8F8F7]">
        <IoRadioSharp color="#d73252" size={20} />
      </div>
      <div className="font-[16px] px-4">
        Enable the dapp in your wallet to continue.
      </div>
    </div>
  );

  useEffect(() => {
    if (state) {
      if (!state.approved) {
        if (toast.isActive(Id)) {
          toast.update(Id, {
            ...properties,
            autoClose: false,
            render: () => component,
          });
        } else {
          setId(toast(component, properties));
        }
      }
    }
  }, [state.approved]);
  return <></>;
}

export default ApprovalToast;
