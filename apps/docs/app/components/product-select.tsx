'use client';

import { PanelsTopLeftIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getProductByPathname,
  type ProductValue,
  products,
} from '@/lib/products';

const productIcons = {
  canvas: PanelsTopLeftIcon,
} satisfies Record<ProductValue, typeof PanelsTopLeftIcon>;

function ProductIcon({ value }: { value: ProductValue }) {
  const Icon = productIcons[value];

  return <Icon />;
}

export function ProductSelect() {
  const location = useLocation();
  const navigate = useNavigate();

  const value = useMemo(
    () => getProductByPathname(location.pathname).value,
    [location.pathname],
  );
  const selected =
    products.find((product) => product.value === value) ?? products[0];
  const SelectedIcon = productIcons[selected.value];

  return (
    <Select
      aria-label="Select product"
      value={value}
      onValueChange={(nextValue) => {
        const product = products.find((item) => item.value === nextValue);
        if (product) navigate(product.defaultHref);
      }}
    >
      <SelectTrigger size="sm" className="ms-3 min-w-32">
        <SelectValue asChild>
          <span className="flex items-center gap-2">
            <SelectedIcon />
            <span className="truncate">{selected.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {products.map((product) => (
            <SelectItem key={product.value} value={product.value}>
              <ProductIcon value={product.value} />
              <span className="truncate">{product.label}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
