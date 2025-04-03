import { PieChart } from '@mui/x-charts'
import React from 'react'

export default function AssetUsageSection() {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Asset Usage & Condition</h2>
            <PieChart
                series={[
                    {
                        data: [
                            { id: 0, value: 10, label: "Used" },
                            { id: 1, value: 15, label: "Damaged" },
                            { id: 2, value: 20, label: "Remaining" },
                        ],
                        innerRadius: 50,
                        outerRadius: 120,
                        colors: ["#4CAF50", "#FF5733", "#3498DB"],
                    },
                ]}
                width={400}
                height={250}
            />
        </div>
    )
}
