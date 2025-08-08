import React, { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import PeripheralTableSection from './_sections/peripheral-table-section'
import CreatePeripheralsSection from './_sections/create-peripherals-section'
import { CubeIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPeripherals } from '@/app/redux/peripheral/peripheralSlice'

export default function PeripheralsPage() {
    const dispatch = useDispatch()
    const { peripherals, loading } = useSelector(state => state.peripherals)
    
    useEffect(() => {
        dispatch(fetchPeripherals())
    }, [dispatch])
    
    // Get peripheral statistics
    const getPeripheralStats = () => {
        if (!peripherals || !Array.isArray(peripherals.data || peripherals)) {
            return {
                total: 0,
                inStock: 0,
                lowStock: 0,
                outOfStock: 0
            }
        }
        
        const peripheralArray = peripherals.data || peripherals
        
        // Calculate stock status based on available_stock
        const calculateStockStatus = (peripheral) => {
            const availableStock = peripheral.available_stock || 0
            if (availableStock <= 0) {
                return 'Out of Stock'
            } else if (availableStock <= 5) {
                return 'Low Stock'
            } else {
                return 'In Stock'
            }
        }
        
        return {
            total: peripheralArray.length,
            inStock: peripheralArray.filter(p => calculateStockStatus(p) === 'In Stock').length,
            lowStock: peripheralArray.filter(p => calculateStockStatus(p) === 'Low Stock').length,
            outOfStock: peripheralArray.filter(p => calculateStockStatus(p) === 'Out of Stock').length
        }
    }
    
    const stats = getPeripheralStats()
    
    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">

                <div className="sm:flex sm:items-center mb-6">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold text-gray-900">Peripherals</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all the peripherals in your organization.
                        </p>
                    </div>

                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <CreatePeripheralsSection />
                    </div>
                </div>
                
                {/* Peripheral Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-blue-600">Total Items</div>
                                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                            </div>
                            <CubeIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-green-600">In Stock</div>
                                <div className="text-2xl font-bold text-green-900">{stats.inStock}</div>
                            </div>
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">✓</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-amber-600">Low Stock</div>
                                <div className="text-2xl font-bold text-amber-900">{stats.lowStock}</div>
                            </div>
                            <ArrowDownCircleIcon className="w-8 h-8 text-amber-500" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-rose-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-red-600">Out of Stock</div>
                                <div className="text-2xl font-bold text-red-900">{stats.outOfStock}</div>
                            </div>
                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='shadow-md'>
                    <PeripheralTableSection />
                </div>

            </div>
        </AdminLayout>
    )
}
