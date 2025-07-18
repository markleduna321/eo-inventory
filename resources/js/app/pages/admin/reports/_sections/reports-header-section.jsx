import React from 'react'
import Button from '@/app/pages/components/button'

export default function ReportsHeaderSection() {
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
                    >
                        Export All
                    </Button>
                    <Button
                        type='button'
                        variant='primary'
                        size='md'
                    >
                        Generate Report
                    </Button>
                </div>
            </div>
        </div>
    )
}
