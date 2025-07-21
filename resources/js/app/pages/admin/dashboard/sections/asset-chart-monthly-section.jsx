import { BarChart } from '@mui/x-charts'
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function AssetChartMonthly() {
    const [chartData, setChartData] = useState({
        months: [],
        data: [],
        loading: true
    })

    useEffect(() => {
        fetchAssetsData()
    }, [])

    const fetchAssetsData = async () => {
        try {
            const response = await axios.get('/api/dashboard/assets-received-per-month')
            setChartData({
                months: response.data.months,
                data: response.data.data,
                loading: false
            })
        } catch (error) {
            console.error('Error fetching assets data:', error)
            setChartData(prev => ({ ...prev, loading: false }))
        }
    }

    if (chartData.loading) {
        return (
            <div className="bg-white w-full h-[600px] flex items-center justify-center">
                <div className="text-gray-500">Loading chart data...</div>
            </div>
        )
    }

    return (
        <div className="bg-white w-full">
            <BarChart
                xAxis={[
                    {
                        id: 'barCategories',
                        data: chartData.months,
                        scaleType: 'band',
                    },
                ]}
                series={[
                    {
                        data: chartData.data.map(item => item.total),
                        label: 'Total Assets Received',
                        color: '#3b82f6'
                    },
                ]}
                height={600}
            />
        </div>
    )
}
