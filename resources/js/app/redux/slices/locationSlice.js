import { createSlice } from '@reduxjs/toolkit'
import { fetchLocations, createLocation, updateLocation, deleteLocation } from '../thunks/locationThunk'

const initialState = {
    locations: [],
    currentLocation: null,
    loading: false,
    error: null,
    statistics: null
}

const locationSlice = createSlice({
    name: 'locations',
    initialState,
    reducers: {
        setCurrentLocation: (state, action) => {
            state.currentLocation = action.payload
        },
        clearCurrentLocation: (state) => {
            state.currentLocation = null
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch locations
            .addCase(fetchLocations.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLocations.fulfilled, (state, action) => {
                state.loading = false
                state.locations = action.payload
            })
            .addCase(fetchLocations.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Create location
            .addCase(createLocation.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createLocation.fulfilled, (state, action) => {
                state.loading = false
                state.locations.unshift(action.payload)
            })
            .addCase(createLocation.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Update location
            .addCase(updateLocation.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateLocation.fulfilled, (state, action) => {
                state.loading = false
                const index = state.locations.findIndex(location => location.id === action.payload.id)
                if (index !== -1) {
                    state.locations[index] = action.payload
                }
                if (state.currentLocation && state.currentLocation.id === action.payload.id) {
                    state.currentLocation = action.payload
                }
            })
            .addCase(updateLocation.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Delete location
            .addCase(deleteLocation.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteLocation.fulfilled, (state, action) => {
                state.loading = false
                state.locations = state.locations.filter(location => location.id !== action.payload)
                if (state.currentLocation && state.currentLocation.id === action.payload) {
                    state.currentLocation = null
                }
            })
            .addCase(deleteLocation.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { setCurrentLocation, clearCurrentLocation, clearError } = locationSlice.actions
export default locationSlice.reducer
