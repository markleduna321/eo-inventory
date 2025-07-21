import { LineChart } from '@mui/x-charts'
import React, { useRef, useState, useEffect } from 'react'
import axios from 'axios'

export default function AssetValueMonthly() {
    const chartContainerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(500);
    const [valueData, setValueData] = useState({
        months: [],
        values: [],
        loading: true
    })

    useEffect(() => {
        function handleResize() {
            if (chartContainerRef.current) {
                setChartWidth(chartContainerRef.current.offsetWidth);
            }
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        
        fetchValueData();
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchValueData = async () => {
        try {
            const response = await axios.get('/api/dashboard/asset-value-per-month')
            setValueData({
                months: response.data.months,
                values: response.data.values,
                loading: false
            })
        } catch (error) {
            console.error('Error fetching value data:', error)
            setValueData(prev => ({ ...prev, loading: false }))
        }
    }

    if (valueData.loading) {
        return (
            <div ref={chartContainerRef} className="w-full h-72 bg-white">
                <h2 className="text-xl font-semibold mb-2">Asset Value Growth</h2>
                <div className="h-[220px] flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div ref={chartContainerRef} className="w-full h-72 bg-white">
            <h2 className="text-xl font-semibold mb-2">Asset Value Growth</h2>
            <LineChart
                width={chartWidth}
                height={220}
                margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
                series={[
                    { 
                        data: valueData.values, 
                        label: "Cumulative Asset Value", 
                        color: "#10b981" 
                    },
                ]}
                xAxis={[{ scaleType: "point", data: valueData.months }]}
            />
        </div>
    )
}
