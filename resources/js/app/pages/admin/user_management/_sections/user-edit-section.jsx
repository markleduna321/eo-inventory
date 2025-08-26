import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { update_user_thunk } from "../_redux/user-management-thunk";
import AlertComponent from "@/app/pages/components/alert";
import InputLabelComponent from "@/app/pages/components/input-label-component";
import InputTextComponent from "@/app/pages/components/input-text-component";
import SelectComponent from "@/app/pages/components/input-select";

const InputError = ({ message, className = "" }) => {
    if (!message) return null;
    return <p className={`text-red-500 text-sm ${className}`}>{message}</p>;
};

export default function UserEditSection({ selectedUser, onClose, setAlertMessage, setAlertType, setShowAlert }) {
    if (!selectedUser) return null;

    const dispatch = useDispatch();
    const { roles } = useSelector((store) => store.roles);

    // State for user data and errors
    const [userData, setUserData] = useState({
        name: selectedUser.name,
        email: selectedUser.email,
        password: "", // Keep the password field empty
        role_id: selectedUser.role_id,
        is_online: selectedUser.is_online,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        setUserData({
            name: selectedUser.name,
            email: selectedUser.email,
            password: "", // Reset password field on user change
            role_id: selectedUser.role_id,
            is_online: selectedUser.is_online,
        });
    }, [selectedUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, role_id, is_online } = userData;
        
        // Only add the password if it's provided
        const formData = { name, email, role_id, is_online };
        if (password) {
            formData.password = password; // Add password only if it's not empty
        }
    
        try {
            await dispatch(update_user_thunk(selectedUser.id, formData));
            setAlertMessage("User updated successfully!");
            setAlertType("success");
            setShowAlert(true);

            onClose();
        } catch (error) {
            setAlertMessage("Failed to update user. Please try again.");
            setAlertType("error");
            setShowAlert(true);
            setErrors(error?.response?.data?.errors || {});
        } finally {
            // Automatically close the alert after 10 seconds (10000ms)
            setTimeout(() => {
                setShowAlert(false);  // Hide the alert
                setAlertMessage("");  // Optional: Clear the message
                setAlertType("");    // Optional: Clear the alert type
            }, 10000); // 10000ms = 5 seconds
    
            // Close the modal after the action
            
        }
    };
    

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Edit User</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                {/* Name Input */}
                <div>
                    <InputLabelComponent 
                        labelText="Name"
                        required={true}
                    />
                    <InputTextComponent 
                        name="name"
                        value={userData.name}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                    />
                    <InputError message={errors?.name} />
                </div>

                {/* Email Input */}
                <div>
                    <InputLabelComponent 
                        labelText="Email"
                        required={true}
                    />
                    <InputTextComponent 
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                    />
                    <InputError message={errors?.email} />
                </div>

                {/* Password Input */}
                <div>
                    <InputLabelComponent 
                        labelText="Password"
                        required={false}
                    />
                    <InputTextComponent 
                        type="password"
                        name="password"
                        value={userData.password}
                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                        placeholder="Leave blank to keep current password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                    />
                    <InputError message={errors?.password} />
                </div>

                {/* Role Selection */}
                <div>
                    <InputLabelComponent 
                        labelText="Role"
                        required={true}
                    />
                    <SelectComponent 
                        name="role_id"
                        value={userData.role_id}
                        onChange={(e) => setUserData({ ...userData, role_id: e.target.value })}
                        options={[
                            { value: "", label: "Select Role" },
                            ...roles
                                .filter(role => role.status === 'Active')
                                .map(role => ({
                                    value: role.id,
                                    label: role.name
                                }))
                        ]}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
                    />
                    <InputError message={errors?.role_id} />
                </div>

                

                {/* Submit and Cancel Buttons */}
                <div className="flex justify-end space-x-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>  
            </form>
        </div>
    );
}
