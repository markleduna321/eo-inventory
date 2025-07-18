import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunks for API calls
export const fetchPeripherals = createAsyncThunk(
    'peripheral/fetchPeripherals',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/peripherals')
            if (!response.ok) {
                throw new Error('Failed to fetch peripherals')
            }
            return await response.json()
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const createPeripheral = createAsyncThunk(
    'peripheral/createPeripheral',
    async (peripheralData, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/peripherals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(peripheralData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create peripheral')
            }

            return await response.json()
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const updatePeripheral = createAsyncThunk(
    'peripheral/updatePeripheral',
    async ({ id, peripheralData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/peripherals/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(peripheralData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update peripheral')
            }

            return await response.json()
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const deletePeripheral = createAsyncThunk(
    'peripheral/deletePeripheral',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/peripherals/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            })

            if (!response.ok) {
                throw new Error('Failed to delete peripheral')
            }

            return id
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const addStock = createAsyncThunk(
    'peripheral/addStock',
    async ({ id, stockData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/peripherals/${id}/add-stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(stockData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to add stock')
            }

            return await response.json()
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const deployStock = createAsyncThunk(
    'peripheral/deployStock',
    async ({ id, deployData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/peripherals/${id}/deploy-stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(deployData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to deploy stock')
            }

            return { id, message: await response.json() }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const returnStock = createAsyncThunk(
    'peripheral/returnStock',
    async ({ id, returnData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/peripherals/${id}/return-stock`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(returnData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to return stock')
            }

            return { id, message: await response.json() }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const markDamaged = createAsyncThunk(
    'peripheral/markDamaged',
    async ({ id, damageData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/peripherals/${id}/mark-damaged`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(damageData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to mark as damaged')
            }

            return { id, message: await response.json() }
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const fetchDeliveryHistory = createAsyncThunk(
    'peripheral/fetchDeliveryHistory',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/peripherals/${id}/delivery-history`)
            if (!response.ok) {
                throw new Error('Failed to fetch delivery history')
            }
            return await response.json()
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const fetchStations = createAsyncThunk(
    'peripheral/fetchStations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/stations')
            if (!response.ok) {
                throw new Error('Failed to fetch stations')
            }
            return await response.json()
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

const peripheralSlice = createSlice({
    name: 'peripheral',
    initialState: {
        peripherals: [],
        stations: [],
        deliveryHistory: [],
        loading: false,
        error: null,
        successMessage: null
    },
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearSuccessMessage: (state) => {
            state.successMessage = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch peripherals
            .addCase(fetchPeripherals.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPeripherals.fulfilled, (state, action) => {
                state.loading = false
                state.peripherals = action.payload
            })
            .addCase(fetchPeripherals.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Create peripheral
            .addCase(createPeripheral.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createPeripheral.fulfilled, (state, action) => {
                state.loading = false
                state.peripherals.unshift(action.payload)
                state.successMessage = 'Peripheral created successfully'
            })
            .addCase(createPeripheral.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Update peripheral
            .addCase(updatePeripheral.fulfilled, (state, action) => {
                const index = state.peripherals.findIndex(p => p.id === action.payload.id)
                if (index !== -1) {
                    state.peripherals[index] = action.payload
                }
                state.successMessage = 'Peripheral updated successfully'
            })

            // Delete peripheral
            .addCase(deletePeripheral.fulfilled, (state, action) => {
                state.peripherals = state.peripherals.filter(p => p.id !== action.payload)
                state.successMessage = 'Peripheral deleted successfully'
            })

            // Add stock
            .addCase(addStock.fulfilled, (state, action) => {
                const index = state.peripherals.findIndex(p => p.id === action.payload.id)
                if (index !== -1) {
                    state.peripherals[index] = action.payload
                }
                state.successMessage = 'Stock added successfully'
            })

            // Stock operations (deploy, return, mark damaged)
            .addCase(deployStock.fulfilled, (state, action) => {
                state.successMessage = 'Stock deployed successfully'
            })
            .addCase(returnStock.fulfilled, (state, action) => {
                state.successMessage = 'Stock returned successfully'
            })
            .addCase(markDamaged.fulfilled, (state, action) => {
                state.successMessage = 'Stock marked as damaged'
            })

            // Delivery history
            .addCase(fetchDeliveryHistory.fulfilled, (state, action) => {
                state.deliveryHistory = action.payload
            })

            // Fetch stations
            .addCase(fetchStations.fulfilled, (state, action) => {
                state.stations = action.payload
            })
    }
})

export const { clearError, clearSuccessMessage } = peripheralSlice.actions
export default peripheralSlice.reducer
