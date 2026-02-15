import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { productSchema } from "@/lib/validations";
import { logError } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get("tenantId") || "trend-store-demo";

    const products = await prisma.product.findMany({
      where: {
        tenant: { slug: tenantId },
        status: "PUBLISHED",
      },
      include: {
        variants: {
          where: { isActive: true },
          include: {
            inventory: true,
          },
        },
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    logError("ProductsGET", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, handle, description, tenantId, price, sku } = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        tenantId,
        title,
        handle,
        description,
        status: "DRAFT",
        variants: {
          create: {
            sku: sku || `${handle}-default`,
            price: price || 0,
            currency: "USD",
            isActive: true,
            inventory: {
              create: {
                stockOnHand: 0,
                lowStockThreshold: 5,
                allowBackorder: false,
              },
            },
          },
        },
      },
      include: {
        variants: {
          include: {
            inventory: true,
          },
        },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    logError("ProductsPOST", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
