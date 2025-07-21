import { createSlice } from '@reduxjs/toolkit'
import {
    fetchStations,
    createStation,
    updateStation,
    deleteStation,
    fetchAvailableMonitors,
    fetchAvailableSystemUnits,
    fetchAvailablePeripherals,
    fetchStationLocations
} from '../thunks/stationThunk'

const initialState = {
    stations: [],
    availableMonitors: [],
    availableSystemUnits: [],
    availablePeripherals: [],
    locations: [],
    currentStation: null,
    loading: false,
    error: null
}

const stationSlice = createSlice({
    name: 'stations',
    initialState,
    reducers: {
        setCurrentStation: (state, action) => {
            state.currentStation = action.payload
        },
        clearCurrentStation: (state) => {
            state.currentStation = null
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch stations
            .addCase(fetchStations.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchStations.fulfilled, (state, action) => {
                state.loading = false
                state.stations = action.payload
            })
            .addCase(fetchStations.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Create station
            .addCase(createStation.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createStation.fulfilled, (state, action) => {
                state.loading = false
                state.stations.unshift(action.payload.station)
            })
            .addCase(createStation.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Update station
            .addCase(updateStation.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateStation.fulfilled, (state, action) => {
                state.loading = false
                const index = state.stations.findIndex(station => station.id === action.payload.station.id)
                if (index !== -1) {
                    state.stations[index] = action.payload.station
                }
            })
            .addCase(updateStation.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Delete station
            .addCase(deleteStation.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteStation.fulfilled, (state, action) => {
                state.loading = false
                state.stations = state.stations.filter(station => station.id !== action.payload)
            })
            .addCase(deleteStation.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Fetch available monitors
            .addCase(fetchAvailableMonitors.fulfilled, (state, action) => {
                state.availableMonitors = action.payload
            })

            // Fetch available system units
            .addCase(fetchAvailableSystemUnits.fulfilled, (state, action) => {
                state.availableSystemUnits = action.payload
            })

            // Fetch available peripherals
            .addCase(fetchAvailablePeripherals.fulfilled, (state, action) => {
                state.availablePeripherals = action.payload
            })
            .addCase(fetchAvailablePeripherals.rejected, (state, action) => {
                state.error = action.payload
                console.error('Failed to fetch available peripherals:', action.payload)
            })

            // Fetch locations
            .addCase(fetchStationLocations.fulfilled, (state, action) => {
                state.locations = action.payload
            })
    }
})

export const { setCurrentStation, clearCurrentStation, clearError } = stationSlice.actions
export default stationSlice.reducer
