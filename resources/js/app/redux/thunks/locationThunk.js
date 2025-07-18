import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Fetch all locations
export const fetchLocations = createAsyncThunk(
    'locations/fetchLocations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/locations')
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch locations'
            )
        }
    }
)

// Create new location
export const createLocation = createAsyncThunk(
    'locations/createLocation',
    async (locationData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/locations', locationData)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create location'
            )
        }
    }
)

// Update location
export const updateLocation = createAsyncThunk(
    'locations/updateLocation',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/locations/${id}`, data)
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update location'
            )
        }
    }
)

// Delete location
export const deleteLocation = createAsyncThunk(
    'locations/deleteLocation',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`/api/locations/${id}`)
            return id
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete location'
            )
        }
    }
)

// Fetch location statistics
export const fetchLocationStatistics = createAsyncThunk(
    'locations/fetchStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/locations/statistics')
            return response.data.data
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch statistics'
            )
        }
    }
)
