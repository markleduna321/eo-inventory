<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Device - {{ $device->brand }} {{ $device->model }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div class="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h1 class="text-2xl font-bold text-white flex items-center">
                    <i class="fas fa-{{ $device->device_type === 'Mobile Phone' ? 'mobile-alt' : ($device->device_type === 'Tablet' ? 'tablet-alt' : 'laptop') }} mr-3"></i>
                    {{ $device->brand }} {{ $device->model }}
                </h1>
                <p class="text-blue-100 mt-1">Serial Number: {{ $device->serial_number }}</p>
            </div>
        </div>

        <!-- Device Information Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Basic Information -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-info-circle mr-2 text-blue-500"></i>
                    Basic Information
                </h2>
                <dl class="space-y-3">
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Device Type:</dt>
                        <dd class="text-sm text-gray-900">{{ $device->device_type }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Brand:</dt>
                        <dd class="text-sm text-gray-900">{{ $device->brand }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Model:</dt>
                        <dd class="text-sm text-gray-900">{{ $device->model }}</dd>
                    </div>
                    @if($device->operating_system)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Operating System:</dt>
                        <dd class="text-sm text-gray-900">{{ $device->operating_system }}</dd>
                    </div>
                    @endif
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Status:</dt>
                        <dd class="text-sm text-gray-900">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                @switch($device->status)
                                    @case('Working') bg-green-100 text-green-800 @break
                                    @case('Defective') bg-red-100 text-red-800 @break
                                    @case('For Repair') bg-yellow-100 text-yellow-800 @break
                                    @default bg-gray-100 text-gray-800
                                @endswitch">
                                {{ $device->status }}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>

            <!-- Assignment & Purchase Information -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-user-tag mr-2 text-green-500"></i>
                    Assignment & Purchase Info
                </h2>
                <dl class="space-y-3">
                    @if($device->issued_to)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Issued To:</dt>
                        <dd class="text-sm text-gray-900">{{ $device->issued_to }}</dd>
                    </div>
                    @endif
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Received By:</dt>
                        <dd class="text-sm text-gray-900">{{ $device->received_by }}</dd>
                    </div>
                    @if($device->price)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Price:</dt>
                        <dd class="text-sm text-gray-900">${{ number_format($device->price, 2) }}</dd>
                    </div>
                    @endif
                    @if($device->purchase_date)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Purchase Date:</dt>
                        <dd class="text-sm text-gray-900">{{ \Carbon\Carbon::parse($device->purchase_date)->format('M d, Y') }}</dd>
                    </div>
                    @endif
                    @if($device->warranty_expiry)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Warranty Expiry:</dt>
                        <dd class="text-sm text-gray-900">{{ \Carbon\Carbon::parse($device->warranty_expiry)->format('M d, Y') }}</dd>
                    </div>
                    @endif
                </dl>
            </div>
        </div>
        
        <!-- Specifications Section -->
        @if($device->specifications)
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-microchip mr-2 text-purple-500"></i>
                Specifications
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @php
                    $specs = is_array($device->specifications) ? $device->specifications : json_decode($device->specifications, true);
                @endphp
                @if(is_array($specs))
                    @foreach($specs as $key => $value)
                        @if(!empty($value))
                        <div class="flex justify-between">
                            <dt class="text-sm font-medium text-gray-500">{{ ucfirst($key) }}:</dt>
                            <dd class="text-sm text-gray-900">{{ $value }}</dd>
                        </div>
                        @endif
                    @endforeach
                @endif
            </div>
        </div>
        @endif

        <!-- QR Code Section -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-qrcode mr-2 text-blue-500"></i>
                QR Code Information
            </h2>
            <div class="flex flex-col md:flex-row items-center justify-between">
                <div class="mb-4 md:mb-0">
                    <p class="text-sm text-gray-600 mb-2">Device QR Code: {{ $device->qr_code }}</p>
                    <p class="text-sm text-gray-600">Scan this QR code for quick access to this device's information.</p>
                </div>
                <div class="flex">
                    <a href="{{ url('/devices/' . $device->id . '/qr-image') }}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center mr-2">
                        <i class="fas fa-eye mr-2"></i> View QR
                    </a>
                    <a href="{{ url('/devices/' . $device->id . '/qr-image?download=1') }}" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
                        <i class="fas fa-download mr-2"></i> Download
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-between">
            <a href="/admin/devices" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
                <i class="fas fa-arrow-left mr-2"></i> Back to Devices
            </a>
        </div>
    </div>
</body>
</html>
