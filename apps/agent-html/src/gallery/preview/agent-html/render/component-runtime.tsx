import { AspectRatio } from "@/gallery/preview/ui/aspect-ratio"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/gallery/preview/ui/accordion"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/gallery/preview/ui/alert"
import { Badge } from "@/gallery/preview/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/gallery/preview/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/gallery/preview/ui/carousel"
import { Progress } from "@/gallery/preview/ui/progress"
import { Separator } from "@/gallery/preview/ui/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/gallery/preview/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/gallery/preview/ui/tabs"

export const previewComponentRuntime = {
  AspectRatio,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  Progress,
  Separator,
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} as const
