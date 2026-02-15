import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

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
    const { title, handle, description, tenantId, price, sku } = body;

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
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
