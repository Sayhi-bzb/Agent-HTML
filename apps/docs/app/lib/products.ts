export const products = [
  {
    label: 'Canvas',
    value: 'canvas',
    root: '/docs/canvas',
    defaultHref: '/docs/canvas/start',
  },
] as const;

export type Product = (typeof products)[number];
export type ProductValue = Product['value'];

export function getProductByPathname(pathname: string): Product {
  return (
    products.find(
      (product) =>
        pathname === product.root || pathname.startsWith(`${product.root}/`),
    ) ?? products[0]
  );
}
