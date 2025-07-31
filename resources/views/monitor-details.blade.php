<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitor - {{ $monitor->brand }} {{ $monitor->model }}</title>
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
                    {{ $monitor->brand }} {{ $monitor->model }}
                </h1>
                <p class="text-blue-100 mt-1">Serial Number: {{ $monitor->serial_number }}</p>
            </div>
        </div>

        <!-- Monitor Information Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Basic Information -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-info-circle mr-2 text-blue-500"></i>
                    Basic Information
                </h2>
                <dl class="space-y-3">
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Brand:</dt>
                        <dd class="text-sm text-gray-900">{{ $monitor->brand }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Model:</dt>
                        <dd class="text-sm text-gray-900">{{ $monitor->model }}</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Size:</dt>
                        <dd class="text-sm text-gray-900">{{ $monitor->size }}"</dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Resolution:</dt>
                        <dd class="text-sm text-gray-900">{{ $monitor->resolution }}</dd>
                    </div>
                    @if($monitor->refresh_rate)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Refresh Rate:</dt>
                        <dd class="text-sm text-gray-900">{{ $monitor->refresh_rate }} Hz</dd>
                    </div>
                    @endif
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Status:</dt>
                        <dd class="text-sm text-gray-900">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                @switch($monitor->status)
                                    @case('working') bg-green-100 text-green-800 @break
                                    @case('not_working') bg-red-100 text-red-800 @break
                                    @case('under_repair') bg-yellow-100 text-yellow-800 @break
                                    @case('retired') bg-red-100 text-red-800 @break
                                    @default bg-gray-100 text-gray-800
                                @endswitch">
                                {{ ucfirst(str_replace('_', ' ', $monitor->status)) }}
                            </span>
                        </dd>
                    </div>
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Location:</dt>
                        <dd class="text-sm text-gray-900">{{ ucfirst(str_replace('_', ' ', $monitor->location)) }}</dd>
                    </div>
                </dl>
            </div>

            <!-- Deployment Information -->
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <i class="fas fa-user-tag mr-2 text-green-500"></i>
                    Deployment & Receipt Info
                </h2>
                <dl class="space-y-3">
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Deployment Status:</dt>
                        <dd class="text-sm text-gray-900">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                @switch($monitor->deployment_status)
                                    @case('Deployed') bg-blue-100 text-blue-800 @break
                                    @case('Available') bg-green-100 text-green-800 @break
                                    @case('Out of Service') bg-red-100 text-red-800 @break
                                    @case('Retired') bg-gray-100 text-gray-800 @break
                                    @default bg-gray-100 text-gray-800
                                @endswitch">
                                {{ $monitor->deployment_status }}
                            </span>
                        </dd>
                    </div>
                    @if($monitor->is_deployed && $monitor->station)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Deployed to:</dt>
                        <dd class="text-sm text-gray-900">{{ $monitor->station->name }}</dd>
                    </div>
                    @if($monitor->station->assigned_user)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">User:</dt>
                        <dd class="text-sm text-gray-900">{{ $monitor->station->assigned_user }}</dd>
                    </div>
                    @endif
                    @if($monitor->station->location_name)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Station Location:</dt>
                        <dd class="text-sm text-gray-900">{{ $monitor->station->location_name }}</dd>
                    </div>
                    @endif
                    @if($monitor->stationAssignment && $monitor->stationAssignment->assigned_at)
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Assigned on:</dt>
                        <dd class="text-sm text-gray-900">{{ date('M d, Y', strtotime($monitor->stationAssignment->assigned_at)) }}</dd>
                    </div>
                    @endif
                    @endif
                    <div class="flex justify-between">
                        <dt class="text-sm font-medium text-gray-500">Received By:</dt>
                        <dd class="text-sm text-gray-900">{{ $monitor->received_by }}</dd>
                    </div>
                    @if($monitor->notes)
                    <div class="pt-2 border-t border-gray-200">
                        <dt class="text-sm font-medium text-gray-500 mb-1">Notes:</dt>
                        <dd class="text-sm text-gray-900 italic">{{ $monitor->notes }}</dd>
                    </div>
                    @endif
                </dl>
            </div>
        </div>

        <!-- QR Code Section -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-qrcode mr-2 text-blue-500"></i>
                QR Code Information
            </h2>
            <div class="flex flex-col md:flex-row items-center justify-between">
                <div class="mb-4 md:mb-0">
                    <p class="text-sm text-gray-600 mb-2">Monitor QR Code: {{ $monitor->qr_code }}</p>
                    <p class="text-sm text-gray-600">Scan this QR code for quick access to this monitor's information.</p>
                </div>
                <div class="flex">
                    <a href="{{ url('/monitors/' . $monitor->id . '/qr-image') }}" target="_blank" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center mr-2">
                        <i class="fas fa-eye mr-2"></i> View QR
                    </a>
                    <a href="{{ url('/monitors/' . $monitor->id . '/qr-image?download=1') }}" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
                        <i class="fas fa-download mr-2"></i> Download
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex justify-between">
            <a href="/admin/monitor" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm flex items-center">
                <i class="fas fa-arrow-left mr-2"></i> Back to Monitors
            </a>
            
            @if($monitor->is_deployed && $monitor->station)
            <a href="/admin/stations#station-{{ $monitor->station->id }}" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
                <i class="fas fa-desktop mr-2"></i> View Station
            </a>
            @endif
        </div>
    </div>
</body>
</html>
