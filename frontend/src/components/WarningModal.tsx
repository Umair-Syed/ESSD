
'use client';

import { Button, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

interface WarningModalProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    description: string;
    onConfirm: () => void;
}

export default function WarningModal({ openModal, setOpenModal, description, onConfirm}: WarningModalProps) {

  return (
    <div className='absolute'>
      <Button onClick={() => setOpenModal(true)}>Toggle modal</Button>
      <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {description}
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => {
                setOpenModal(false);
                onConfirm();
                }}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
