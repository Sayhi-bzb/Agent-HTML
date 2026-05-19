# Component Facts Details

Secondary facts generated from `docs/components.md` and shadcn registry/source introspection.

## primitive controls

### Button

- Explicit props on exported parts: `asChild`: `boolean`
- Host elements used by exported parts: `button`
- Risky props exposed by exported parts: `className`, `asChild`
- Dependencies: `radix-ui`

### Input

- Host elements used by exported parts: `input`
- Risky props exposed by exported parts: `className`

### Checkbox

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Switch

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Slider

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Radio Group

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

## field composition

### Field

- Host elements used by exported parts: `fieldset`, `legend`, `div`, `p`
- Risky props exposed by exported parts: `className`
- Registry dependencies: `label`, `separator`

### Input Group

- Host elements used by exported parts: `div`, `span`, `input`, `textarea`
- Risky props exposed by exported parts: `className`
- Registry dependencies: `button`, `input`, `textarea`

### Select

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Combobox

- Explicit props on exported parts: `showTrigger`: `boolean`; `showClear`: `boolean`; `showRemove`: `boolean`
- Risky props exposed by exported parts: `className`
- Dependencies: `@base-ui/react`
- Registry dependencies: `button`, `input-group`

## overlay surfaces

### Dialog

- Explicit props on exported parts: `showCloseButton`: `boolean`
- Host elements used by exported parts: `div`
- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Drawer

- Host elements used by exported parts: `div`
- Risky props exposed by exported parts: `className`
- Dependencies: `vaul`

### Sheet

- Explicit props on exported parts: `showCloseButton`: `boolean`
- Host elements used by exported parts: `div`
- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Popover

- Host elements used by exported parts: `div`, `h2`, `p`
- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Tooltip

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Hover Card

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Dropdown Menu

- Explicit props on exported parts: `inset`: `boolean`
- Host elements used by exported parts: `span`
- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Context Menu

- Explicit props on exported parts: `inset`: `boolean`
- Host elements used by exported parts: `span`
- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

## navigation

### Breadcrumb

- Explicit props on exported parts: `asChild`: `boolean`
- Host elements used by exported parts: `nav`, `ol`, `li`, `a`, `span`
- Risky props exposed by exported parts: `className`, `asChild`
- Dependencies: `radix-ui`

### Pagination

- Host elements used by exported parts: `nav`, `ul`, `li`, `span`
- Risky props exposed by exported parts: `className`
- Registry dependencies: `button`

### Menubar

- Explicit props on exported parts: `inset`: `boolean`
- Host elements used by exported parts: `span`
- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Navigation Menu

- Explicit props on exported parts: `viewport`: `boolean`
- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

## view switchers

### Tabs

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Accordion

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Collapsible

- Dependencies: `radix-ui`

## layout / structure primitives

### Card

- Host elements used by exported parts: `div`
- Risky props exposed by exported parts: `className`

### Resizable

- Explicit props on exported parts: `withHandle`: `boolean`
- Risky props exposed by exported parts: `className`
- Dependencies: `react-resizable-panels@^4`

### Scroll Area

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Separator

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

## app shell

### Sidebar

- Explicit props on exported parts: `defaultOpen`: `boolean`; `open`: `boolean`; `asChild`: `boolean`; `isActive`: `boolean`; `showOnHover`: `boolean`; `showIcon`: `boolean`
- Host elements used by exported parts: `div`, `button`, `main`, `ul`, `li`, `a`
- Risky props exposed by exported parts: `className`, `style`, `asChild`
- Dependencies: `radix-ui`, `class-variance-authority`, `lucide-react`
- Registry dependencies: `button`, `separator`, `sheet`, `tooltip`, `input`, `use-mobile`, `skeleton`

## status / feedback

### Progress

- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Skeleton

- Host elements used by exported parts: `div`
- Risky props exposed by exported parts: `className`

### Spinner

- Host elements used by exported parts: `svg`
- Risky props exposed by exported parts: `className`
- Dependencies: `class-variance-authority`

### Sonner

- Dependencies: `sonner`, `next-themes`

### Empty

- Host elements used by exported parts: `div`, `p`
- Risky props exposed by exported parts: `className`

## data display

### Table

- Host elements used by exported parts: `table`, `thead`, `tbody`, `tfoot`, `tr`, `th`, `td`, `caption`
- Risky props exposed by exported parts: `className`

### Chart

- Explicit props on exported parts: `id`: `string`; `hideLabel`: `boolean`; `hideIndicator`: `boolean`; `nameKey`: `string`; `labelKey`: `string`; `hideIcon`: `boolean`
- Host elements used by exported parts: `div`
- Risky props exposed by exported parts: `className`
- Dependencies: `recharts@3.8.0`, `lucide-react`
- Registry dependencies: `card`

## sequence / media display

### Carousel

- Host elements used by exported parts: `div`
- Risky props exposed by exported parts: `className`
- Dependencies: `embla-carousel-react`
- Registry dependencies: `button`

## content tokens

### Avatar

- Host elements used by exported parts: `span`, `div`
- Risky props exposed by exported parts: `className`
- Dependencies: `radix-ui`

### Badge

- Explicit props on exported parts: `asChild`: `boolean`
- Host elements used by exported parts: `span`
- Risky props exposed by exported parts: `className`, `asChild`
- Dependencies: `radix-ui`

### Kbd

- Host elements used by exported parts: `kbd`, `div`
- Risky props exposed by exported parts: `className`
