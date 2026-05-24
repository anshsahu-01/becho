import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../utils/asyncHandler";
import { assertAdminAccess } from "./admin.service";

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  await assertAdminAccess(req);

  const [totalUsers, totalListings, totalOrders, soldListings] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.product.count({ where: { OR: [{ status: "SOLD" }, { isSold: true }] } }),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalListings,
      totalOrders,
      activeListings: totalListings - soldListings,
      soldListings,
    },
  });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  await assertAdminAccess(req);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      collegeName: true,
      createdAt: true,
      products: { select: { id: true } },
      ordersAsBuyer: { select: { id: true } },
      ordersAsSeller: { select: { id: true } },
    },
  });

  res.json({ success: true, data: users });
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  await assertAdminAccess(req);

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      isSold: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.json({ success: true, data: products });
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  await assertAdminAccess(req);

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, title: true } },
      buyer: { select: { id: true, name: true, email: true } },
      seller: { select: { id: true, name: true, email: true } },
    },
  });

  res.json({ success: true, data: orders });
});