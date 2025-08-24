<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SystemUnitAuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'system_unit_id',
        'event_type',
        'field_name',
        'old_value',
        'new_value',
        'user_name',
        'user_id',
        'description',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the system unit that this audit log belongs to.
     */
    public function systemUnit(): BelongsTo
    {
        return $this->belongsTo(SystemUnit::class);
    }

    /**
     * Get the user who made this change (if user_id is available).
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create an audit log entry for a status change.
     */
    public static function logStatusChange(
        SystemUnit $systemUnit,
        string $oldStatus,
        string $newStatus,
        string $userName,
        ?int $userId = null,
        ?string $reason = null
    ): self {
        return self::create([
            'system_unit_id' => $systemUnit->id,
            'event_type' => 'status_change',
            'field_name' => 'status',
            'old_value' => $oldStatus,
            'new_value' => $newStatus,
            'user_name' => $userName,
            'user_id' => $userId,
            'description' => "Status changed from '{$oldStatus}' to '{$newStatus}'",
            'metadata' => [
                'reason' => $reason,
                'serial_number' => $systemUnit->serial_number,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Create an audit log entry for field updates.
     */
    public static function logFieldUpdate(
        SystemUnit $systemUnit,
        string $fieldName,
        $oldValue,
        $newValue,
        string $userName,
        ?int $userId = null
    ): self {
        return self::create([
            'system_unit_id' => $systemUnit->id,
            'event_type' => 'field_update',
            'field_name' => $fieldName,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'user_name' => $userName,
            'user_id' => $userId,
            'description' => "Updated {$fieldName} from '{$oldValue}' to '{$newValue}'",
            'metadata' => [
                'serial_number' => $systemUnit->serial_number,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Create an audit log entry for system unit creation.
     */
    public static function logCreation(
        SystemUnit $systemUnit,
        string $userName,
        ?int $userId = null
    ): self {
        return self::create([
            'system_unit_id' => $systemUnit->id,
            'event_type' => 'creation',
            'field_name' => null,
            'old_value' => null,
            'new_value' => null,
            'user_name' => $userName,
            'user_id' => $userId,
            'description' => "System unit '{$systemUnit->serial_number}' was created",
            'metadata' => [
                'serial_number' => $systemUnit->serial_number,
                'unit_type' => $systemUnit->unit_type,
                'model' => $systemUnit->model,
                'manufacturer' => $systemUnit->manufacturer,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
