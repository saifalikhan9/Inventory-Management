import { Prisma, Products } from "@prisma/client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SelectedProductsTypes = {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
};

export const saleWithRelations = Prisma.validator<Prisma.SaleDefaultArgs>()({
  include: {
    customer: true,
    SaleItem: true,
  },
});

export type Saletype = Prisma.SaleGetPayload<typeof saleWithRelations>;

interface InventoryStore {
  products: Products[];
  sales: Saletype[];
  selectedProducts: SelectedProductsTypes[];
  setProducts: (product: Products[]) => void;
  setSelectedProducts: (selectedProducts: SelectedProductsTypes[]) => void;
  resetSelectedProducts: () => void;
  addProduct: (product: Products) => void;
  updateProduct: (product: Products) => void;
  deleteProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantityChange: number) => void;
  setSale: (sale: Saletype[]) => void;
  addSale: (sale: Saletype) => void;
  updateSale: (sale: Saletype) => void;
  deleteSale: (id: string) => void;
  reset: () => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set) => ({
      products: [],
      sales: [],
      selectedProducts: [],
      setProducts: (products: Products[]) => set({ products }),
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
      setSale: (sales: Saletype[]) => set({ sales }),
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
      setSelectedProducts: (selectedProducts) => set({ selectedProducts }),
      resetSelectedProducts: () => set({ selectedProducts: [] }),
    }),

    {
      name: "Inventory-Storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
