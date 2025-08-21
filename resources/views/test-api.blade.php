<!DOCTYPE html>
<html>
<head>
    <title>API Test</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    <h1>Testing Peripheral APIs</h1>
    <div id="results"></div>
    
    <script>
        async function testAPIs() {
            const results = document.getElementById('results');
            results.innerHTML = '<p>Testing APIs...</p>';
            
            try {
                // Test 1: Get available peripherals
                console.log('Testing /api/stations/available-peripherals');
                const response1 = await fetch('/api/stations/available-peripherals', {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                
                const data1 = await response1.json();
                console.log('Available peripherals response:', data1);
                
                results.innerHTML += '<h2>Available Peripherals</h2>';
                results.innerHTML += '<pre>' + JSON.stringify(data1, null, 2) + '</pre>';
                
                // Test 2: Try to assign a peripheral (if any are available)
                if (data1.grouped && Object.keys(data1.grouped).length > 0) {
                    const firstType = Object.keys(data1.grouped)[0];
                    const firstBrandModel = Object.keys(data1.grouped[firstType])[0];
                    const firstPeripheral = data1.grouped[firstType][firstBrandModel];
                    
                    console.log('Testing assignment of peripheral:', firstPeripheral);
                    
                    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                    
                    const response2 = await fetch('/api/stations/19/assign-peripherals', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken
                        },
                        body: JSON.stringify({
                            peripheral_ids: [firstPeripheral.id]
                        })
                    });
                    
                    const data2 = await response2.json();
                    console.log('Assignment response:', data2);
                    
                    results.innerHTML += '<h2>Assignment Test</h2>';
                    results.innerHTML += '<p>Tried to assign peripheral ID: ' + firstPeripheral.id + '</p>';
                    results.innerHTML += '<pre>' + JSON.stringify(data2, null, 2) + '</pre>';
                } else {
                    results.innerHTML += '<h2>Assignment Test</h2>';
                    results.innerHTML += '<p>No peripherals available to test assignment</p>';
                }
                
            } catch (error) {
                console.error('Error:', error);
                results.innerHTML += '<h2>Error</h2>';
                results.innerHTML += '<p>' + error.message + '</p>';
            }
        }
        
        // Run tests when page loads
        testAPIs();
    </script>
</body>
</html>
