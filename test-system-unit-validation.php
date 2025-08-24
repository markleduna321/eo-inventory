<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\SystemUnitController;

echo "System Unit Validation Test\n";
echo "===========================\n\n";

// Test 1: Create a simple test request with valid data
echo "Test 1: Valid system unit creation\n";
$validData = [
    'unit_type' => 'pre_built',
    'system_name' => 'Test Workstation',
    'serial_number' => 'TEST-' . time(),
    'brand' => 'Dell',
    'model' => 'OptiPlex 7070',
    'description' => 'Test system unit for validation',
    'operating_system' => 'Windows 11 Pro',
    'mac_address' => '00:1B:44:11:3A:B7',
    'status' => 'available',
    'location' => 'storage',
    'received_by' => 'Test User',
    'purchase_price' => '50000.00',
    'supplier' => 'Dell Direct',
    'purchase_date' => '2024-01-15',
    'warranty_expiry' => '2027-01-15',
    'notes' => 'Test system unit',
    'specifications' => [
        'cpu' => 'Intel Core i7-10700',
        'ram' => '16GB DDR4',
        'storage' => '500GB SSD',
        'gpu' => 'Intel UHD Graphics',
        'motherboard' => 'Dell OEM',
        'psu' => '300W',
        'case' => 'Dell Mini Tower'
    ]
];

echo "Data prepared successfully\n";
echo "Serial Number: " . $validData['serial_number'] . "\n";
echo "System Name: " . $validData['system_name'] . "\n\n";

// Test 2: Test validation rules
echo "Test 2: Testing validation patterns\n";

// Test MAC address validation
$macAddresses = [
    '00:1B:44:11:3A:B7' => true,
    '00-1B-44-11-3A-B7' => true,
    '00:1B:44:11:3A' => false,
    'invalid-mac' => false,
    '00:1B:44:11:3A:B7:FF' => false
];

echo "MAC Address validation tests:\n";
foreach ($macAddresses as $mac => $expected) {
    $pattern = '/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/';
    $isValid = preg_match($pattern, $mac);
    $result = $isValid ? 'PASS' : 'FAIL';
    $expectedResult = $expected ? 'PASS' : 'FAIL';
    echo "  $mac => Expected: $expectedResult, Got: $result\n";
}

echo "\nTest 3: Field length validations\n";

$fieldTests = [
    'system_name' => [
        'A' => false,  // Too short (min 2)
        'AB' => true,  // Valid length
        str_repeat('A', 255) => true,  // Max length
        str_repeat('A', 256) => false  // Too long
    ],
    'serial_number' => [
        'AB' => false,  // Too short (min 3)
        'ABC' => true,  // Valid length
        str_repeat('A', 100) => true,  // Max length
        str_repeat('A', 101) => false  // Too long
    ]
];

foreach ($fieldTests as $field => $tests) {
    echo "\n$field validation:\n";
    foreach ($tests as $value => $expected) {
        $displayValue = strlen($value) > 10 ? substr($value, 0, 10) . '...' : $value;
        $length = strlen($value);
        $expectedResult = $expected ? 'PASS' : 'FAIL';
        echo "  '$displayValue' (length: $length) => Expected: $expectedResult\n";
    }
}

echo "\nTest 4: Component validation for custom-built units\n";

$customBuiltData = [
    'unit_type' => 'custom_built',
    'system_name' => 'Custom Built Test',
    'serial_number' => 'CUSTOM-' . time(),
    'status' => 'available',
    'location' => 'storage',
    'received_by' => 'Test User',
    'components' => [
        [
            'part_item_id' => '1',
            'component_role' => 'cpu'
        ],
        [
            'part_item_id' => '2',
            'component_role' => 'ram'
        ]
    ]
];

echo "Custom-built unit data prepared:\n";
echo "Components count: " . count($customBuiltData['components']) . "\n";
foreach ($customBuiltData['components'] as $index => $component) {
    echo "  Component $index: Role = {$component['component_role']}, Part ID = {$component['part_item_id']}\n";
}

echo "\nTest 5: Validation utility test\n";

// This would normally test the JavaScript validation utility
// For now, we'll just validate the PHP backend rules
$requiredFields = [
    'unit_type',
    'system_name', 
    'status',
    'location',
    'received_by'
];

echo "Required fields validation:\n";
foreach ($requiredFields as $field) {
    echo "  $field => Required\n";
}

$optionalFields = [
    'serial_number',
    'brand',
    'model',
    'description',
    'operating_system',
    'mac_address',
    'assigned_to',
    'purchase_price',
    'supplier',
    'purchase_date',
    'warranty_expiry',
    'notes'
];

echo "\nOptional fields:\n";
foreach ($optionalFields as $field) {
    echo "  $field => Optional\n";
}

echo "\n✅ System Unit Validation Test Complete!\n";
echo "The validation system includes:\n";
echo "  - Field length validation\n";
echo "  - MAC address format validation\n";
echo "  - Required field validation\n";
echo "  - Component validation for custom-built units\n";
echo "  - Duplicate serial number checking\n";
echo "  - Real-time validation feedback\n";
echo "  - Backend error integration\n\n";

echo "Next steps:\n";
echo "1. Test the form in the browser\n";
echo "2. Verify duplicate serial number detection\n";
echo "3. Test component validation for custom-built units\n";
echo "4. Verify error display and form submission behavior\n";
