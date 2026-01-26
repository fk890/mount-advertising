'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';

// Product interface
interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  stock: number;
  isNew?: boolean;
  specifications?: Record<string, string>;
}

// Form props
interface ProductFormProps {
  initialData?: Partial<Product>;
  mode: 'create' | 'edit';
}

// Categories options - Mount Advertising product categories
const CATEGORIES = [
  { value: 'neon-signage', label: 'Neon Signage' },
  { value: 'led-boards', label: 'LED Boards' },
  { value: 'cafe', label: 'Cafe Neon Signs' },
  { value: 'gaming', label: 'Gaming Neon Signs' },
  { value: 'banners', label: 'Banners' },
  { value: 'displays', label: 'Displays' }
];

const DEFAULT_PRODUCT: Product = {
  name: '',
  description: '',
  price: 0,
  originalPrice: undefined,
  category: '',
  subcategory: '',
  images: [],
  stock: 1,
  isNew: false,
  specifications: {}
};

export default function ProductForm({ initialData = {}, mode = 'create' }: ProductFormProps): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState<Product>({
    ...DEFAULT_PRODUCT,
    ...initialData
  });
    // Specifications handling
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [editingSpecKey, setEditingSpecKey] = useState<string | null>(null);
  const [isEditingSpec, setIsEditingSpec] = useState(false);
  
  // Image upload preview
  const [dragActive, setDragActive] = useState(false);

  // Handle form field change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ 
        ...formData, 
        [name]: checked 
      });
      return;
    }
    
    // Handle numeric values
    if (name === 'price' || name === 'originalPrice' || name === 'stock') {
      setFormData({ 
        ...formData, 
        [name]: value === '' ? '' : Number(value) 
      });
      return;
    }
    
    // Handle regular string values
    setFormData({ 
      ...formData, 
      [name]: value 
    });
  };
  // Handle specification add or update
  const handleAddSpecification = () => {
    if (!specKey.trim() || !specValue.trim()) return;
    
    if (isEditingSpec && editingSpecKey) {
      // If editing, remove old key and add the updated one
      const newSpecs = { ...formData.specifications };
      delete newSpecs[editingSpecKey];
      newSpecs[specKey] = specValue;
      
      setFormData({
        ...formData,
        specifications: newSpecs
      });
      
      // Reset editing state
      setIsEditingSpec(false);
      setEditingSpecKey(null);
    } else {
      // Regular add
      setFormData({
        ...formData,
        specifications: {
          ...formData.specifications,
          [specKey]: specValue
        }
      });
    }
    
    // Reset inputs
    setSpecKey('');
    setSpecValue('');
  };
  
  // Handle specification edit
  const handleEditSpecification = (key: string, value: string) => {
    setSpecKey(key);
    setSpecValue(value);
    setEditingSpecKey(key);
    setIsEditingSpec(true);
  };

  // Handle specification remove
  const handleRemoveSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    
    setFormData({
      ...formData,
      specifications: newSpecs
    });
    
    // If removing the currently edited spec, reset the edit state
    if (editingSpecKey === key) {
      setIsEditingSpec(false);
      setEditingSpecKey(null);
      setSpecKey('');
      setSpecValue('');
    }
  };

  // Handle image upload
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setImageUploading(true);
    setError(null);
    
    // Create a FormData object
    const formData = new FormData();
    Array.from(files).forEach((file, index) => {
      formData.append(`image-${index}`, file);
    });
    
    try {
      // Replace with your actual image upload API endpoint
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to upload image');
      
      const data = await response.json();
      
      // Add the new image URLs to the existing images array
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...data.urls]
      }));
    } catch (err) {
      setError('Error uploading image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setImageUploading(false);
    }
  };
  // Handle image remove
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Handle image reordering
  const handleMoveImage = (currentIndex: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === formData.images.length - 1)
    ) {
      return; // Can't move further
    }
    
    const newImages = [...formData.images];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap the images
    [newImages[currentIndex], newImages[targetIndex]] = 
    [newImages[targetIndex], newImages[currentIndex]];
    
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };
    // Handle drag events for image upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop for image upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    // Check if there are files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Validate file types here to give immediate feedback
      const files = e.dataTransfer.files;
      const validFiles = Array.from(files).filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
        return validTypes.includes(file.type);
      });
      
      if (validFiles.length === 0) {
        setError('Please upload only image files (JPG, PNG, GIF, WEBP)');
        return;
      }
      
      // Upload valid files
      handleImageUpload(e.dataTransfer.files);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    // Create payload object
    const payload = { ...formData };
    
    // Validate the form
    if (!payload.name.trim()) {
      setError('Product name is required');
      setIsSubmitting(false);
      return;
    }
    
    if (payload.price <= 0) {
      setError('Price must be greater than zero');
      setIsSubmitting(false);
      return;
    }
    
    if (!payload.category) {
      setError('Category is required');
      setIsSubmitting(false);
      return;
    }
    
    if (payload.images.length === 0) {
      setError('At least one product image is required');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // API endpoint based on mode
      const endpoint = mode === 'create' 
        ? '/api/admin/products' 
        : `/api/admin/products/${payload.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }
      
      const result = await response.json();
      
      setSuccess(`Product successfully ${mode === 'create' ? 'created' : 'updated'}`);
      
      // Redirect after a brief delay to show success message
      setTimeout(() => {
        router.push('/shop/admin/products');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the product');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Success/Error messages */}
      {success && (
        <div className="bg-green-50 p-4 rounded-md flex items-center gap-2 text-green-700">
          <CheckCircle size={20} />
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-600">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Product Name*
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              placeholder="Diamond Ring"
              required
            />
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category*
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
              Subcategory
            </label>
            <input
              id="subcategory"
              name="subcategory"
              type="text"
              value={formData.subcategory || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              placeholder="Wedding Rings"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
            placeholder="Enter product description..."
          />
        </div>
      </div>
      
      {/* Pricing & Inventory */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pricing & Inventory</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price (₹)*
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>
          
          <div>
            <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">
              Original Price (₹)
            </label>
            <input
              id="originalPrice"
              name="originalPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.originalPrice || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              placeholder="Leave blank if no sale"
            />
          </div>
          
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
              Stock Quantity*
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="isNew"
            name="isNew"
            type="checkbox"
            checked={formData.isNew || false}
            onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
            className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
          />
          <label htmlFor="isNew" className="ml-2 block text-sm text-gray-700">
            Mark as New
          </label>
        </div>
      </div>
      
      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Product Images</h3>
          {/* Image upload area */}
        <div 
          className={`border-2 border-dashed rounded-md p-6 text-center transition-all duration-200 ${
            dragActive ? 'border-black bg-gray-50 border-4' : 'border-gray-300'
          } ${imageUploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50 hover:border-gray-400'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-3">
            {imageUploading ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-10 w-10 bg-gray-200 rounded-full mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="mt-2 text-sm text-gray-500">Uploading...</div>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 mx-auto text-gray-400" />
                <div className="text-sm text-gray-600">
                  <label htmlFor="file-upload" className="cursor-pointer text-black font-medium hover:text-gray-700 underline">
                    Click to upload
                  </label>{" "}
                  or drag and drop
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </>
            )}
          </div>
          
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept="image/png,image/jpeg,image/gif,image/webp"
            multiple            disabled={imageUploading}
            onChange={(e) => handleImageUpload(e.target.files)}
          />
          
          {imageUploading && (
            <div className="mt-2 text-sm text-gray-600">
              Uploading...
            </div>
          )}
        </div>
          {/* Image preview */}
        {formData.images.length > 0 && (
          <>
            <div className="mb-2 flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Uploaded Images</h4>
              <p className="text-xs text-gray-500">
                {formData.images.length} {formData.images.length === 1 ? 'image' : 'images'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`relative group aspect-square bg-gray-100 rounded-md overflow-hidden border-2 transition-all duration-200 ${index === 0 ? 'border-black' : 'border-transparent'}`}
                >
                  {index === 0 && (
                    <div className="absolute top-0 left-0 bg-black text-white text-xs px-2 py-1 z-10">
                      Thumbnail
                    </div>
                  )}
                  <Image
                    src={image}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 gap-1">
                      <div className="flex flex-col gap-1">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, 'up')}
                            className="bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100"
                            title="Move image up"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                          </button>
                        )}
                        {index !== formData.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, 'down')}
                            className="bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100"
                            title="Move image down"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="bg-white rounded-full p-1.5 shadow-sm hover:bg-gray-100"
                        title="Remove image"
                      >
                        <X size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          
            <p className="text-sm text-gray-500 mt-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              First image is used as the product thumbnail. Drag and drop more images to add them.
            </p>
          </>
        )}
      </div>
      
      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Product Specifications</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="specKey" className="block text-sm font-medium text-gray-700">
              Specification Name
            </label>
            <input
              id="specKey"
              type="text"
              value={specKey}
              onChange={(e) => setSpecKey(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
              placeholder="Material"
            />
          </div>
          
          <div>
            <label htmlFor="specValue" className="block text-sm font-medium text-gray-700">
              Specification Value
            </label>
            <div className="flex">
              <input
                id="specValue"
                type="text"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black"
                placeholder="18K Gold"
              />              <button
                type="button"
                onClick={handleAddSpecification}
                className="mt-1 bg-black text-white px-4 rounded-r-md hover:bg-gray-800"
              >
                {isEditingSpec ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Specifications list */}
        {Object.keys(formData.specifications || {}).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Added Specifications</h4>
            <div className="space-y-2">
              {Object.entries(formData.specifications || {}).map(([key, value]) => (                <div key={key} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                  <div className="text-black">
                    <span className="font-medium text-black">{key}:</span> {value}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditSpecification(key, value)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit specification"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecification(key)}
                      className="text-red-600 hover:text-red-900"
                      title="Remove specification"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Update Product'}
        </button>
      </div>
    </form>
  );
}
