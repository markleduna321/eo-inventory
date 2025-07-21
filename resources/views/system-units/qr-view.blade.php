<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Unit - {{ $systemUnit->system_name }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div class="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                <h1 class="text-2xl font-bold text-white flex items-center">
                    <i class="fas fa-desktop mr-3"></i>
                    {{ $systemUnit->system_name }}
                </h1>
                <p class="text-blue-100 mt-1">Serial Number: {{ $systemUnit->serial_number }}</p>
            </div>
        </div>

        <!-- System Information Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Basic Information -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-info-circle mr-2 text-blue-500"></i>
                    Basic Information
                </h2>
                <dl class="space-y-3">
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Type:</dt>
                        <dd class="text-sm text-gray-900">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                {{ $systemUnit->unit_type === 'pre_built' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800' }}">
                                {{ $systemUnit->unit_type === 'pre_built' ? 'Pre-built' : 'Custom-built' }}
                            </span>
                        </dd>
                    </div>
                    @if($systemUnit->brand)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Brand:</dt>
                        <dd class="text-sm text-gray-900">{{ $systemUnit->brand }}</dd>
                    </div>
                    @endif
                    @if($systemUnit->model)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Model:</dt>
                        <dd class="text-sm text-gray-900">{{ $systemUnit->model }}</dd>
                    </div>
                    @endif
                    @if($systemUnit->operating_system)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Operating System:</dt>
                        <dd class="text-sm text-gray-900">{{ $systemUnit->operating_system }}</dd>
                    </div>
                    @endif
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Status:</dt>
                        <dd class="text-sm text-gray-900">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                @switch($systemUnit->status)
                                    @case('available') bg-green-100 text-green-800 @break
                                    @case('assigned') bg-orange-100 text-orange-800 @break
                                    @case('maintenance') bg-yellow-100 text-yellow-800 @break
                                    @case('retired') bg-red-100 text-red-800 @break
                                    @default bg-gray-100 text-gray-800
                                @endswitch">
                                {{ ucfirst($systemUnit->status) }}
                            </span>
                        </dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Location:</dt>
                        <dd class="text-sm text-gray-900">{{ $systemUnit->location }}</dd>
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
                    @if($systemUnit->assigned_to)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Assigned To:</dt>
                        <dd class="text-sm text-gray-900">{{ $systemUnit->assigned_to }}</dd>
                    </div>
                    @endif
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Received By:</dt>
                        <dd class="text-sm text-gray-900">{{ $systemUnit->received_by }}</dd>
                    </div>
                    @if($systemUnit->supplier)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Supplier:</dt>
                        <dd class="text-sm text-gray-900">{{ $systemUnit->supplier }}</dd>
                    </div>
                    @endif
                    @if($systemUnit->purchase_price)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Purchase Price:</dt>
                        <dd class="text-sm text-gray-900">${{ number_format($systemUnit->purchase_price, 2) }}</dd>
                    </div>
                    @endif
                    @if($systemUnit->purchase_date)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Purchase Date:</dt>
                        <dd class="text-sm text-gray-900">{{ $systemUnit->purchase_date->format('M d, Y') }}</dd>
                    </div>
                    @endif
                    @if($systemUnit->warranty_expiry)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Warranty Expiry:</dt>
                        <dd class="text-sm text-gray-900 {{ $systemUnit->warranty_expiry->isPast() ? 'text-red-600' : 'text-green-600' }}">
                            {{ $systemUnit->warranty_expiry->format('M d, Y') }}
                        </dd>
                    </div>
                    @endif
                </dl>
            </div>
        </div>

        <!-- Specifications/Components -->
        @if($systemUnit->formatted_specifications)
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-microchip mr-2 text-purple-500"></i>
                {{ $systemUnit->unit_type === 'pre_built' ? 'Specifications' : 'Components' }}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @foreach($systemUnit->formatted_specifications as $component => $spec)
                <div class="border border-gray-200 rounded-lg p-3">
                    <h3 class="font-medium text-gray-900 text-sm mb-1">{{ ucfirst(str_replace('_', ' ', $component)) }}</h3>
                    <p class="text-sm text-gray-600">{{ $spec }}</p>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Description & Notes -->
        @if($systemUnit->description || $systemUnit->notes)
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-sticky-note mr-2 text-yellow-500"></i>
                Additional Information
            </h2>
            @if($systemUnit->description)
            <div class="mb-4">
                <h3 class="font-medium text-gray-900 text-sm mb-2">Description</h3>
                <p class="text-sm text-gray-600">{{ $systemUnit->description }}</p>
            </div>
            @endif
            @if($systemUnit->notes)
            <div>
                <h3 class="font-medium text-gray-900 text-sm mb-2">Notes</h3>
                <p class="text-sm text-gray-600">{{ $systemUnit->notes }}</p>
            </div>
            @endif
        </div>
        @endif

        <!-- Footer -->
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="text-center">
                <p class="text-sm text-gray-500 mb-2">Scanned at {{ now()->format('M d, Y H:i:s') }}</p>
                <p class="text-xs text-gray-400">QR Code: {{ $systemUnit->qr_code }}</p>
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh every 30 seconds to get latest data
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
