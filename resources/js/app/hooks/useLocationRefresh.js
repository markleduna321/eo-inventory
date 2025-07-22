import { useDispatch } from 'react-redux'
import { fetchLocations } from '@/app/redux/thunks/locationThunk'

/**
 * Custom hook to provide location refresh functionality
 * This can be used across different components that need to update location data
 */
export const useLocationRefresh = () => {
    const dispatch = useDispatch()

    const refreshLocations = () => {
        dispatch(fetchLocations())
    }

    return { refreshLocations }
}
