import { Link } from "@inertiajs/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import store from "@/app/store/store";
import { get_devices_thunk } from "../../devices/_redux/devices-thunk";

export default function PaginationSection({ systemUnit = falseS }) {
    const [current, setCurrent] = useState(1);
    const [pageSize] = useState(10);

    const { customers } = useSelector((state) => state.customers) || {
        customers: { data: [], total: 0, last_page: 1 },
    };

    const params = new URLSearchParams(window.location.search);
    const current_page = parseInt(params.get("page")) || 1;
    const search = params.get("search");

    useEffect(() => {
        setCurrent(current_page);
    }, [current_page]);

    const generatePageNumbers = (totalPages, currentPage) => {
        const pageNumbers = [];

        if (totalPages <= 9) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1); // Always show the first page

            if (currentPage > 4) {
                pageNumbers.push("left-ellipsis");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - 3) {
                pageNumbers.push("right-ellipsis");
            }

            pageNumbers.push(totalPages); // Always show the last page
        }

        return pageNumbers;
    };

    const pageNumbers = generatePageNumbers(customers?.last_page || 1, current);

    const createLink = (pageNum) => {
        const params = new URLSearchParams();
        params.set('page', pageNum);
        if (search) params.set('search', search);
        return `?${params.toString()}`;
    };

    const handlePageClick = (pageNum, e) => {
        e.preventDefault();
        if (pageNum === current) return;

        // Update URL
        const newUrl = createLink(pageNum);
        window.history.pushState(null, '', newUrl);

        // Fetch new data
        store.dispatch(get_devices_thunk({
            page: pageNum,
            search: search || '',
            per_page: pageSize
        }));
    };

    return (
        <div className="w-full mt-4">
            {systemUnit?.last_page > 1 && (
                <div className="flex justify-between items-center flex-wrap gap-y-2">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((current - 1) * pageSize) + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(current * pageSize, systemUnit?.total || 0)}
                        </span> of{' '}
                        <span className="font-medium">{customers?.total || 0}</span> entries
                    </div>
                    <div className="flex space-x-1 items-center">
                        {/* Previous Button */}
                        <button
                            onClick={(e) => handlePageClick(current - 1, e)}
                            disabled={current === 1}
                            className={`px-3 py-1 border rounded ${current === 1
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-white text-pink-500 border-pink-500 hover:bg-pink-50"
                                }`}
                        >
                            Previous
                        </button>

                        {/* Page Numbers */}
                        {pageNumbers.map((pageNum, index) => {
                            if (pageNum === "left-ellipsis" || pageNum === "right-ellipsis") {
                                return (
                                    <span key={index} className="px-3 py-1">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={(e) => handlePageClick(pageNum, e)}
                                    className={`px-3 py-1 border rounded ${pageNum === current
                                        ? "bg-pink-500 text-white"
                                        : "bg-white text-pink-500 border-pink-500 hover:bg-pink-50"
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        {/* Next Button */}
                        <button
                            onClick={(e) => handlePageClick(current + 1, e)}
                            disabled={current === customers?.last_page}
                            className={`px-3 py-1 border rounded ${current === customers?.last_page
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-white text-pink-500 border-pink-500 hover:bg-pink-50"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
