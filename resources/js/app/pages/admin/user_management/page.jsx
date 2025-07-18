import React, { useEffect, useState } from 'react'
import AdminLayout from '../layout'
import UserCreateSection from './_sections/user-create-section';
import RoleCreateSection from './_sections/role-create-section';
import { get_users_thunk } from './_redux/user-management-thunk';
import { get_roles_thunk } from './_redux/roles-thunk';
import store from '@/app/store/store';
import UserManagementTableSection from './_sections/user-management-table-section';
import RoleManagementTableSection from './_sections/role-management-table-section';

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    // Load both users and roles from database
    store.dispatch(get_users_thunk())
    store.dispatch(get_roles_thunk())
    console.log('main page', store)
  }, []);

  function handleAccountAdded(params) {
    // Handle account addition here
  }

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'roles'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Roles & Permissions
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-gray-900">Users</h1>
                <p className="mt-2 text-sm text-gray-700">
                  A list of all the users in your account including their name, title, email and role.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <UserCreateSection />
              </div>
            </div>
            <div className='shadow-md'>
              <UserManagementTableSection />
            </div>
          </>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <>
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-gray-900">Roles & Permissions</h1>
                <p className="mt-2 text-sm text-gray-700">
                  Manage user roles and define what each role can access in the system.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <RoleCreateSection />
              </div>
            </div>
            <div className='shadow-md'>
              <RoleManagementTableSection />
            </div>
          </>
        )}

      </div>
    </AdminLayout>
  )
}