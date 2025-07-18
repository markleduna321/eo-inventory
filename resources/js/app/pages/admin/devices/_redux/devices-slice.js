import { createSlice } from '@reduxjs/toolkit';
import {
    get_devices_thunk,
    create_device_thunk,
    update_device_thunk,
    delete_device_thunk,
    get_device_thunk
} from './devices-thunk';

const initialState = {
    devices: [],
    selectedDevice: null,
    loading: false,
    error: null,
    success: false,
};

const devicesSlice = createSlice({
    name: 'devices',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        setSelectedDevice: (state, action) => {
            state.selectedDevice = action.payload;
        },
        clearSelectedDevice: (state) => {
            state.selectedDevice = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get devices
            .addCase(get_devices_thunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(get_devices_thunk.fulfilled, (state, action) => {
                state.loading = false;
                state.devices = action.payload.data || [];
                state.error = null;
            })
            .addCase(get_devices_thunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Create device
            .addCase(create_device_thunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(create_device_thunk.fulfilled, (state, action) => {
                state.loading = false;
                state.devices.unshift(action.payload.data);
                state.success = true;
                state.error = null;
            })
            .addCase(create_device_thunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            
            // Update device
            .addCase(update_device_thunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(update_device_thunk.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.devices.findIndex(device => device.id === action.payload.data.id);
                if (index !== -1) {
                    state.devices[index] = action.payload.data;
                }
                state.success = true;
                state.error = null;
            })
            .addCase(update_device_thunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            
            // Delete device
            .addCase(delete_device_thunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(delete_device_thunk.fulfilled, (state, action) => {
                state.loading = false;
                state.devices = state.devices.filter(device => device.id !== action.payload.id);
                state.success = true;
                state.error = null;
            })
            .addCase(delete_device_thunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Get single device
            .addCase(get_device_thunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(get_device_thunk.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedDevice = action.payload.data;
                state.error = null;
            })
            .addCase(get_device_thunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearSuccess, setSelectedDevice, clearSelectedDevice } = devicesSlice.actions;
export default devicesSlice.reducer;
