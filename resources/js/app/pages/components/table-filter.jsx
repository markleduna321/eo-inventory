import React, { useState, useEffect, useCallback } from 'react'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

const TableFilter = ({ 
    searchTerm, 
    onSearchChange, 
    filters, 
    onFilterChange, 
    onClearFilters,
    filterOptions = {},
    placeholder = "Search...",
    debounceMs = 300 
}) => {
    const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
    const [showFilters, setShowFilters] = useState(false)

    // Debounced search to prevent lag
    const debouncedSearch = useCallback(
        debounce((value) => {
            onSearchChange(value)
        }, debounceMs),
        [onSearchChange, debounceMs]
    )

    useEffect(() => {
        debouncedSearch(localSearchTerm)
    }, [localSearchTerm, debouncedSearch])

    const handleSearchInput = (e) => {
        setLocalSearchTerm(e.target.value)
    }

    const handleFilterChange = (filterKey, value) => {
        onFilterChange(filterKey, value)
    }

    const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== null)

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            {/* Search and Filter Toggle Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <InputTextComponent
                            type="text"
                            placeholder={placeholder}
                            value={localSearchTerm}
                            onChange={handleSearchInput}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {localSearchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setLocalSearchTerm('')
                                    onSearchChange('')
                                }}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant={showFilters ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FunnelIcon className="h-4 w-4 mr-1" />
                        Filters
                        {hasActiveFilters && (
                            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                                {Object.values(filters).filter(value => value !== '' && value !== null).length}
                            </span>
                        )}
                    </Button>
                    
                    {hasActiveFilters && (
                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={onClearFilters}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Collapsible Filters Section */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Object.entries(filterOptions).map(([key, options]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                    {key.replace('_', ' ')}
                                </label>
                                <SelectComponent
                                    value={filters[key] || ''}
                                    onChange={(e) => handleFilterChange(key, e.target.value)}
                                    options={[
                                        { label: `All ${key.replace('_', ' ')}`, value: '' },
                                        ...options
                                    ]}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

// Debounce utility function
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

export default TableFilter
