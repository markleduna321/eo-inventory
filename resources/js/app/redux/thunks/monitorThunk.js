import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = '/api/monitors';

// Fetch all monitors
export const fetchMonitors = createAsyncThunk(
    'monitors/fetchMonitors',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_BASE_URL);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch monitors'
            );
        }
    }
);

// Create a new monitor
export const createMonitor = createAsyncThunk(
    'monitors/createMonitor',
    async (monitorData, { rejectWithValue }) => {
        try {
            const response = await axios.post(API_BASE_URL, monitorData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create monitor'
            );
        }
    }
);

// Update an existing monitor
export const updateMonitor = createAsyncThunk(
    'monitors/updateMonitor',
    async ({ id, monitorData }, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/${id}`, monitorData);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update monitor'
            );
        }
    }
);

// Delete a monitor
export const deleteMonitor = createAsyncThunk(
    'monitors/deleteMonitor',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete monitor'
            );
        }
    }
);
