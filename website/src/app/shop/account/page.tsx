"use client";

import { User, Mail, Phone, MapPin, Calendar, Heart, Package, ShoppingBag, CreditCard, Check } from 'lucide-react'
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from 'next/link';
import MobilePageWrapper from '@/shop-components/MobilePageWrapper';
import withAuth from '@/shop-utils/withAuth';

// Combined into a single component for clarity
function AccountPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const unauthorized = searchParams ? searchParams.get("unauthorized") : null;
    const [user, setUser] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            zipCode?: string;
            country?: string;
        }
    } | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editedUser, setEditedUser] = useState<any>(null);
    const [editSuccess, setEditSuccess] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(false);

    useEffect(() => {
        // Get user data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                // Initialize with default values if missing
                userData.phone = userData.phone || "+1 (555) 123-4567";
                userData.address = userData.address || {
                    street: "123 Fifth Avenue",
                    city: "New York",
                    state: "NY",
                    zipCode: "10001",
                    country: "United States"
                };
                setUser(userData);
                setEditedUser(JSON.parse(JSON.stringify(userData))); // Create a deep copy for editing
            } catch (error) {
                console.error('Error parsing user data:', error);
                router.push('/login');
            }
        }
        
        // Set up window resize listener for responsive layout
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth >= 1024);
        };
        
        // Initial check
        checkScreenSize();
        
        // Add event listener
        window.addEventListener('resize', checkScreenSize);
        
        // Clean up
        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, [router]);

    const handleEditProfile = () => {
        setIsEditingProfile(true);
    };

    const handleCancelEdit = () => {
        setEditedUser(JSON.parse(JSON.stringify(user))); // Reset to original values
        setIsEditingProfile(false);
    };

    const handleSaveProfile = () => {
        if (editedUser) {
            // Update the user state with edited values
            setUser(editedUser);
            
            // Save updated data to localStorage
            localStorage.setItem('user', JSON.stringify(editedUser));
            
            // Show success message temporarily
            setEditSuccess(true);
            setTimeout(() => {
                setEditSuccess(false);
            }, 3000);
            
            // Exit edit mode
            setIsEditingProfile(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setEditedUser({
            ...editedUser,
            [field]: value
        });
    };

    const handleAddressChange = (field: string, value: string) => {
        setEditedUser({
            ...editedUser,
            address: {
                ...editedUser.address,
                [field]: value
            }
        });
    };

    // Profile edit form
    const renderEditProfileForm = () => {
        if (!editedUser) return null;
        
        return (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mt-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Edit Profile</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                            type="text"
                            value={editedUser.firstName || ''}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            value={editedUser.lastName || ''}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        value={editedUser.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                        type="tel"
                        value={editedUser.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>
                
                <h4 className="text-md font-semibold mb-3 mt-6 text-gray-900">Address Information</h4>
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                        type="text"
                        value={editedUser.address?.street || ''}
                        onChange={(e) => handleAddressChange('street', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            value={editedUser.address?.city || ''}
                            onChange={(e) => handleAddressChange('city', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                            type="text"
                            value={editedUser.address?.state || ''}
                            onChange={(e) => handleAddressChange('state', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                        <input
                            type="text"
                            value={editedUser.address?.zipCode || ''}
                            onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                            type="text"
                            value={editedUser.address?.country || ''}
                            onChange={(e) => handleAddressChange('country', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                        />
                    </div>
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={handleCancelEdit}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        );
    };

    // Render the account page
    return (
        <>
            {editSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center" role="alert">
                    <Check className="h-5 w-5 mr-2" />
                    <span>Profile updated successfully!</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6 shadow-md border border-gray-100">
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center border-2 border-amber-200">
                                {user ? (
                                    <span className="text-2xl font-medium text-amber-800">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </span>
                                ) : (
                                    <User className="h-12 w-12 text-amber-600" />
                                )}
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Welcome Back, {user?.firstName || 'Guest'}!
                            </h2>
                            <p className="text-gray-600">Premium Customer</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center text-gray-600">
                                <Mail className="h-5 w-5 mr-3" />
                                <span>{user?.email || 'customer@example.com'}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Phone className="h-5 w-5 mr-3" />
                                <span>{user?.phone || '+1 (555) 123-4567'}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <MapPin className="h-5 w-5 mr-3" />
                                <span>{user?.address?.city || 'New York'}, {user?.address?.state || 'NY'}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <Calendar className="h-5 w-5 mr-3" />
                                <span>Member since 2023</span>
                            </div>
                        </div>
                        
                        <div className="mt-6">
                            <button 
                                onClick={handleEditProfile}
                                className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors"
                            >
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Render edit form in mobile view inside the profile section */}
                    <div className="lg:hidden mt-6">
                        {isEditingProfile && renderEditProfileForm()}
                    </div>
                </div>

                {/* Account Options or Edit Form (desktop) */}
                <div className="lg:col-span-2">
                    {isEditingProfile && isLargeScreen ? (
                        renderEditProfileForm()
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <ShoppingBag className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold ml-4">My Orders</h3>
                                </div>
                                <p className="text-gray-600 mb-4">View and track your orders</p>
                                <Link 
                                    href="/orders" 
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    View Orders &rarr;
                                </Link>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <Heart className="h-6 w-6 text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold ml-4">Wishlist</h3>
                                </div>
                                <p className="text-gray-600 mb-4">Your saved advertising products</p>
                                <Link 
                                    href="/wishlist" 
                                    className="text-green-600 hover:text-green-800 font-medium"
                                >
                                    View Wishlist &rarr;
                                </Link>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <Package className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold ml-4">Track Order</h3>
                                </div>
                                <p className="text-gray-600 mb-4">Check delivery status</p>
                                <Link 
                                    href="/track-order" 
                                    className="text-purple-600 hover:text-purple-800 font-medium"
                                >
                                    Track Package &rarr;
                                </Link>
                            </div>
                            
                            <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-center mb-4">
                                    <div className="bg-amber-100 p-3 rounded-lg">
                                        <CreditCard className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold ml-4">Payment Methods</h3>
                                </div>
                                <p className="text-gray-600 mb-4">Manage your payment options</p>
                                <button className="text-amber-600 hover:text-amber-800 font-medium">
                                    View Details &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default withAuth(AccountPage);
