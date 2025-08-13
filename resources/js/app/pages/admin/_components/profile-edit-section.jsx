import React, { useState, useEffect } from 'react'
import Modal from '@/app/pages/components/modal'
import Button from '@/app/pages/components/button'
import InputTextComponent from '@/app/pages/components/input-text-component'
import { router, usePage } from '@inertiajs/react'

export default function ProfileEditSection({ isOpen, onClose }) {
    const { auth } = usePage().props
    const user = auth?.user
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        current_password: '',
        password: '',
        password_confirmation: ''
    })
    const [processing, setProcessing] = useState(false)
    const [errors, setErrors] = useState({})
    const [activeTab, setActiveTab] = useState('profile') // 'profile' or 'password'

    // Update form data when user changes
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }))
        }
    }, [user])

    const handleClose = () => {
        setErrors({})
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            current_password: '',
            password: '',
            password_confirmation: ''
        })
        setActiveTab('profile')
        onClose()
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})

        try {
            router.patch('/profile', {
                name: formData.name,
                email: formData.email
            }, {
                onSuccess: () => {
                    handleClose()
                },
                onError: (errors) => {
                    setErrors(errors)
                },
                onFinish: () => {
                    setProcessing(false)
                }
            })
        } catch (error) {
            console.error('Profile update error:', error)
            setErrors({ general: 'An unexpected error occurred.' })
            setProcessing(false)
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})

        try {
            router.put('/password', {
                current_password: formData.current_password,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            }, {
                onSuccess: () => {
                    setFormData(prev => ({
                        ...prev,
                        current_password: '',
                        password: '',
                        password_confirmation: ''
                    }))
                    handleClose()
                },
                onError: (errors) => {
                    setErrors(errors)
                },
                onFinish: () => {
                    setProcessing(false)
                }
            })
        } catch (error) {
            console.error('Password update error:', error)
            setErrors({ general: 'An unexpected error occurred.' })
            setProcessing(false)
        }
    }

    if (!user) return null

    return (
        <Modal isOpen={isOpen} onClose={handleClose} width="w-full max-w-md">
            <div className="bg-white px-6 py-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleClose}
                    >
                        ×
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'profile'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Profile Information
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'password'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Change Password
                        </button>
                    </nav>
                </div>

                {/* Profile Information Tab */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <InputTextComponent
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <InputTextComponent
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                disabled={processing}
                            >
                                {processing ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-1">
                                Current Password
                            </label>
                            <InputTextComponent
                                id="current_password"
                                name="current_password"
                                type="password"
                                value={formData.current_password}
                                onChange={(e) => setFormData({...formData, current_password: e.target.value})}
                                required
                            />
                            {errors.current_password && <p className="text-red-500 text-sm mt-1">{errors.current_password}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <InputTextComponent
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <InputTextComponent
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                                required
                            />
                            {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation}</p>}
                        </div>

                        {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                size="md"
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                disabled={processing}
                            >
                                {processing ? 'Updating...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    )
}
