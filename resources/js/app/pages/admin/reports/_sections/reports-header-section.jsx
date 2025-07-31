import React, { useState } from 'react'
import Button from '@/app/pages/components/button'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function ReportsHeaderSection() {
    const [isGenerating, setIsGenerating] = useState(false);
    
    const handleGenerateReport = async () => {
        try {
            setIsGenerating(true);
            // Default to asset inventory report
            const response = await axios.get('/api/reports/asset-inventory');
            
            if (response.data) {
                toast.success('Report generated successfully');
                // Force page refresh to show the newly generated report
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to generate report:', error);
            toast.error('Failed to generate report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleExportAll = async () => {
        try {
            window.open('/api/reports/asset-inventory/export', '_blank');
            toast.success('Exporting all reports');
        } catch (error) {
            console.error('Failed to export reports:', error);
            toast.error('Failed to export reports. Please try again.');
        }
    };
    
    return (
        <div className='bg-white shadow-md rounded-md p-4'>
            <div className='flex justify-between items-center'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>Reports</h1>
                    <p className='text-gray-600 mt-1'>Generate and view various system reports</p>
                </div>
                <div className='flex gap-2'>
                    <Button
                        type='button'
                        variant='secondary'
                        size='md'
                        onClick={handleExportAll}
                    >
                        Export All
                    </Button>
                    <Button
                        type='button'
                        variant='primary'
                        size='md'
                        disabled={isGenerating}
                        onClick={handleGenerateReport}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
