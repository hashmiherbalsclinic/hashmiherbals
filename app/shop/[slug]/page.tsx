import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { siteConfig } from "@/lib/catalog";
import {
  fetchProductBySlug,
  fetchProductSlugs,
  fetchRelatedProducts,
} from "@/lib/products";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await fetchProductSlugs(80);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: `${product.title} | ${siteConfig.name}`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const related = await fetchRelatedProducts(product, 4);

  return <ProductDetail product={product} related={related} />;
}
