'use client';

import { BoxIcon, CpuIcon } from 'lucide-react';
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

const products = [
  {
    icon: BoxIcon,
    label: 'App',
    value: 'app',
    href: '/docs/app/overview',
  },
  {
    icon: CpuIcon,
    label: 'Runtime',
    value: 'runtime',
    href: '/docs/runtime/overview',
  },
] as const;

export function ProductSelect() {
  const location = useLocation();
  const navigate = useNavigate();

  const value = useMemo(() => {
    const active = products.find((product) => {
      const productRoot = product.href.replace(/\/overview$/, '');

      return location.pathname.startsWith(productRoot);
    });

    return active?.value ?? products[0].value;
  }, [location.pathname]);
  const selected = products.find((product) => product.value === value) ?? products[0];

  return (
    <Select
      aria-label="Select product"
      value={value}
      onValueChange={(nextValue) => {
        const product = products.find((item) => item.value === nextValue);
        if (product) navigate(product.href);
      }}
    >
      <SelectTrigger size="sm" className="ms-3 min-w-32">
        <SelectValue asChild>
          <span className="flex items-center gap-2">
            <selected.icon />
            <span className="truncate">{selected.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {products.map((product) => (
            <SelectItem key={product.value} value={product.value}>
              <product.icon />
              <span className="truncate">{product.label}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
