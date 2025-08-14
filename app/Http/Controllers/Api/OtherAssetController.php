<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OtherAsset;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OtherAssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = OtherAsset::with(['location', 'assignedUser', 'creator']);

        // Apply filters
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('asset_type', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('model', 'LIKE', "%{$search}%")
                  ->orWhere('serial_number', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('asset_type') && $request->asset_type) {
            $query->where('asset_type', $request->asset_type);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('location_id') && $request->location_id) {
            $query->where('location_id', $request->location_id);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $assets = $query->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'data' => $assets,
            'message' => 'Other assets retrieved successfully'
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'asset_type' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:other_assets,serial_number',
            'description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'condition_status' => 'required|string|in:New,Excellent,Good,Fair,Poor,Damaged,Under Repair',
            'location_id' => 'nullable|exists:locations,id',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'warranty_expiry' => 'nullable|date|after:purchase_date',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'required|string|in:Active,Inactive,Retired,Lost,Stolen,Under Maintenance',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['created_by'] = Auth::id();
        $data['qr_code'] = $this->generateQrCode();

        $asset = OtherAsset::create($data);
        $asset->load(['location', 'assignedUser', 'creator']);

        return response()->json([
            'status' => 'success',
            'data' => $asset,
            'message' => 'Other asset created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $asset = OtherAsset::with(['location', 'assignedUser', 'creator', 'updater'])->find($id);

        if (!$asset) {
            return response()->json([
                'status' => 'error',
                'message' => 'Other asset not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $asset,
            'message' => 'Other asset retrieved successfully'
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $asset = OtherAsset::find($id);

        if (!$asset) {
            return response()->json([
                'status' => 'error',
                'message' => 'Other asset not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'asset_type' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255|unique:other_assets,serial_number,' . $id,
            'description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'condition_status' => 'required|string|in:New,Excellent,Good,Fair,Poor,Damaged,Under Repair',
            'location_id' => 'nullable|exists:locations,id',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'warranty_expiry' => 'nullable|date|after:purchase_date',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'required|string|in:Active,Inactive,Retired,Lost,Stolen,Under Maintenance',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['updated_by'] = Auth::id();

        $asset->update($data);
        $asset->load(['location', 'assignedUser', 'creator', 'updater']);

        return response()->json([
            'status' => 'success',
            'data' => $asset,
            'message' => 'Other asset updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $asset = OtherAsset::find($id);

        if (!$asset) {
            return response()->json([
                'status' => 'error',
                'message' => 'Other asset not found'
            ], 404);
        }

        $asset->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Other asset deleted successfully'
        ]);
    }

    /**
     * Get dropdown options for form
     */
    public function getDropdownOptions()
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'asset_types' => OtherAsset::getAssetTypes(),
                'brands' => OtherAsset::getBrands(),
                'models' => OtherAsset::getModels(),
                'condition_statuses' => OtherAsset::getConditionStatuses(),
                'status_options' => OtherAsset::getStatusOptions(),
                'locations' => Location::where('status', 'Active')->select('id', 'name')->get(),
                'users' => User::select('id', 'name')->get()
            ]
        ]);
    }

    /**
     * Add new option to dropdown
     */
    public function addDropdownOption(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:asset_type,brand,model',
            'value' => 'required|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $type = $request->type;
        $value = trim($request->value);

        // Check if value already exists in dropdown options
        $exists = \App\Models\DropdownOption::optionExists($type, $value);
        
        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => ucfirst(str_replace('_', ' ', $type)) . ' "' . $value . '" already exists'
            ], 409);
        }

        // Add new dropdown option to the database
        \App\Models\DropdownOption::addOption($type, $value);

        return response()->json([
            'status' => 'success',
            'data' => ['value' => $value],
            'message' => ucfirst(str_replace('_', ' ', $type)) . ' option added successfully'
        ]);
    }

    /**
     * Generate unique QR code
     */
    private function generateQrCode()
    {
        do {
            $qrCode = 'OA-' . strtoupper(Str::random(8));
        } while (OtherAsset::where('qr_code', $qrCode)->exists());

        return $qrCode;
    }
}
