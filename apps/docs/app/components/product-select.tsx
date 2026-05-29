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
    href: '/docs/app',
  },
  {
    icon: CpuIcon,
    label: 'Runtime',
    value: 'runtime',
    href: '/docs/runtime',
  },
] as const;

export function ProductSelect() {
  const location = useLocation();
  const navigate = useNavigate();

  const value = useMemo(() => {
    const active = products.find((product) =>
      location.pathname.startsWith(product.href),
    );

    return active?.value ?? products[0].value;
  }, [location.pathname]);

  return (
    <Select
      aria-label="Select product"
      value={value}
      onValueChange={(nextValue) => {
        const product = products.find((item) => item.value === nextValue);
        if (product) navigate(product.href);
      }}
    >
      <SelectTrigger size="sm" className="ms-3">
        <SelectValue />
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
