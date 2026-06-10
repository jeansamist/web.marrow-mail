"use client"
import { createContext, useCallback, useContext, useState } from "react"

type OnboardingContextValue = {
  case?: "case_1" | "case_2"
  currentStep?: number
  steps: {
    title: string
    description: string
    values?: Record<string, unknown>
    onPrev?: () => void
    onNext?: () => void
  }[]
  addStep: (step: {
    title: string
    description: string
    values: Record<string, unknown>
    onPrev: () => void
    onNext: () => void
  }) => void
  setStepValues: (index: number, values: Record<string, unknown>) => void
  editStep: (index: number, step: Partial<Step>) => void
  setCurrentStep: (step: number) => void
  setCase: (c: NonNullable<OnboardingContextValue["case"]>) => void
}
type Step = OnboardingContextValue["steps"][number]

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({
  children,
  steps,
}: {
  children: React.ReactNode
  steps?: Step[]
}) {
  const [_steps, setSteps] = useState<Step[]>(steps || [])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [_case, setCase] = useState<OnboardingContextValue["case"]>()

  const addStep = useCallback((step: Step) => {
    setSteps((prev) => [...prev, step])
  }, [])

  const setStepValues = useCallback((index: number, values: Step["values"]) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, values } : step))
    )
  }, [])

  const editStep = useCallback((index: number, partial: Partial<Step>) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, ...partial } : step))
    )
  }, [])

  return (
    <OnboardingContext.Provider
      value={{
        steps: _steps,
        currentStep,
        case: _case,
        addStep,
        setStepValues,
        editStep,
        setCurrentStep,
        setCase,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx)
    throw new Error("useOnboarding must be used within OnboardingProvider")
  return ctx
}
