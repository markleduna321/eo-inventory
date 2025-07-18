import axios from "axios";
import { setRoles, addRole, updateRole, deleteRole } from "./roles-slice";

// Get all roles
export const get_roles_thunk = () => async (dispatch) => {
    try {
        const response = await axios.get('/api/roles');
        if (response.data.status === 'success') {
            dispatch(setRoles(response.data.data));
            return { status: 200, data: response.data.data };
        }
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error('Error fetching roles:', error);
        return { 
            status: error.response?.status || 500, 
            data: error.response?.data || { message: 'Failed to fetch roles' },
            response: error.response 
        };
    }
};

// Create a new role
export const create_role_thunk = (roleData) => async (dispatch) => {
    try {
        const response = await axios.post('/api/roles', roleData);
        if (response.data.status === 'success') {
            dispatch(addRole(response.data.data));
            return { status: 201, data: response.data.data };
        }
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error('Error creating role:', error);
        return { 
            status: error.response?.status || 500, 
            data: error.response?.data || { message: 'Failed to create role' },
            response: error.response 
        };
    }
};

// Update an existing role
export const update_role_thunk = (roleId, roleData) => async (dispatch) => {
    try {
        const response = await axios.put(`/api/roles/${roleId}`, roleData);
        if (response.data.status === 'success') {
            dispatch(updateRole(response.data.data));
            return { status: 200, data: response.data.data };
        }
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error('Error updating role:', error);
        return { 
            status: error.response?.status || 500, 
            data: error.response?.data || { message: 'Failed to update role' },
            response: error.response 
        };
    }
};

// Delete a role
export const delete_role_thunk = (roleId) => async (dispatch) => {
    try {
        const response = await axios.delete(`/api/roles/${roleId}`);
        if (response.data.status === 'success') {
            dispatch(deleteRole(roleId));
            return { status: 200, data: response.data };
        }
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error('Error deleting role:', error);
        return { 
            status: error.response?.status || 500, 
            data: error.response?.data || { message: 'Failed to delete role' },
            response: error.response 
        };
    }
};
