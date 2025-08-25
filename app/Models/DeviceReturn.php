<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceReturn extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'returner_name',
        'previous_assignee',
        'return_reason',
        'return_notes',
        'condition_check',
        'received_by',
        'has_issues',
        'issues_description',
        'new_status',
        'repair_cost',
        'approved_by_supervisor',
        'supervisor_name',
        'supervisor_notes',
        'returned_at',
    ];

    protected $casts = [
        'condition_check' => 'array',
        'returned_at' => 'datetime',
        'has_issues' => 'boolean',
        'approved_by_supervisor' => 'boolean',
        'repair_cost' => 'decimal:2',
    ];

    // Relationships
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    // Accessors & Mutators
    public function getReturnReasonLabelAttribute(): string
    {
        return match($this->return_reason) {
            'resignation' => 'Employee Resignation',
            'termination' => 'Employee Termination',
            'replacement' => 'Device Replacement',
            'upgrade' => 'Device Upgrade',
            'repair' => 'Repair Required',
            'end_of_assignment' => 'End of Assignment',
            'transfer' => 'Department Transfer',
            'other' => 'Other',
            default => 'Unknown'
        };
    }

    public function getNewStatusLabelAttribute(): string
    {
        return match($this->new_status) {
            'working' => 'Working',
            'needs_repair' => 'Needs Repair',
            'damaged' => 'Damaged',
            'disposed' => 'Disposed',
            'available' => 'Available',
            default => 'Unknown'
        };
    }

    public function getConditionSummaryAttribute(): string
    {
        if (!$this->condition_check || !is_array($this->condition_check)) {
            return 'No condition check performed';
        }

        $total = count($this->condition_check);
        $good = collect($this->condition_check)->filter(fn($item) => $item['status'] === 'good')->count();
        $issues = $total - $good;

        if ($issues === 0) {
            return 'Excellent condition - all checks passed';
        } elseif ($issues <= 2) {
            return "Good condition - {$issues} minor issue(s)";
        } else {
            return "Poor condition - {$issues} issue(s) found";
        }
    }

    // Scopes
    public function scopeByReturnReason($query, $reason)
    {
        return $query->where('return_reason', $reason);
    }

    public function scopeNeedsApproval($query)
    {
        return $query->where('approved_by_supervisor', false);
    }

    public function scopeWithIssues($query)
    {
        return $query->where('has_issues', true);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('new_status', $status);
    }
}
