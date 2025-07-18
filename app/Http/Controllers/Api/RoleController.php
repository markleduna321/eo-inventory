<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $roles = Role::withCount('users')->get();
            
            return response()->json([
                'status' => 'success',
                'data' => $roles,
                'message' => 'Roles retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:roles,name',
                'level' => 'required|integer|min:1|max:5',
                'description' => 'nullable|string',
                'permissions' => 'required|array',
                'permissions.*' => 'string',
                'status' => ['nullable', Rule::in(['Active', 'Inactive'])],
            ]);

            $validated['status'] = $validated['status'] ?? 'Active';
            $validated['is_system'] = false; // Custom roles are never system roles

            $role = Role::create($validated);

            return response()->json([
                'status' => 'success',
                'data' => $role->load('users'),
                'message' => 'Role created successfully'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $role = Role::withCount('users')->findOrFail($id);
            
            return response()->json([
                'status' => 'success',
                'data' => $role,
                'message' => 'Role retrieved successfully'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to retrieve role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $role = Role::findOrFail($id);

            // Prevent updating system roles
            if ($role->is_system) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'System roles cannot be modified'
                ], 403);
            }

            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($id)],
                'level' => 'required|integer|min:1|max:5',
                'description' => 'nullable|string',
                'permissions' => 'required|array',
                'permissions.*' => 'string',
                'status' => ['nullable', Rule::in(['Active', 'Inactive'])],
            ]);

            $role->update($validated);

            return response()->json([
                'status' => 'success',
                'data' => $role->load('users'),
                'message' => 'Role updated successfully'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update role',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $role = Role::findOrFail($id);

            // Prevent deleting system roles
            if ($role->is_system) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'System roles cannot be deleted'
                ], 403);
            }

            // Check if role has users assigned
            if ($role->users()->count() > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Cannot delete role with assigned users'
                ], 400);
            }

            $role->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Role deleted successfully'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete role',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
