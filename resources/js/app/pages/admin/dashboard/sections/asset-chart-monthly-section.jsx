import { BarChart } from '@mui/x-charts'
import React from 'react'

export default function AssetChartMonthly() {
    return (
        <div className=' bg-white w-full'>
            <BarChart
                xAxis={[
                    {
                        id: 'barCategories',
                        data: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                        scaleType: 'band',
                    },
                ]}
                series={[
                    {
                        data: [2, 5, 3, 2, 3, 9, 3, 10, 3, 8, 3, 6],
                    },
                ]}
                height={600}
            />
        </div>
    )
}
