import React from 'react';

const ProductSkeletonV2 = () => {  return (
    <div className="swarovski-skeleton">
      <div className="relative bg-white p-0">
        <div style={{ aspectRatio: '1/0.8' }} className="bg-gray-100 w-full"></div>
      </div>
      <div className="p-3">
        <div className="h-4 bg-gray-100 w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-100 w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-100 w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-100 w-1/2"></div>
      </div>
    </div>
  );
};

export default ProductSkeletonV2;
