import Button from '@/app/pages/components/button'
import InputLabelComponent from '@/app/pages/components/input-label-component';
import InputTextComponent from '@/app/pages/components/input-text-component';
import Modal from '@/app/pages/components/modal'
import React from 'react'
import { useState } from 'react';

export default function CreateDevicesSection() {
  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
    <div>
      <Button
        type='button'
        variant='primary'
        size='md'
        onClick={openModal}>
        Add Device
      </Button>

      <Modal isOpen={isModalOpen} onClose={closeModal} width='w-1/4'>

        <div>
          <div className=' mb-4 text-2xl'>
            <b>Add a new device.</b>
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="deviceType" labelText="Device Type"/>
            <InputTextComponent 
            id="deviceType"
            name="deviceType"
            type='text'
            required/>
          </div>

          {/* Buttons */}
          <div className='flex float-end gap-2 '>
            <Button
              type='button'
              variant='primary'
              size='md'
            >
              Save
            </Button>

            <Button
              type='button'
              variant='danger'
              size='md'
              onClick={closeModal}>
              X
            </Button>
          </div>
        </div>


      </Modal>
    </div>
  )
}
