import { useCallback, useEffect, useState } from "react";
import * as productService from "@/services/product.service";
import { Product, ProductFilters } from "@/types";

export function useProducts(initialFilters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  const fetchProducts = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const { products: data } = await productService.getProducts(filters);
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = (updater: ProductFilters | ((prev: ProductFilters) => ProductFilters)) => {
    setFilters((prev) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  };

  const refetch = useCallback(() => fetchProducts(true), [fetchProducts]);

  return {
    products,
    loading,
    refreshing,
    error,
    filters,
    setFilters: updateFilters,
    refetch,
  };
}
