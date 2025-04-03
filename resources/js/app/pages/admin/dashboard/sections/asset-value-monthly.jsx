import { LineChart } from '@mui/x-charts'
import React from 'react'

export default function AssetValueMonthly() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const currentYearData = [100000, 120000, 140000, 130000, 150000, 170000, 160000, 180000, 190000, 200000, 210000, 220000];

    const lastYearData = [90000, 110000, 130000, 120000, 140000, 160000, 150000, 170000, 180000, 190000, 200000, 210000];
    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Financial & Depreciation Analysis</h2>
            <LineChart
                width={500}
                height={250}
                series={[
                    { data: currentYearData, label: "This Year", color: "#007bff" }, // Blue
                    { data: lastYearData, label: "Last Year", color: "#FF5733" }, // Red
                ]}
                xAxis={[{ scaleType: "point", data: months }]}
            />
        </div>
    )
}
