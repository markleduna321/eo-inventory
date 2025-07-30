<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StationHistory extends Model
{
    use HasFactory;

    protected $table = 'station_history';

    protected $fillable = [
        'station_id',
        'action_type',
        'asset_type',
        'asset_id',
        'asset_name',
        'asset_serial',
        'unbind_reason',
        'notes',
        'user_id'
    ];

    // Define constants for action types
    const ACTION_CREATE = 'create';
    const ACTION_UPDATE = 'update';
    const ACTION_BIND = 'bind';
    const ACTION_UNBIND = 'unbind';

    // Define constants for unbind reasons
    const REASON_DAMAGED = 'Damaged';
    const REASON_FOR_REPAIR = 'For Repair';
    const REASON_REPLACE_NEW = 'Replace New';

    // Relationships
    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
