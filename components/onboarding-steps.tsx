"use client"

import { useOnboarding } from "@/contexts/onboarding.context"
import { FunctionComponent } from "react"

export type OnboardingStepsProps = {
  [key: string]: unknown
}

export const OnboardingSteps: FunctionComponent<OnboardingStepsProps> = () => {
  const onboarding = useOnboarding()
  return (
    <div className="space-y-2 px-2">
      {onboarding.steps.map((step, index) => (
        <div
          className="flex cursor-pointer items-center gap-4 rounded-xl bg-transparent p-4 transition-colors data-[active=false]:cursor-default data-[active=false]:opacity-80 data-[active=true]:bg-primary-foreground/20"
          key={index}
          data-active={index === onboarding.currentStep}
        >
          <span className="flex size-10 items-center justify-center rounded-full border border-primary-foreground bg-primary-foreground/10 font-bold">
            {index + 1}
          </span>
          <div>
            <h3 className="text-lg leading-normal font-semibold">
              {step.title}
            </h3>
            <p className="text-xs leading-normal opacity-70">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
