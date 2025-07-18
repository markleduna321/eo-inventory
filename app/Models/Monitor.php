<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Monitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'serial_number',
        'brand',
        'model',
        'size',
        'resolution',
        'refresh_rate',
        'status',
        'location',
        'received_by',
        'notes',
    ];

    protected $casts = [
        'refresh_rate' => 'integer',
    ];
}
