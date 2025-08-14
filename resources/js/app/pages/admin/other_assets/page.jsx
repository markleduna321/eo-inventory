import React from 'react';
import Layout from '../layout';
import CreateOtherAssetSection from './_sections/create-other-asset-section';
import OtherAssetsTableSection from './_sections/other-assets-table-section';

export default function OtherAssetsPage() {
    return (
        <Layout>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-none">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                            <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                                <div className="ml-4 mt-4">
                                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                                        Other Assets Management
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage other assets like TVs, tables, chairs, and miscellaneous items.
                                    </p>
                                </div>
                                <div className="ml-4 mt-4 flex-shrink-0">
                                    <CreateOtherAssetSection />
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-5 sm:p-6">
                            <OtherAssetsTableSection />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
