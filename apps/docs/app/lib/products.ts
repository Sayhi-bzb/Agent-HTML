export const products = [
  {
    label: 'App',
    value: 'app',
    root: '/docs/app',
    defaultHref: '/docs/app/overview',
  },
  {
    label: 'Runtime',
    value: 'runtime',
    root: '/docs/runtime',
    defaultHref: '/docs/runtime/overview',
  },
] as const;

export type Product = (typeof products)[number];
export type ProductValue = Product['value'];

export function getProductByPathname(pathname: string): Product {
  return products.find((product) => pathname === product.root || pathname.startsWith(`${product.root}/`)) ?? products[0];
}
