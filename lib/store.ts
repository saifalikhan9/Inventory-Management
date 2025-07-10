import { METHODS, STATUS } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  recorderLevel: number;
}
interface customerTypes {
  id: string;
  name: string;
  phone: number;
}
interface SaleshistotyType {
  customerId: string;
  productId: string;
  totalPrice: number;
  amountPaid: number;
  paymentMode: METHODS;
  paymentStatus: STATUS;
  salesDate: Date;
}
export interface Sale {
  id: string;
  customer: customerTypes;
  SaleItem: Array<{
    id: string;
    product: {
      id: string;
      name: string;
    };
    price: number;
    quantity: number;
    saleId: string;
    productId: string;
  }>;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: METHODS;
  paymentStatus: STATUS;
  salesDate: Date;
}

interface InventoryStore {
  products: Product[];
  sales: Sale[];
  setProducts: (product: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantityChange: number) => void;
  setSale: (sale: Sale[]) => void;
  addSale: (sale: Sale) => void;
  updateSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      products: [],
      sales: [],
      setProducts: (products: Product[]) => set({ products }),
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, product],
        })),
      updateProduct: (updatedProduct) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        })),
      updateProductQuantity: (id, quantityChange) =>
        set((state) => {
          console.log(id, quantityChange);
          return {
            products: state.products.map((product) =>
              product.id === id
                ? {
                    ...product,
                    stockQuantity: Math.max(
                      0,
                      product.stockQuantity + quantityChange
                    ),
                  }
                : product
            ),
          };
        }),
      setSale: (sales: Sale[]) => set({ sales }),
      addSale: (sale) =>
        set((state) => ({
          sales: [...state.sales, sale],
        })),
      updateSale: (updatedSale) =>
        set((state) => ({
          sales: state.sales.map((sale) =>
            sale.id === updatedSale.id ? updatedSale : sale
          ),
        })),
      deleteSale: (id) =>
        set((state) => ({
          sales: state.sales.filter((sale) => sale.id !== id),
        })),
      reset: () => set(() => ({ products: [], sales: [] })),
    }),
    { name: "Inventory-Storage" }
  )
);
