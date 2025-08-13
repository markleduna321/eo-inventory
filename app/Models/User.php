<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'is_online',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * Get the role that owns the user.
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    /**
     * Check if user has a specific permission
     */
    public function hasPermission($permission)
    {
        if (!$this->role) {
            return false;
        }

        // Super Administrator should have access to everything
        if ($this->role->name === 'Super Administrator' || $this->role->level === 5) {
            return true;
        }

        $permissions = $this->role->permissions ?? [];
        return in_array($permission, $permissions);
    }

    /**
     * Check if user has any of the given permissions
     */
    public function hasAnyPermission($permissions)
    {
        if (!$this->role) {
            return false;
        }

        // Super Administrator should have access to everything
        if ($this->role->name === 'Super Administrator' || $this->role->level === 5) {
            return true;
        }

        $userPermissions = $this->role->permissions ?? [];
        return !empty(array_intersect($permissions, $userPermissions));
    }

    /**
     * Check if user has all of the given permissions
     */
    public function hasAllPermissions($permissions)
    {
        if (!$this->role) {
            return false;
        }

        // Super Administrator should have access to everything
        if ($this->role->name === 'Super Administrator' || $this->role->level === 5) {
            return true;
        }

        $userPermissions = $this->role->permissions ?? [];
        return empty(array_diff($permissions, $userPermissions));
    }

    /**
     * Check if user is a Super Administrator
     */
    public function isSuperAdmin()
    {
        return $this->role && ($this->role->name === 'Super Administrator' || $this->role->level === 5);
    }

    /**
     * Get all permissions for the user
     */
    public function getPermissions()
    {
        return $this->role ? $this->role->permissions : [];
    }
}
