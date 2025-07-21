import { PieChart } from '@mui/x-charts'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function AssetUsageSection() {
    const [usageData, setUsageData] = useState({
        data: [],
        loading: true
    })

    useEffect(() => {
        fetchUsageData()
    }, [])

    const fetchUsageData = async () => {
        try {
            const response = await axios.get('/api/dashboard/asset-usage')
            const formattedData = response.data.map((item, index) => ({
                id: index,
                value: item.value,
                label: item.label
            }))
            
            setUsageData({
                data: formattedData,
                loading: false
            })
        } catch (error) {
            console.error('Error fetching usage data:', error)
            setUsageData(prev => ({ ...prev, loading: false }))
        }
    }

    if (usageData.loading) {
        return (
            <div>
                <h2 className="text-xl font-semibold mb-2">Asset Distribution</h2>
                <div className="h-[250px] flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-2">Asset Distribution</h2>
            <PieChart
                series={[
                    {
                        data: usageData.data,
                        innerRadius: 50,
                        outerRadius: 120,
                        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
                    },
                ]}
                width={400}
                height={250}
            />
        </div>
    )
}
