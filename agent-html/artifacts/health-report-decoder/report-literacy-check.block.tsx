"use client"

import { useMemo, useState } from "react"

import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { StatusBadge } from "../../components/ui/status-badge"

import { labItemByCode } from "./data/report"
import { quizQuestions } from "./data/report-literacy-check"

type QuizResult = {
  label: string
  note: string
  status: "success" | "info" | "warning"
}

function resultForScore(score: number, total: number): QuizResult {
  const ratio = total ? score / total : 0

  if (ratio >= 0.8) {
    return {
      label: "可以准备沟通",
      note: "你已经知道哪些先收好、哪些要复查、哪些要当面问。",
      status: "success",
    }
  }

  if (ratio >= 0.5) {
    return {
      label: "回看报告摘录",
      note: "建议再看一遍报告摘录和这几年变化，再写就诊问题。",
      status: "info",
    }
  }

  return {
    label: "带问题去沟通",
    note: "先把问题、近期背景和旧记录放在一起，再去沟通。",
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
        <Badge variant="secondary">读报告前自查</Badge>
        <h2 className="canvas-text-heading">
          看完以后，确认自己没有只盯着红箭头。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          这些题只检查阅读方式：看范围、看旧记录、记背景、准备问题。
        </p>
      </div>

      <div className="canvas-stack-md">
        <div className="grid gap-6 md:grid-cols-2">
          {quizQuestions.map((question, index) => {
            const selectedAnswer = answers[question.id]
            const isCorrect = selectedAnswer === question.correctOptionId
            const relatedItem = question.relatedCode
              ? labItemByCode(question.relatedCode)
              : null

            return (
              <article
                className="canvas-stack-md min-w-0"
                key={question.id}
              >
                <div className="canvas-wrap-sm items-center">
                  <Badge>{String(index + 1).padStart(2, "0")}</Badge>
                  {relatedItem ? (
                    <Badge variant="outline">{relatedItem.code}</Badge>
                  ) : null}
                  {submitted ? (
                    <StatusBadge status={isCorrect ? "success" : "warning"}>
                      {isCorrect ? "已理解" : "需回看"}
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
        </div>

        <div className="canvas-stack-sm pt-2">
          <div className="canvas-wrap-sm items-center justify-between">
            <div className="canvas-wrap-sm items-center">
              <StatusBadge status={submitted ? result.status : "info"}>
                {submitted ? result.label : "未提交"}
              </StatusBadge>
              <Badge variant="outline">
                已答 {answeredCount} / {quizQuestions.length}
              </Badge>
              {submitted ? (
                <Badge variant="outline">
                  已理解 {score} / {quizQuestions.length}
                </Badge>
              ) : null}
            </div>
            <div className="canvas-wrap-sm">
              <Button
                disabled={answeredCount < quizQuestions.length}
                onClick={() => setSubmitted(true)}
                size="sm"
              >
                检查答案
              </Button>
              <Button
                onClick={() => {
                  setAnswers({})
                  setSubmitted(false)
                }}
                size="sm"
                variant="outline"
              >
                重置
              </Button>
            </div>
          </div>
          <p className="canvas-text-body text-muted-foreground">
            {submitted
              ? result.note
              : "答完所有题后，只显示这份笔记还缺哪一步。"}
          </p>
        </div>
      </div>
    </section>
  )
}
