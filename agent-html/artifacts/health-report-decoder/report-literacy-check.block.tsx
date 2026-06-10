"use client"

import { useMemo, useState } from "react"

import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { StatusBadge } from "../../components/ui/status-badge"

import { labItemByCode, quizQuestions } from "./data"

type QuizResult = {
  label: string
  note: string
  status: "success" | "info" | "warning"
}

function resultForScore(score: number, total: number): QuizResult {
  const ratio = total ? score / total : 0

  if (ratio >= 0.8) {
    return {
      label: "Ready to discuss",
      note: "你已经能把红箭头、参考范围、趋势和沟通问题分开处理。",
      status: "success",
    }
  }

  if (ratio >= 0.5) {
    return {
      label: "Review the report lanes",
      note: "建议回看 raw report、triage lanes 和 trend view，再整理医生问题。",
      status: "info",
    }
  }

  return {
    label: "Bring questions to clinician",
    note: "先不要急着解释结果，把问题、背景和历史记录带去沟通。",
    status: "warning",
  }
}

export function ReportLiteracyCheckBlock() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const score = useMemo(
    () =>
      quizQuestions.filter(
        (question) => answers[question.id] === question.correctOptionId
      ).length,
    [answers]
  )
  const answeredCount = Object.keys(answers).length
  const result = resultForScore(score, quizQuestions.length)

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">report literacy check</Badge>
        <h2 className="canvas-text-heading">
          测一测你是否真的读懂了这份报告。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          这不是健康风险评分。它只检查你是否知道如何阅读红箭头、参考范围、趋势和医生沟通线索。
        </p>
      </div>

      <div className="rounded-md border bg-background p-4">
        <div className="canvas-stack-md">
          {quizQuestions.map((question, index) => {
            const selectedAnswer = answers[question.id]
            const isCorrect = selectedAnswer === question.correctOptionId
            const relatedItem = question.relatedCode
              ? labItemByCode(question.relatedCode)
              : null

            return (
              <article
                className="canvas-stack-md border-b pb-5 last:border-b-0 last:pb-0"
                key={question.id}
              >
                <div className="canvas-wrap-sm items-center">
                  <Badge>{String(index + 1).padStart(2, "0")}</Badge>
                  {relatedItem ? (
                    <Badge variant="outline">{relatedItem.code}</Badge>
                  ) : null}
                  {submitted ? (
                    <StatusBadge status={isCorrect ? "success" : "warning"}>
                      {isCorrect ? "understood" : "needs review"}
                    </StatusBadge>
                  ) : null}
                </div>

                <div className="canvas-stack-sm">
                  <h3 className="canvas-text-body">{question.prompt}</h3>
                  <RadioGroup
                    onValueChange={(value) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: value,
                      }))
                    }
                    value={selectedAnswer}
                  >
                    {question.options.map((option) => (
                      <label
                        className="canvas-cluster-sm items-start py-2"
                        key={option.id}
                      >
                        <RadioGroupItem value={option.id} />
                        <span className="canvas-text-body">{option.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {submitted ? (
                  <p className="canvas-text-caption text-muted-foreground">
                    {question.explanation}
                  </p>
                ) : null}
              </article>
            )
          })}
          <div className="canvas-stack-sm border-t pt-4">
            <div className="canvas-wrap-sm items-center justify-between">
              <div className="canvas-wrap-sm items-center">
                <StatusBadge status={submitted ? result.status : "info"}>
                  {submitted ? result.label : "not submitted"}
                </StatusBadge>
                <Badge variant="outline">
                  {answeredCount} / {quizQuestions.length} answered
                </Badge>
                {submitted ? (
                  <Badge variant="outline">
                    {score} / {quizQuestions.length} understood
                  </Badge>
                ) : null}
              </div>
              <div className="canvas-wrap-sm">
                <Button
                  disabled={answeredCount < quizQuestions.length}
                  onClick={() => setSubmitted(true)}
                  size="sm"
                >
                  Check answers
                </Button>
                <Button
                  onClick={() => {
                    setAnswers({})
                    setSubmitted(false)
                  }}
                  size="sm"
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </div>
            <p className="canvas-text-body text-muted-foreground">
              {submitted
                ? result.note
                : "答完所有题后，结果只会显示理解准备度，不会输出医学结论。"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
