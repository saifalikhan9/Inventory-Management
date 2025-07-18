import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';

import ProductDataTable from './productTable';
import { Product } from '@/lib/store';

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductIds: Set<string>;
  onSave: (selectedIds: Set<string>) => void;
}

const ProductDialog: React.FC<ProductDialogProps> = ({
  isOpen,
  onClose,
  products,
  selectedProductIds,
  onSave,
}) => {
  const [tempSelectedIds, setTempSelectedIds] = useState<Set<string>>(new Set());

  // Initialize temp selection with current selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTempSelectedIds(new Set(selectedProductIds));
    }
  }, [isOpen, selectedProductIds]);

  const handleSave = () => {
    onSave(tempSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedIds(new Set(selectedProductIds)); // Reset to original selection
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Products</h2>
              <p className="text-sm text-gray-500">
                Choose products to add to your selection
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          <ProductDataTable
            products={products}
            selectedProductIds={tempSelectedIds}
            onSelectionChange={setTempSelectedIds}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {tempSelectedIds.size} product{tempSelectedIds.size !== 1 ? 's' : ''} selected
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Selection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDialog;