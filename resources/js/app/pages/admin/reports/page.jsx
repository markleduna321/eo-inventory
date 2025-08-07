import React from 'react'
import AdminLayout from '../layout'
import ReportsHeaderSection from './_sections/reports-header-section'
import ReportsTableSection from './_sections/reports-table-section'
import AskAISection from './components/AskAISection'

export default function ReportsPage() {
    return (
        <AdminLayout>
            <div className="space-y-6">
                <ReportsHeaderSection />
                <AskAISection />
                <ReportsTableSection />
            </div>
        </AdminLayout>
    )
}
