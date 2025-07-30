<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Station - {{ $station->name }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div class="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4">
                <h1 class="text-2xl font-bold text-white flex items-center">
                    <i class="fas fa-desktop mr-3"></i>
                    {{ $station->name }}
                </h1>
                <p class="text-green-100 mt-1">Station Code: {{ $station->code }}</p>
            </div>
        </div>

        <!-- Station Information Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Basic Information -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-info-circle mr-2 text-green-500"></i>
                    Station Information
                </h2>
                <dl class="space-y-3">
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Type:</dt>
                        <dd class="text-sm text-gray-900">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {{ ucfirst(str_replace('_', ' ', $station->type)) }}
                            </span>
                        </dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Department:</dt>
                        <dd class="text-sm text-gray-900">{{ $station->department }}</dd>
                    </div>
                    @if($station->assigned_user)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Assigned User:</dt>
                        <dd class="text-sm text-gray-900">{{ $station->assigned_user }}</dd>
                    </div>
                    @endif
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Location:</dt>
                        <dd class="text-sm text-gray-900">{{ $station->location->name ?? 'N/A' }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Status:</dt>
                        <dd class="text-sm text-gray-900">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                {{ $station->status === 'active' ? 'bg-green-100 text-green-800' : 
                                   ($station->status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800') }}">
                                {{ ucfirst($station->status) }}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>

            <!-- Assets Summary -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-cube mr-2 text-green-500"></i>
                    Assets Summary
                </h2>
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">
                            {{ $station->stationAssets->where('asset_type', 'monitor')->whereNull('unassigned_at')->count() }}
                        </div>
                        <div class="text-xs text-gray-500">Monitors</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">
                            {{ $station->stationAssets->where('asset_type', 'system_unit')->whereNull('unassigned_at')->count() }}
                        </div>
                        <div class="text-xs text-gray-500">System Units</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-orange-600">
                            {{ $station->stationAssets->where('asset_type', 'peripheral')->whereNull('unassigned_at')->count() }}
                        </div>
                        <div class="text-xs text-gray-500">Peripherals</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Assigned Assets -->
        @php
            $monitors = $station->stationAssets->where('asset_type', 'monitor')->whereNull('unassigned_at')->pluck('monitor')->filter();
            $systemUnits = $station->stationAssets->where('asset_type', 'system_unit')->whereNull('unassigned_at')->pluck('systemUnit')->filter();
            $peripherals = $station->stationAssets->where('asset_type', 'peripheral')->whereNull('unassigned_at')->pluck('peripheral')->filter();
        @endphp

        <!-- Monitors -->
        @if($monitors->count() > 0)
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-tv mr-2 text-blue-500"></i>
                Assigned Monitors ({{ $monitors->count() }})
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @foreach($monitors as $monitor)
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-medium text-gray-900">{{ $monitor->brand }} {{ $monitor->model }}</h3>
                            <p class="text-sm text-gray-500">{{ $monitor->screen_size }}</p>
                            <p class="text-sm text-gray-600">S/N: {{ $monitor->serial_number }}</p>
                        </div>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {{ $monitor->status }}
                        </span>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- System Units -->
        @if($systemUnits->count() > 0)
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-desktop mr-2 text-purple-500"></i>
                Assigned System Units ({{ $systemUnits->count() }})
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @foreach($systemUnits as $systemUnit)
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-medium text-gray-900">{{ $systemUnit->system_name }}</h3>
                            <p class="text-sm text-gray-500">{{ $systemUnit->brand }} {{ $systemUnit->model }}</p>
                            <p class="text-sm text-gray-600">S/N: {{ $systemUnit->serial_number }}</p>
                        </div>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {{ $systemUnit->status }}
                        </span>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        <!-- Peripherals -->
        @if($peripherals->count() > 0)
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-mouse mr-2 text-orange-500"></i>
                Assigned Peripherals ({{ $peripherals->count() }})
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @foreach($peripherals as $peripheral)
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-medium text-gray-900">{{ $peripheral->brand }} {{ $peripheral->model }}</h3>
                            <div class="flex items-center mt-1">
                                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mr-2">
                                    {{ ucfirst($peripheral->type ?? $peripheral->device_type) }}
                                </span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">S/N: {{ $peripheral->serial_number }}</p>
                        </div>
                        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            {{ $peripheral->status }}
                        </span>
                    </div>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        @if($station->description)
        <!-- Description -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-sticky-note mr-2 text-green-500"></i>
                Description
            </h2>
            <p class="text-gray-700">{{ $station->description }}</p>
        </div>
        @endif

        <!-- Footer -->
        <div class="text-center text-gray-500 text-sm">
            <p>Generated on {{ now()->format('M j, Y \a\t g:i A') }}</p>
            <p class="mt-1">EO Inventory Management System</p>
        </div>
    </div>
</body>
</html>
