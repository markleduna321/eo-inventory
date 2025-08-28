<?php

use App\Services\InventoryDataContextService;
use App\Services\OpenAIService;
use Illuminate\Http\Request;

Route::get('/test-ai-specs', function () {
    try {
        echo "<h1>Testing Enhanced AI with Asset Specifications</h1>";
        
        $dataService = new InventoryDataContextService();
        $openAIService = new OpenAIService();

        // Get enhanced data with specifications
        $inventoryData = $dataService->getComprehensiveSystemData();
        
        echo "<h2>Data Structure Overview:</h2>";
        echo "<p>Total Assets: " . ($inventoryData['summary']['total_assets'] ?? 'Unknown') . "</p>";
        echo "<p>Total Value: $" . number_format($inventoryData['summary']['total_value'] ?? 0, 2) . "</p>";
        
        // Check if specification data is included
        echo "<h2>Specifications Data Check:</h2>";
        
        if (isset($inventoryData['system_units']['specifications'])) {
            echo "<p>✓ SystemUnit specifications found</p>";
            $specCount = count($inventoryData['system_units']['specifications']);
            echo "<p>  - Specification types: $specCount</p>";
        } else {
            echo "<p>✗ SystemUnit specifications missing</p>";
        }
        
        if (isset($inventoryData['monitors']['specifications'])) {
            echo "<p>✓ Monitor specifications found</p>";
            $monitorSpecs = $inventoryData['monitors']['specifications'];
            echo "<p>  - Size distribution: " . count($monitorSpecs['size_distribution'] ?? []) . " sizes</p>";
            echo "<p>  - Resolution distribution: " . count($monitorSpecs['resolution_distribution'] ?? []) . " resolutions</p>";
        } else {
            echo "<p>✗ Monitor specifications missing</p>";
        }
        
        if (isset($inventoryData['other_assets']['specifications'])) {
            echo "<p>✓ OtherAsset specifications found</p>";
            $assetSpecCount = count($inventoryData['other_assets']['specifications']);
            echo "<p>  - Specification types: $assetSpecCount</p>";
        } else {
            echo "<p>✗ OtherAsset specifications missing</p>";
        }
        
        echo "<h2>Detailed Asset Lists Check:</h2>";
        
        if (isset($inventoryData['system_units']['detailed_list'])) {
            $unitCount = count($inventoryData['system_units']['detailed_list']);
            echo "<p>✓ SystemUnit detailed list: $unitCount items</p>";
        }
        
        if (isset($inventoryData['monitors']['detailed_list'])) {
            $monitorCount = count($inventoryData['monitors']['detailed_list']);
            echo "<p>✓ Monitor detailed list: $monitorCount items</p>";
        }
        
        if (isset($inventoryData['other_assets']['detailed_list'])) {
            $assetCount = count($inventoryData['other_assets']['detailed_list']);
            echo "<p>✓ OtherAsset detailed list: $assetCount items</p>";
        }
        
        // Test AI with specification query
        echo "<h2>Testing AI Response for Asset Specifications:</h2>";
        
        $question = "What are the specifications of our system units, monitors, and other assets? Please provide detailed information about their technical specifications.";
        
        $aiResponse = $openAIService->generateIntelligentInventoryResponse($question, $inventoryData);
        
        echo "<h3>AI Response:</h3>";
        echo "<div style='background: #f5f5f5; padding: 15px; border-radius: 5px;'>";
        echo nl2br(htmlspecialchars($aiResponse));
        echo "</div>";
        
    } catch (Exception $e) {
        echo "<h2>Error:</h2>";
        echo "<p>" . $e->getMessage() . "</p>";
        echo "<p>File: " . $e->getFile() . "</p>";
        echo "<p>Line: " . $e->getLine() . "</p>";
    }
});
