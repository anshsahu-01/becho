import { ApiResponse, Category } from "@/types";
import { apiRequest } from "./api";

export async function getCategories() {
  const res = await apiRequest<ApiResponse<Category[]>>("/categories");
  return res.data;
}
