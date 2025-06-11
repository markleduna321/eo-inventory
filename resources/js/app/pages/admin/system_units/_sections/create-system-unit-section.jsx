import Button from '@/app/pages/components/button'
import InputLabelComponent from '@/app/pages/components/input-label-component';
import SelectComponent from '@/app/pages/components/input-select';
import InputTextComponent from '@/app/pages/components/input-text-component';
import Modal from '@/app/pages/components/modal'
import React from 'react'
import { useState } from 'react';

export default function CreateSystenUnitSection() {
  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const deviceType = [
    { value: 'Laptop', label: 'Laptop' },
    { value: 'MAC', label: 'MAC' },
    { value: 'Mobile Phone', label: 'Mobile Phone' },
    { value: 'Airpods', label: 'Airpods' },
    { value: 'Tablet', label: 'Tablet' },
  ];

  const location = [
    { value: 'Storage Site 2', label: 'Storage Site 2' },
    { value: 'IT Office Site 2', label: 'IT Office Site 2' },
    { value: 'IT Office Site 3', label: 'IT Office Site 3' },
    { value: 'Site 3', label: 'Site 3' },
    { value: 'Site 2 2nd Floor', label: 'Site 2 2nd Floor' },
  ];

  const status = [
    { value: 'Working', label: 'Working' },
    { value: 'Defective', label: 'Defective' },
    { value: 'For Repair', label: 'For Repair' },
  ];

  return (
    <div>
      <Button
        type='button'
        variant='primary'
        size='md'
        onClick={openModal}>
        Add System Unit
      </Button>

      <Modal isOpen={isModalOpen} onClose={closeModal} width='w-1/4'>

        <div>
          <div className=' mb-4 text-2xl'>
            <b>Add a new system unit</b>
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="cpu" labelText="CPU"/>
            <InputTextComponent
              id="cpu"
              name="cpu" 
              type="text"
              required
              onChange=""
              />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="ram" labelText="RAM"/>
            <InputTextComponent
              id="ram"
              name="ram" 
              type="text"
              required
              onChange=""
              />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="motherboard" labelText="Motherboard"/>
            <InputTextComponent
              id="motherboard"
              name="motherboard" 
              type="text"
              required
              onChange=""
              />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="storage" labelText="Storage"/>
            <InputTextComponent
              id="storage"
              name="storage" 
              type="text"
              required
              onChange=""
              />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="operatingsystem" labelText="OS"/>
            <InputTextComponent
              id="operatingsystem"
              name="operatingsystem" 
              type="text"
              required
              onChange=""
              />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="status" labelText="Status"/>
            <SelectComponent
              id="status"
              name="status"
              options={status}
              required  
            />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="status" labelText="Location"/>
            <SelectComponent
              id="status"
              name="status"
              options={location}
              required  
            />
          </div>

          <div className=' mb-3'>
            <InputTextComponent
              id="receivedBy"
              name="receivedBy" 
              type="hidden"
              required
              value="" // Username
              onChange=""
              />
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
