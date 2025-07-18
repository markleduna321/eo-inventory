import { createSlice } from '@reduxjs/toolkit';
import { 
    fetchMonitors, 
    createMonitor, 
    updateMonitor, 
    deleteMonitor 
} from '../thunks/monitorThunk';

const initialState = {
    monitors: [],
    loading: false,
    error: null,
    currentMonitor: null,
};

const monitorSlice = createSlice({
    name: 'monitors',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentMonitor: (state, action) => {
            state.currentMonitor = action.payload;
        },
        clearCurrentMonitor: (state) => {
            state.currentMonitor = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch monitors
            .addCase(fetchMonitors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMonitors.fulfilled, (state, action) => {
                state.loading = false;
                state.monitors = action.payload;
            })
            .addCase(fetchMonitors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create monitor
            .addCase(createMonitor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createMonitor.fulfilled, (state, action) => {
                state.loading = false;
                state.monitors.unshift(action.payload);
            })
            .addCase(createMonitor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update monitor
            .addCase(updateMonitor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateMonitor.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.monitors.findIndex(monitor => monitor.id === action.payload.id);
                if (index !== -1) {
                    state.monitors[index] = action.payload;
                }
            })
            .addCase(updateMonitor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete monitor
            .addCase(deleteMonitor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteMonitor.fulfilled, (state, action) => {
                state.loading = false;
                state.monitors = state.monitors.filter(monitor => monitor.id !== action.payload);
            })
            .addCase(deleteMonitor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setCurrentMonitor, clearCurrentMonitor } = monitorSlice.actions;
export default monitorSlice.reducer;
