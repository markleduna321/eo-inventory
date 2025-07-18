import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all devices
export const get_devices_thunk = createAsyncThunk(
    'devices/getDevices',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get('/api/devices');
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch devices'
            );
        }
    }
);

// Create a new device
export const create_device_thunk = createAsyncThunk(
    'devices/createDevice',
    async (deviceData, { rejectWithValue }) => {
        try {
            const response = await axios.post('/api/devices', deviceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || 'Failed to create device'
            );
        }
    }
);

// Update a device
export const update_device_thunk = createAsyncThunk(
    'devices/updateDevice',
    async ({ id, deviceData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`/api/devices/${id}`, deviceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || 'Failed to update device'
            );
        }
    }
);

// Delete a device
export const delete_device_thunk = createAsyncThunk(
    'devices/deleteDevice',
    async (deviceId, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`/api/devices/${deviceId}`);
            return { id: deviceId, ...response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete device'
            );
        }
    }
);

// Get single device
export const get_device_thunk = createAsyncThunk(
    'devices/getDevice',
    async (deviceId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/devices/${deviceId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch device'
            );
        }
    }
);
