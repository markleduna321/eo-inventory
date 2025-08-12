import Button from '@/app/pages/components/button'
import InputLabelComponent from '@/app/pages/components/input-label-component';
import SelectComponent from '@/app/pages/components/input-select';
import InputTextComponent from '@/app/pages/components/input-text-component';
import Modal from '@/app/pages/components/modal'
import React from 'react'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { create_device_thunk, update_device_thunk } from '../_redux/devices-thunk';
import { clearError, clearSuccess, clearSelectedDevice } from '../_redux/devices-slice';
import { usePage } from '@inertiajs/react';

export default function CreateDevicesSection({ editDevice = null, onClose = null }) {
  const dispatch = useDispatch();
  const { auth } = usePage().props;
  const { loading, error, success } = useSelector((state) => state.devices);
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    serial_number: '',
    device_type: '',
    brand: '',
    model: '',
    operating_system: '',
    mac_address: '',
    specifications: {
      cpu: '',
      ram: '',
      storage: '',
      gpu: '',
    },
    price: '',
    purchase_date: '',
    warranty_expiry: '',
    status: 'Working',
    issued_to: '',
    received_by: auth?.user?.name || '',
  });

  const [errors, setErrors] = useState({});

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setFormData({
      serial_number: '',
      device_type: '',
      brand: '',
      model: '',
      operating_system: '',
      mac_address: '',
      specifications: {
        cpu: '',
        ram: '',
        storage: '',
        gpu: '',
      },
      price: '',
      purchase_date: '',
      warranty_expiry: '',
      status: 'Working',
      issued_to: '',
      received_by: auth?.user?.name || '',
    });
    setErrors({});
    dispatch(clearError());
    dispatch(clearSuccess());
    if (onClose) onClose();
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (editDevice) {
      // Ensure specifications is an object
      let specs = editDevice.specifications;
      
      // Handle string JSON that might need parsing
      if (typeof specs === 'string') {
        try {
          specs = JSON.parse(specs);
        } catch (e) {
          specs = {
            cpu: '',
            ram: '',
            storage: '',
            gpu: '',
          };
        }
      }
      
      // If specs is null or undefined, use default
      if (!specs) {
        specs = {
          cpu: '',
          ram: '',
          storage: '',
          gpu: '',
        };
      }
      
      setFormData({
        serial_number: editDevice.serial_number || '',
        device_type: editDevice.device_type || '',
        brand: editDevice.brand || '',
        model: editDevice.model || '',
        operating_system: editDevice.operating_system || '',
        mac_address: editDevice.mac_address || '',
        specifications: specs,
        price: editDevice.price || '',
        purchase_date: editDevice.purchase_date || '',
        warranty_expiry: editDevice.warranty_expiry || '',
        status: editDevice.status || 'Working',
        issued_to: editDevice.issued_to || '',
        received_by: editDevice.received_by || auth?.user?.name || '',
      });
      setModalOpen(true);
    }
  }, [editDevice, auth?.user?.name]);

  // Handle form success
  useEffect(() => {
    if (success) {
      closeModal();
      dispatch(clearSuccess());
    }
  }, [success, dispatch]);

  // Handle form errors
  useEffect(() => {
    if (error) {
      console.log('Error received:', error);
      try {
        if (typeof error === 'object' && error !== null) {
          if (error.errors) {
            // Handle validation errors object
            setErrors(error.errors);
          } else if (error.message) {
            // Handle error object with message
            setErrors({ general: [error.message] });
          } else {
            // Handle other objects by safely stringifying
            const errorMsg = JSON.stringify(error);
            setErrors({ general: [errorMsg] });
          }
        } else if (typeof error === 'string') {
          // Handle string error
          setErrors({ general: [error] });
        } else {
          // Fallback for any other type
          setErrors({ general: ['An unknown error occurred'] });
        }
      } catch (e) {
        // Safety net in case of JSON circular reference or other stringification errors
        setErrors({ general: ['An error occurred while processing the response'] });
      }
    }
  }, [error]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested specifications fields
    if (name.startsWith('specifications.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Make a safe copy of formData to avoid any reference issues
    const safeData = {...formData};
    
    // Format date fields correctly - handle empty strings and convert to proper format
    if (!safeData.purchase_date || safeData.purchase_date === '') {
      safeData.purchase_date = null;
    }
    
    if (!safeData.warranty_expiry || safeData.warranty_expiry === '') {
      safeData.warranty_expiry = null;
    }
    
    // Ensure specifications is properly formatted
    if (safeData.specifications) {
      // Clean up empty specification values
      const cleanedSpecs = {};
      Object.entries(safeData.specifications).forEach(([key, value]) => {
        // Only keep non-empty values
        if (value && value.trim() !== '') {
          cleanedSpecs[key] = value.trim();
        }
      });
      
      // If all specs are empty, send an empty object instead of null
      safeData.specifications = Object.keys(cleanedSpecs).length > 0 
        ? cleanedSpecs 
        : {};
    } else {
      safeData.specifications = {};
    }
    
    try {
      if (editDevice) {
        // Update existing device - fixed to match thunk expectation
        dispatch(update_device_thunk({
          id: editDevice.id,
          deviceData: safeData
        }));
      } else {
        // Create new device
        dispatch(create_device_thunk(safeData));
      }
    } catch (error) {
      console.error('Error in form submission:', error);
      setErrors({ general: ['An unexpected error occurred while submitting the form'] });
    }
  };

  // Define options for select inputs
  const deviceType = [
    { value: 'Desktop', label: 'Desktop' },
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
      {!editDevice && (
        <Button
          type='button'
          variant='primary'
          size='md'
          onClick={openModal}>
          Add Device
        </Button>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} width='w-4/5 max-w-4xl'>
        <div className="max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="space-y-0">
              {/* Header */}
              <div className='sticky top-0 bg-white px-6 pt-6 pb-4 z-10 border-b border-gray-200'>
                <h2 className='text-2xl font-bold text-gray-900'>
                  {editDevice ? 'Edit Device' : 'Add a new device'}
                </h2>
              </div>

              {/* Form Content */}
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <InputLabelComponent htmlFor="serial_number" labelText="Serial Number"/>
                      <InputTextComponent
                        id="serial_number"
                        name="serial_number" 
                        type="text"
                        value={formData.serial_number}
                        required
                        onChange={handleInputChange}
                        className="w-full"
                        />
                      {errors.serial_number && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.serial_number[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <InputLabelComponent htmlFor="device_type" labelText="Device Type"/>
                      <SelectComponent
                        id="device_type"
                        name="device_type"
                        options={deviceType}
                        value={formData.device_type}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                      {errors.device_type && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.device_type[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <InputLabelComponent htmlFor="brand" labelText="Brand"/>
                      <SelectComponent
                        id="brand"
                        name="brand"
                        options={brand}
                        value={formData.brand}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                      {errors.brand && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.brand[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <InputLabelComponent htmlFor="model" labelText="Model"/>
                      <InputTextComponent
                        id="model"
                        name="model" 
                        type="text"
                        value={formData.model}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                        />
                      {errors.model && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.model[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <InputLabelComponent htmlFor="operating_system" labelText="Operating System"/>
                      <InputTextComponent
                        id="operating_system"
                        name="operating_system" 
                        type="text"
                        value={formData.operating_system}
                        onChange={handleInputChange}
                        className="w-full"
                        />
                      {errors.operating_system && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.operating_system[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <InputLabelComponent htmlFor="mac_address" labelText="MAC Address"/>
                      <InputTextComponent
                        id="mac_address"
                        name="mac_address" 
                        type="text"
                        value={formData.mac_address}
                        onChange={handleInputChange}
                        placeholder="e.g., 00:1B:44:11:3A:B7"
                        className="w-full"
                        />
                      {errors.mac_address && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.mac_address[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Device Specifications */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h3 className="font-semibold mb-4 text-gray-900">Device Specifications</h3>
                      
                      <div className="space-y-3">
                        <div>
                          <InputLabelComponent htmlFor="specifications.cpu" labelText="CPU"/>
                          <InputTextComponent
                            id="specifications.cpu"
                            name="specifications.cpu" 
                            type="text"
                            value={formData.specifications?.cpu || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., Intel Core i7-11700K"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <InputLabelComponent htmlFor="specifications.ram" labelText="RAM"/>
                          <InputTextComponent
                            id="specifications.ram"
                            name="specifications.ram" 
                            type="text"
                            value={formData.specifications?.ram || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., 16GB DDR4"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <InputLabelComponent htmlFor="specifications.storage" labelText="Storage"/>
                          <InputTextComponent
                            id="specifications.storage"
                            name="specifications.storage" 
                            type="text"
                            value={formData.specifications?.storage || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., 512GB SSD"
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <InputLabelComponent htmlFor="specifications.gpu" labelText="GPU"/>
                          <InputTextComponent
                            id="specifications.gpu"
                            name="specifications.gpu" 
                            type="text"
                            value={formData.specifications?.gpu || ''}
                            onChange={handleInputChange}
                            placeholder="e.g., NVIDIA GeForce RTX 3060"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Fields */}
                    <div>
                      <InputLabelComponent htmlFor="price" labelText="Price (₱)"/>
                      <InputTextComponent
                        id="price"
                        name="price" 
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter price"
                        className="w-full"
                        />
                      {errors.price && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.price[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <InputLabelComponent htmlFor="purchase_date" labelText="Purchase Date"/>
                      <InputTextComponent
                        id="purchase_date"
                        name="purchase_date" 
                        type="date"
                        value={formData.purchase_date}
                        onChange={handleInputChange}
                        className="w-full"
                        />
                      {errors.purchase_date && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.purchase_date[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <InputLabelComponent htmlFor="warranty_expiry" labelText="Warranty Expiry"/>
                      <InputTextComponent
                        id="warranty_expiry"
                        name="warranty_expiry" 
                        type="date"
                        value={formData.warranty_expiry}
                        onChange={handleInputChange}
                        className="w-full"
                        />
                      {errors.warranty_expiry && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.warranty_expiry[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <InputLabelComponent htmlFor="status" labelText="Status"/>
                      <SelectComponent
                        id="status"
                        name="status"
                        options={status}
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                      />
                      {errors.status && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.status[0]}
                        </div>
                      )}
                    </div>

                    <div>
                      <InputLabelComponent htmlFor="issued_to" labelText="Issued To (Optional)"/>
                      <InputTextComponent
                        id="issued_to"
                        name="issued_to" 
                        type="text"
                        value={formData.issued_to}
                        onChange={handleInputChange}
                        className="w-full"
                        />
                      {errors.issued_to && (
                        <div className="text-red-500 text-sm mt-1">
                          {errors.issued_to[0]}
                        </div>
                      )}
                    </div>

                    <InputTextComponent
                      id="received_by"
                      name="received_by" 
                      type="hidden"
                      value={formData.received_by}
                      onChange={handleInputChange}
                      />
                  </div>
                </div>

                {/* General Error Message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-red-600 text-sm">
                      {typeof error === 'string' 
                        ? error 
                        : typeof error === 'object' && error !== null && error.message 
                          ? error.message 
                          : errors.general && Array.isArray(errors.general) 
                            ? errors.general[0] 
                            : 'An error occurred while saving the device.'}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className='sticky bottom-0 bg-white px-6 pt-4 pb-6 border-t border-gray-200'>
                <div className='flex justify-end gap-3'>
                  <Button
                    type='button'
                    variant='secondary'
                    size='md'
                    onClick={closeModal}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type='submit'
                    variant='primary'
                    size='md'
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editDevice ? 'Update Device' : 'Save Device')}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
