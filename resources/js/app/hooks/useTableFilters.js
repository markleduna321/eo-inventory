import { useState, useMemo } from 'react'

export const useTableFilters = (data, searchableFields = [], filterableFields = {}) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [filters, setFilters] = useState({})

    // Optimized filtering with useMemo to prevent re-computation on every render
    const filteredData = useMemo(() => {
        if (!data || data.length === 0) return []

        return data.filter(item => {
            // Search filter - case insensitive search across specified fields
            const matchesSearch = searchTerm === '' || searchableFields.some(field => {
                const value = getNestedValue(item, field)
                return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            })

            // Apply all filters
            const matchesFilters = Object.entries(filters).every(([filterKey, filterValue]) => {
                if (!filterValue || filterValue === '') return true

                const itemValue = getNestedValue(item, filterKey)
                
                // Handle different filter types
                if (filterableFields[filterKey]?.type === 'exact') {
                    return itemValue === filterValue
                }
                
                // Default: case-insensitive includes
                return itemValue && itemValue.toString().toLowerCase().includes(filterValue.toLowerCase())
            })

            return matchesSearch && matchesFilters
        })
    }, [data, searchTerm, filters, searchableFields, filterableFields])

    const handleSearchChange = (value) => {
        setSearchTerm(value)
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const clearFilters = () => {
        setSearchTerm('')
        setFilters({})
    }

    const filterStats = {
        total: data?.length || 0,
        filtered: filteredData.length,
        isFiltered: searchTerm !== '' || Object.values(filters).some(v => v !== '' && v !== null)
    }

    return {
        searchTerm,
        filters,
        filteredData,
        filterStats,
        handleSearchChange,
        handleFilterChange,
        clearFilters
    }
}

// Helper function to get nested object values (e.g., 'user.name')
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
}

export default useTableFilters
