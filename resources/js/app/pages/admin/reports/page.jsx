import React from 'react'
import AdminLayout from '../layout'
import ReportsHeaderSection from './_sections/reports-header-section'
import ReportsTableSection from './_sections/reports-table-section'

export default function ReportsPage() {
    return (
        <AdminLayout>
            <div>
                <ReportsHeaderSection />
                <ReportsTableSection />
            </div>
        </AdminLayout>
    )
}
