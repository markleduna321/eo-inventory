import { createSlice } from '@reduxjs/toolkit'

export const rolesSlice = createSlice({
  name: 'roles',
  initialState: {
    roles: [],
    selectedRole: null,
    loading: false,
    error: null,
  },
  reducers: {
    setRoles: (state, action) => {
      state.roles = action.payload;
      state.loading = false;
      state.error = null;
    },
    addRole: (state, action) => {
      state.roles.push(action.payload);
    },
    updateRole: (state, action) => {
      const index = state.roles.findIndex(role => role.id === action.payload.id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
    },
    deleteRole: (state, action) => {
      state.roles = state.roles.filter(role => role.id !== action.payload);
    },
    setSelectedRole: (state, action) => {
      state.selectedRole = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { 
  setRoles,
  addRole,
  updateRole,
  deleteRole,
  setSelectedRole,
  setLoading,
  setError
} = rolesSlice.actions

export default rolesSlice.reducer
