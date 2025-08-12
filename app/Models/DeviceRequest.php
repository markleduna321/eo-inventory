<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DeviceRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'requester_id',
        'assignee_id',
        'approver_id',
        'request_type',
        'justification',
        'purpose',
        'requested_from',
        'requested_until',
        'priority',
        'status',
        'approval_notes',
        'rejection_reason',
        'approved_at',
        'rejected_at',
        'completed_at',
        'metadata',
    ];

    protected $casts = [
        'requested_from' => 'date',
        'requested_until' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Relationships
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function liabilityForm(): HasOne
    {
        return $this->hasOne(LiabilityForm::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('requester_id', $userId)
                    ->orWhere('assignee_id', $userId);
    }

    // Helper methods
    public function canBeApproved(): bool
    {
        return $this->status === 'pending';
    }

    public function canBeRejected(): bool
    {
        return $this->status === 'pending';
    }

    public function approve($approverId, $notes = null): bool
    {
        if (!$this->canBeApproved()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approver_id' => $approverId,
            'approval_notes' => $notes,
            'approved_at' => now(),
        ]);

        return true;
    }

    public function reject($approverId, $reason): bool
    {
        if (!$this->canBeRejected()) {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'approver_id' => $approverId,
            'rejection_reason' => $reason,
            'rejected_at' => now(),
        ]);

        return true;
    }

    public function complete(): bool
    {
        if ($this->status !== 'approved') {
            return false;
        }

        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Update device assignment
        if ($this->request_type === 'assignment' && $this->assignee_id) {
            $this->device->update([
                'issued_to' => $this->assignee->name ?? 'Unknown User',
            ]);
        }

        return true;
    }

    // Attributes
    public function getPriorityLabelAttribute(): string
    {
        return match($this->priority) {
            'low' => 'Low',
            'medium' => 'Medium',
            'high' => 'High',
            'urgent' => 'Urgent',
            default => 'Unknown'
        };
    }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending' => 'Pending Approval',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            default => 'Unknown'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'approved' => 'blue',
            'rejected' => 'red',
            'completed' => 'green',
            'cancelled' => 'gray',
            default => 'gray'
        };
    }
}
