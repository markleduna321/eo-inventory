<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'part_id',
        'transaction_type', // add_stock, remove_stock, assign, return, etc.
        'quantity',
        'user_id', // who performed the action
        'system_unit_id', // if assigned to a system unit
        'notes',
        'reference_id', // could reference a delivery ID or part item ID
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the part associated with this transaction.
     */
    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    /**
     * Get the user who performed this transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the system unit associated with this transaction, if any.
     */
    public function systemUnit()
    {
        return $this->belongsTo(SystemUnit::class);
    }
}