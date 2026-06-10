import { OnboardingRegisterDomainForm } from "@/components/forms/onboarding-register-domain.form"

export default function page() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl leading-normal font-bold">Register Domain</h3>
        <p className="text-sm leading-normal opacity-70">
          Add your own domain or buy a new one
        </p>
      </div>
      <OnboardingRegisterDomainForm />
    </div>
  )
}
