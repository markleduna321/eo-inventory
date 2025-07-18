import { useSelector, useDispatch } from "react-redux";
import React, { useState, useMemo } from "react";
import Modal from "@/app/pages/components/modal";
import UserEditSection from "./user-edit-section";
import DeleteConfirmationModal from "@/app/pages/components/delete-confirmation-modal";
import { delete_user_thunk } from "../_redux/user-management-thunk";
import AlertComponent from "@/app/pages/components/alert";
import Button from '@/app/pages/components/button';
import { ArrowDownCircleIcon, PrinterIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function UserManagementTableSection() {
  const dispatch = useDispatch();
  const { users } = useSelector((store) => store.users);
  const { roles } = useSelector((store) => store.roles);
  const userData = Array.isArray(users) ? users : [];

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // 'success' or 'error'
  const [showAlert, setShowAlert] = useState(false);

  // Filter users based on search term, role, and status
  const filteredUsers = useMemo(() => {
    return userData.filter(user => {
      const matchesSearch = searchTerm === '' || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === '' || user.role_id?.toString() === roleFilter
      
      const matchesStatus = statusFilter === '' || 
        (statusFilter === 'active' && user.status === 'active') ||
        (statusFilter === 'inactive' && user.status !== 'active')
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [userData, searchTerm, roleFilter, statusFilter])

  // Get role name by ID
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id.toString() === roleId?.toString())
    return role ? role.name : 'Unknown Role'
  }

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewModalOpen(true); 
  };

  const closeViewModal = () => {
    setViewModalOpen(false); 
    setSelectedUser(null); 
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true); 
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await dispatch(delete_user_thunk(userToDelete.id));
        setAlertMessage("User deleted successfully!");
        setAlertType("success");
        setShowAlert(true);
      } catch (error) {
        setAlertMessage("Failed to delete user. Please try again.");
        setAlertType("error");
        setShowAlert(true);
      } finally {
        setDeleteModalOpen(false);
        setUserToDelete(null);

         // Automatically close the alert after 10 seconds (10000ms)
         setTimeout(() => {
              setShowAlert(false);
              setAlertMessage("");  // Optional: Clear the message
              setAlertType("");    // Optional: Clear the alert type
          }, 5000); // 10000ms = 5 seconds
      }
    }
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };
  
  return (
    <div className="mt-8 flow-root bg-white p-5 rounded-lg">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          
          {/* Action Buttons and Filters */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {roles.filter(role => role.status === 'Active').map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {(searchTerm || roleFilter || statusFilter) && (
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('')
                    setStatusFilter('')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                type='button'
                variant='primary'
                size='sm'>
                <PrinterIcon className='h-4' />
              </Button>
              <Button
                type='button'
                variant='success'
                size='sm'>
                <ArrowDownCircleIcon className='h-4' />
              </Button>
            </div>
          </div>

          {/* Filter Summary */}
          {(searchTerm || roleFilter || statusFilter) && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {userData.length} users
                {searchTerm && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Search: "{searchTerm}"</span>}
                {roleFilter && <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Role: {getRoleName(roleFilter)}</span>}
                {statusFilter && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Status: {statusFilter}</span>}
              </p>
            </div>
          )}
          
          <div>
            {showAlert && (
              <AlertComponent
                type={alertType}
                message={alertMessage}
                onClose={() => setShowAlert(false)} // Close alert explicitly
              />
            )}
          </div>
          
          <table className="min-w-full divide-y divide-gray-300 border">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  User
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Role
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((userM) => (
                  <tr key={userM?.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-11 w-11 flex-shrink-0">
                          <UserCircleIcon className="h-11 w-11 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="font-semibold text-gray-900">{userM.name}</div>
                          <div className="mt-1 text-sm text-gray-500">{userM.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                          userM?.role_id == 1
                            ? "bg-red-100 text-red-800"
                            : userM?.role_id == 2
                            ? "bg-orange-100 text-orange-800"
                            : userM?.role_id == 3
                            ? "bg-yellow-100 text-yellow-800"
                            : userM?.role_id == 4
                            ? "bg-yellow-100 text-yellow-800"
                            : userM?.role_id == 5
                            ? "bg-gray-100 text-gray-800"
                            : userM?.role_id == 6
                            ? "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getRoleName(userM?.role_id)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full mr-2 ${
                            userM.is_online ? "bg-green-400" : "bg-red-400"
                          }`}
                        ></div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            userM.is_online
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {userM.is_online ? "Online" : "Offline"}
                        </span>
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(userM)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteUser(userM)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm || roleFilter || statusFilter ? 'No users match your filters' : 'No users found'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm || roleFilter || statusFilter 
                        ? 'Try adjusting your search criteria or clearing the filters.' 
                        : 'Get started by adding a new user.'
                      }
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View/Edit Modal */}
      <Modal isOpen={isViewModalOpen} onClose={closeViewModal}>
        <UserEditSection 
          selectedUser={selectedUser} 
          onClose={closeViewModal} 
          setAlertMessage={setAlertMessage}
          setAlertType={setAlertType}
          setShowAlert={setShowAlert}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteUser}
      />
    </div>
  );
}
