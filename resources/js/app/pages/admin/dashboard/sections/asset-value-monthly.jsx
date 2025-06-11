import { LineChart } from '@mui/x-charts'
import React, { useRef, useState, useEffect } from 'react'

export default function AssetValueMonthly() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYearData = [100000, 120000, 140000, 130000, 150000, 170000, 160000, 180000, 190000, 200000, 210000, 220000];
    const lastYearData = [90000, 110000, 130000, 120000, 140000, 160000, 150000, 170000, 180000, 190000, 200000, 210000];

    const chartContainerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(500);

    useEffect(() => {
        function handleResize() {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.offsetWidth);
            }
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div ref={chartContainerRef} className="w-full h-72 bg-white">
            <h2 className="text-xl font-semibold mb-2">Financial & Depreciation Analysis</h2>
            <LineChart
                width={chartWidth}
                height={220}
                margin={{ left: 60, right: 20, top: 20, bottom: 40 }} // Add space for y-axis
                series={[
                    { data: currentYearData, label: "This Year", color: "#007bff" },
                    { data: lastYearData, label: "Last Year", color: "#FF5733" },
                ]}
                xAxis={[{ scaleType: "point", data: months }]}
            />
        </div>
    )
}
