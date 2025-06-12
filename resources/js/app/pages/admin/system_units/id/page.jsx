import React from 'react'
import AdminLayout from '../../layout'
import SystemUnitViewSection from './sections/system-unit-view-section'

export default function SystemUnitViewPage() {
    return (
        <AdminLayout>
            <div className="relative bg-white p-5 rounded-lg shadow-md">
                <SystemUnitViewSection />
            </div>
        </AdminLayout>
    )
}
