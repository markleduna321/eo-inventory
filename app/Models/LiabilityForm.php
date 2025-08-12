<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiabilityForm extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_request_id',
        'user_id',
        'device_id',
        'employee_name',
        'employee_id',
        'department',
        'position',
        'contact_number',
        'email',
        'device_condition_notes',
        'accessories_received',
        'agrees_to_terms',
        'signature_data',
        'signature_format',
        'signed_at',
        'ip_address',
        'user_agent',
        'terms_agreed',
        'public_token',
        'is_public_form',
        'is_completed',
        'public_token_expires_at',
        'admin_prefilled_data',
        'required_employee_id',
        'accessed_at',
        'completed_at',
    ];

    protected $casts = [
        'accessories_received' => 'array',
        'agrees_to_terms' => 'boolean',
        'signed_at' => 'datetime',
        'terms_agreed' => 'array',
        'is_public_form' => 'boolean',
        'is_completed' => 'boolean',
        'public_token_expires_at' => 'datetime',
        'admin_prefilled_data' => 'array',
        'accessed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function deviceRequest(): BelongsTo
    {
        return $this->belongsTo(DeviceRequest::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    // Helper methods
    public function getSignatureImageUrl(): string
    {
        if (!$this->signature_data) {
            return '';
        }

        // Return base64 data URL
        return "data:image/{$this->signature_format};base64,{$this->signature_data}";
    }

    public function hasValidSignature(): bool
    {
        return !empty($this->signature_data) && $this->agrees_to_terms && $this->signed_at;
    }

    public function generatePublicToken(): string
    {
        $this->public_token = bin2hex(random_bytes(32));
        $this->public_token_expires_at = now()->addDays(7); // Token expires in 7 days
        $this->save();
        
        return $this->public_token;
    }

    public function getPublicUrl(): string
    {
        if (!$this->public_token) {
            return '';
        }
        
        return url("/liability-form/{$this->public_token}");
    }

    public function isTokenValid(): bool
    {
        return $this->public_token && 
               $this->public_token_expires_at && 
               $this->public_token_expires_at->isFuture() &&
               !$this->is_completed;
    }

    public function markAsAccessed(): void
    {
        if (!$this->accessed_at) {
            $this->accessed_at = now();
            $this->save();
        }
    }

    public function markAsCompleted(): void
    {
        $this->is_completed = true;
        $this->completed_at = now();
        $this->save();
    }
}
