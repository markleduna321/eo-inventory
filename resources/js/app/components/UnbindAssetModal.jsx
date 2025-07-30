import React from 'react';
import Modal from '@/app/pages/components/modal';
import Button from '@/app/pages/components/button';
import SelectComponent from '@/app/pages/components/input-select';
import InputTextComponent from '@/app/pages/components/input-text-component';

const UnbindAssetModal = ({ 
    isOpen,
    onClose,
    assetType,
    assetId,
    assetName,
    onConfirm
}) => {
    const [unbindReason, setUnbindReason] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // These values must exactly match what the backend expects (StationHistory::REASON_* constants)
    const reasonOptions = [
        { value: 'Damaged', label: 'Damaged' },
        { value: 'For Repair', label: 'For Repair' },
        { value: 'Replace New', label: 'Replace New' }
    ];

    const handleConfirm = async () => {
        if (!unbindReason) {
            return; // Require a reason
        }
        
        // Validate asset ID and type before proceeding
        if (!assetId || !assetType) {
            console.error('Invalid asset ID or type:', { assetId, assetType });
            return;
        }

        setIsSubmitting(true);
        await onConfirm(assetType, assetId, unbindReason, notes);
        setIsSubmitting(false);
        handleClose();
    };

    const handleClose = () => {
        setUnbindReason('');
        setNotes('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
        >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                        <h3 className="text-lg font-medium text-gray-900">
                            Unbind {assetType === 'monitor' ? 'Monitor' : assetType === 'system_unit' ? 'System Unit' : 'Peripheral'}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500 mb-4">
                                You are about to unbind {assetName || `${assetType === 'monitor' ? 'Monitor' : assetType === 'system_unit' ? 'System Unit' : 'Peripheral'} #${assetId}`}. Please provide a reason.
                            </p>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reason *
                                </label>
                                <SelectComponent
                                    value={unbindReason}
                                    onChange={(e) => setUnbindReason(e.target.value)}
                                    options={reasonOptions}
                                    required
                                />
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (optional)
                                </label>
                                <InputTextComponent
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Additional notes about this unbinding"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <Button
                        type="button"
                        variant="danger"
                        className="w-full sm:w-auto sm:ml-3"
                        disabled={!unbindReason || isSubmitting}
                        onClick={handleConfirm}
                    >
                        {isSubmitting ? 'Processing...' : 'Unbind Asset'}
                    </Button>
                    <Button
                        type="button"
                        variant="white"
                        className="mt-3 w-full sm:w-auto sm:mt-0"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default UnbindAssetModal;
