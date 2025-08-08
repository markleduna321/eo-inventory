import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Fetch all stations
export const fetchStations = createAsyncThunk(
    'stations/fetchStations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/stations')
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch stations'
            )
        }
    }
)

// Create new station
export const createStation = createAsyncThunk(
    'stations/createStation',
    async (stationData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/stations', stationData)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create station'
            )
        }
    }
)

// Update station
export const updateStation = createAsyncThunk(
    'stations/updateStation',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/stations/${id}`, data)
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update station'
            )
        }
    }
)

// Delete station
export const deleteStation = createAsyncThunk(
    'stations/deleteStation',
    async (stationId, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/stations/${stationId}`)
            return stationId
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete station'
            )
        }
    }
)

// Fetch available monitors
export const fetchAvailableMonitors = createAsyncThunk(
    'stations/fetchAvailableMonitors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/stations/available-monitors')
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch available monitors'
            )
        }
    }
)

// Fetch available system units
export const fetchAvailableSystemUnits = createAsyncThunk(
    'stations/fetchAvailableSystemUnits',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/stations/available-system-units')
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch available system units'
            )
        }
    }
)

// Fetch available peripherals
export const fetchAvailablePeripherals = createAsyncThunk(
    'stations/fetchAvailablePeripherals',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Fetching available peripherals...')
            const response = await axios.get('/api/stations/available-peripherals')
            console.log('Available peripherals response:', response.data)
            return response.data
        } catch (error) {
            console.error('Error fetching available peripherals:', error)
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch available peripherals'
            )
        }
    }
)

// Fetch available peripherals with serial numbers
export const fetchAvailablePeripheralsWithSerials = createAsyncThunk(
    'stations/fetchAvailablePeripheralsWithSerials',
    async (_, { rejectWithValue }) => {
        try {
            console.log('Fetching available peripherals with serials...')
            const response = await axios.get('/api/stations/available-peripherals-with-serials')
            console.log('Available peripherals with serials response:', response.data)
            return response.data
        } catch (error) {
            console.error('Error fetching available peripherals with serials:', error)
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch available peripherals with serials'
            )
        }
    }
)

// Fetch station locations
export const fetchStationLocations = createAsyncThunk(
    'stations/fetchStationLocations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/stations/locations')
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch locations'
            )
        }
    }
)

// Assign asset to station
export const assignAssetToStation = createAsyncThunk(
    'stations/assignAsset',
    async ({ stationId, assetType, assetId }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/api/stations/${stationId}/assign-asset`, {
                asset_type: assetType,
                asset_id: assetId
            })
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to assign asset'
            )
        }
    }
)

// Unassign asset from station
export const unassignAssetFromStation = createAsyncThunk(
    'stations/unassignAsset',
    async ({ stationId, assetType, assetId }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`/api/stations/${stationId}/unassign-asset`, {
                asset_type: assetType,
                asset_id: assetId
            })
            return response.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to unassign asset'
            )
        }
    }
)
