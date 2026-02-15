import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "trend-store-demo" },
    update: {},
    create: {
      name: "Trend Store Demo",
      slug: "trend-store-demo",
      settings: {
        create: {
          brandName: "Trend Store",
          baseCurrency: "USD",
          enabledCurrencies: ["USD"],
          cookieConsentEnabled: true,
          useGenderNeutralLanguage: true,
          collectPronouns: false,
          seoTitleDefault: "Trend Store",
          seoDescDefault: "Modern commerce powered by Trend Store."
        }
      },
      taxSettings: { create: { mode: "MANUAL", isTaxInclusive: false, defaultRateBps: 0 } }
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@trendstore.local" },
    update: { name: "Trend Admin" },
    create: { email: "admin@trendstore.local", name: "Trend Admin" }
  });

  const zone = await prisma.shippingZone.create({ data: { tenantId: tenant.id, name: "United States", countries: ["US"], isActive: true } });
  await prisma.shippingMethod.createMany({
    data: [
      { tenantId: tenant.id, zoneId: zone.id, name: "Standard Shipping (3–5 days)", price: 799, currency: "USD", etaDaysMin: 3, etaDaysMax: 5, isActive: true }
    ]
  });

  const catNew = await prisma.category.create({ data: { tenantId: tenant.id, name: "New Arrivals", handle: "new-arrivals" } });
  const tagLimited = await prisma.tag.create({ data: { tenantId: tenant.id, name: "Limited" } });

  const product = await prisma.product.create({
    data: { tenantId: tenant.id, title: "Metro Hoodie", handle: "metro-hoodie", description: "A heavyweight hoodie with a clean fit.", status: "PUBLISHED" }
  });

  await prisma.productCategory.create({ data: { productId: product.id, categoryId: catNew.id } });
  await prisma.productTag.create({ data: { productId: product.id, tagId: tagLimited.id } });

  const variant = await prisma.productVariant.create({ data: { productId: product.id, sku: "METRO-HOOD-DEFAULT", price: 6400, currency: "USD", isActive: true } });
  await prisma.inventoryItem.create({ data: { variantId: variant.id, stockOnHand: 25, lowStockThreshold: 5, allowBackorder: false } });

  console.log("✅ Seed complete. Tenant:", tenant.slug);
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());
