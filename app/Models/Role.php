<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'level',
        'description',
        'permissions',
        'is_system',
        'status'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_system' => 'boolean',
    ];

    // Relationship with users
    public function users()
    {
        return $this->hasMany(User::class, 'role_id');
    }

    // Scope for active roles
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    // Scope for system roles
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    // Scope for custom roles
    public function scopeCustom($query)
    {
        return $query->where('is_system', false);
    }
}
