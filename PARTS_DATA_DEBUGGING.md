# Parts Data Debugging Guide

This document provides guidance for debugging and fixing issues with the parts inventory data display in the UI.

## Common Issues and Solutions

### Issue: Parts saved in database not showing in UI

#### Diagnostic Steps:

1. **Check Redux State**
   - Use the "Debug Redux" button in the UI to see the current state
   - Look for `parts` object in the Redux state
   - Verify that `parts.parts` is an array with data

2. **Check Network Requests**
   - Open browser dev tools (F12)
   - Go to Network tab
   - Check for API requests to fetch parts data
   - Verify responses contain the expected data

3. **Try Loading Test Data**
   - Click the "Load Test Data" button in the UI
   - This bypasses API calls and directly populates Redux with test data
   - If this works but regular loading doesn't, the issue is in the API or data fetching

### Redux Structure Expectations

The Redux state should have this structure:

```js
{
  parts: {
    parts: [
      {
        id: 1,
        type: 'cpu',
        brand: 'Intel',
        model: 'i7-9700K',
        current_stock: 10,
        location: 'storage',
        unit_price: 299.99
        // other fields...
      },
      // more parts...
    ],
    deliveryHistory: [
      // delivery records...
    ],
    loading: false,
    error: null
  }
}
```

### Debugging Tools

Several debugging tools have been added to help diagnose issues:

1. **Parts Table Debug Panel**
   - Shows current Redux state information
   - Displays data source and counts
   - Accessible via the "Show Debugger" button

2. **Redux Debugger**
   - Floating debug panel (click "Debug Redux" button)
   - Shows full Redux state tree
   - Can dispatch test actions

3. **Console Logging**
   - Enhanced logging for Redux actions
   - Check browser console for detailed logs

### Redux Fixing Utilities

We've added utilities to automatically fix common Redux state issues:

- `resources/js/app/store/redux-fixer.js`
- `resources/js/app/store/reducers/parts-reducer.js`
- `resources/js/app/store/actions/parts-actions.js`

These provide defensive programming patterns to ensure the Redux state is always valid.

### Manual Testing Steps

1. Load the parts inventory page
2. Check initial state in debug panel
3. Click "Load Test Data" button
4. Verify data appears in the table
5. Check filter and sort functionality
6. Try CRUD operations (if implemented)

## Developer Notes

- The component was updated with defensive programming to handle potentially undefined Redux state
- Mock data loading was added for testing
- Debug info and logging were enhanced
- Redux structure fixing utilities were created

If data is still not appearing correctly:
1. Check Redux actions and reducers
2. Verify API endpoint configuration
3. Review backend data structure
4. Check for missing database migration or seeder issues
