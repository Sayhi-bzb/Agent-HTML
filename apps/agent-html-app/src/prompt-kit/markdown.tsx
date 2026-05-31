import { PetMarkdownText } from "@/app/pet/ghost/pet-markdown-text"

export type MarkdownProps = {
  children: string
  className?: string
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div className={className}>
      <PetMarkdownText text={children} />
    </div>
  )
}
