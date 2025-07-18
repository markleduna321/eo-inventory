import { configureStore } from '@reduxjs/toolkit';
import usersSlice from '../pages/admin/user_management/_redux/user-management-slice';
import rolesSlice from '../pages/admin/user_management/_redux/roles-slice';
import devicesSlice from '../pages/admin/devices/_redux/devices-slice';
import monitorsSlice from '../redux/slices/monitorSlice';

const store = configureStore({
    reducer: {
        users: usersSlice,
        roles: rolesSlice,
        devices: devicesSlice,
        monitors: monitorsSlice,
    },
});

export const RootState = store.getState;
export const AppDispatch = store.dispatch;

export default store;
