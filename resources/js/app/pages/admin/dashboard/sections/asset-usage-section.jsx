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
                <h2 className="text-lg font-bold text-gray-800 tracking-tight mb-4">Asset Distribution</h2>
                <div className="h-[240px] flex items-center justify-center">
                    <div className="text-gray-500">Loading...</div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">Asset Distribution</h2>
            <PieChart
                series={[
                    {
                        data: usageData.data,
                        innerRadius: 35,
                        outerRadius: 95,
                        paddingAngle: 2,
                        cornerRadius: 5,
                        startAngle: -90,
                        endAngle: 270,
                        cx: 130,
                        cy: 130,
                        highlightScope: { faded: 'global', highlighted: 'item' },
                        faded: { innerRadius: 35, additionalRadius: -30, color: 'gray' },
                        arcLabel: (item) => `${item.value}`,
                        arcLabelMinAngle: 35,
                        arcLabelRadius: '60%',
                    },
                ]}
                width={450}
                height={260}
                slotProps={{
                    legend: {
                        direction: 'column',
                        position: { vertical: 'middle', horizontal: 'right' },
                        padding: 0,
                        itemMarkWidth: 8,
                        itemMarkHeight: 8,
                        markGap: 4,
                        itemGap: 8,
                    },
                }}
                margin={{ right: 160, left: 20, top: 20, bottom: 20 }}
            />
        </div>
    )
}
