import Button from '@/app/pages/components/button'
import InputLabelComponent from '@/app/pages/components/input-label-component';
import SelectComponent from '@/app/pages/components/input-select';
import InputTextComponent from '@/app/pages/components/input-text-component';
import Modal from '@/app/pages/components/modal'
import React from 'react'
import { useState } from 'react';

export default function CreateDevicesSection() {
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

  const brand = [
    { value: 'HP', label: 'HP' },
    { value: 'Apple', label: 'Apple' },
    { value: 'MSI', label: 'MSI' },
    { value: 'Asus', label: 'Asus' },
    { value: 'Lenovo', label: 'Lenovo' },
    { value: 'Acer', label: 'Acer' },
    { value: 'Dell', label: 'Dell' },
    { value: 'Razer', label: 'Razer' },
    { value: 'LG', label: 'LG' },
    { value: 'Alienware', label: 'Alienware' },
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
        Add Device
      </Button>

      <Modal isOpen={isModalOpen} onClose={closeModal} width='w-1/4'>

        <div>
          <div className=' mb-4 text-2xl'>
            <b>Add a new device</b>
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="serialnumber" labelText="SN"/>
            <InputTextComponent
              id="serialnumber"
              name="serialnumber" 
              type="text"
              required
              onChange=""
              />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="deviceType" labelText="Device Type"/>
            <SelectComponent
              id="deviceType"
              name="deviceType"
              options={deviceType}
              required  
            />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="brand" labelText="Brand"/>
            <SelectComponent
              id="brand"
              name="brand"
              options={brand}
              required  
            />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="model" labelText="Model"/>
            <InputTextComponent
              id="model"
              name="model" 
              type="text"
              required
              onChange=""
              />
          </div>

          <div className=' mb-3'>
            <InputLabelComponent htmlFor="operatingSystem" labelText="OS"/>
            <InputTextComponent
              id="operatingSystem"
              name="operatingSystem" 
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
