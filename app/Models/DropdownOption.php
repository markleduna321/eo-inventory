<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DropdownOption extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'value',
        'category',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Get dropdown options by type
     */
    public static function getOptionsByType($type, $category = 'other_assets')
    {
        return self::where('type', $type)
                  ->where('category', $category)
                  ->where('is_active', true)
                  ->orderBy('value')
                  ->pluck('value')
                  ->toArray();
    }

    /**
     * Add a new dropdown option
     */
    public static function addOption($type, $value, $category = 'other_assets')
    {
        return self::firstOrCreate([
            'type' => $type,
            'value' => trim($value),
            'category' => $category
        ], [
            'is_active' => true
        ]);
    }

    /**
     * Check if option exists
     */
    public static function optionExists($type, $value, $category = 'other_assets')
    {
        return self::where('type', $type)
                  ->where('value', trim($value))
                  ->where('category', $category)
                  ->exists();
    }
}
