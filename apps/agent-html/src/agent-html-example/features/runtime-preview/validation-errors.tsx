import type { AgentHtmlValidationError } from "@/agent-html"

export function ValidationErrors({
  errors,
}: {
  errors: AgentHtmlValidationError[]
}) {
  return (
    <div className="flex flex-col gap-3">
      {errors.map((error) => (
        <article
          key={`${error.code}:${error.path}`}
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive"
        >
          <p className="text-[length:var(--type-sm)] leading-[var(--type-base-line-height)] font-medium">
            {error.code}
          </p>
          <p className="mt-1 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)]">
            {error.path} - {error.message}
          </p>
        </article>
      ))}
    </div>
  )
}
