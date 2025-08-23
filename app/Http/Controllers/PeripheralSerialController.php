<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PeripheralSerial;
use App\Models\Peripheral;
use Illuminate\Validation\Rule;

class PeripheralSerialController extends Controller
{
    /**
     * Update a specific peripheral serial number.
     */
    public function update(Request $request, PeripheralSerial $peripheralSerial)
    {
        $request->validate([
            'serial_number' => [
                'required',
                'string',
                'max:255',
                Rule::unique('peripheral_serials')
                    ->where('peripheral_id', $peripheralSerial->peripheral_id)
                    ->ignore($peripheralSerial->id)
            ],
            'unit_price' => 'required|numeric|min:0|max:999999.99',
            'notes' => 'nullable|string|max:1000'
        ]);

        $peripheralSerial->update([
            'serial_number' => $request->serial_number,
            'unit_price' => $request->unit_price,
            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Serial number updated successfully',
            'data' => $peripheralSerial->fresh()
        ]);
    }

    /**
     * Delete a specific peripheral serial number.
     */
    public function destroy(PeripheralSerial $peripheralSerial)
    {
        // Check if the serial is deployed
        if ($peripheralSerial->status === 'deployed') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a deployed serial number. Please return it to stock first.'
            ], 422);
        }

        $peripheral = $peripheralSerial->peripheral;
        
        // Delete the serial number
        $peripheralSerial->delete();

        // Update peripheral stock counts
        $this->updatePeripheralStockCounts($peripheral);

        return response()->json([
            'success' => true,
            'message' => 'Serial number deleted successfully'
        ]);
    }

    /**
     * Update peripheral stock counts after serial deletion.
     */
    private function updatePeripheralStockCounts(Peripheral $peripheral)
    {
        // Use the model's recalculate method for better consistency
        $peripheral->recalculateStockFromSerials();
    }
}
