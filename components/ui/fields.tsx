"use client"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, EyeIcon, EyeOffIcon } from "lucide-react"
import { FunctionComponent, ReactNode, useId, useState } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Field, FieldDescription, FieldError, FieldLabel } from "./field"
import { Input } from "./input"
import { InputDateTime } from "./input-date-time"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./input-otp"
import { InputPhoneFlag } from "./input-phone-flag"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { SelectMultiple } from "./select-multiple"
import { SelectWithSearch } from "./select-with-search"
import { Textarea } from "./textarea"

export type FieldProps = React.ComponentProps<typeof Input> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formReturn: UseFormReturn<any>
  label: ReactNode
  description?: ReactNode
}

export const InputField: FunctionComponent<FieldProps> = ({
  formReturn,
  type,
  description,
  ...props
}) => {
  const id = useId()
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const toggleVisibility = () => setIsVisible((prevState) => !prevState)
  return (
    <Controller
      control={formReturn.control}
      name={props.name || ""}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="w-full">
          <FieldLabel className="block w-full" htmlFor={id}>
            {props.label}
          </FieldLabel>
          <div className="relative">
            {type === "tel" ? (
              <InputPhoneFlag
                value={field.value || ""}
                onChange={field.onChange}
                placeholder={props.placeholder}
              />
            ) : type === "datetime-local" ? (
              <InputDateTime value={field.value} onChange={field.onChange} />
            ) : (
              <Input
                id={id}
                {...props}
                type={
                  type === "password" ? (isVisible ? "text" : "password") : type
                }
                {...field}
                value={field.value || ""}
              />
            )}
            {type === "password" && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 transition-[color,box-shadow] outline-none hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={toggleVisibility}
                aria-label={isVisible ? "Hide password" : "Show password"}
                aria-pressed={isVisible}
                aria-controls="password"
              >
                {isVisible ? (
                  <EyeOffIcon size={16} aria-hidden="true" />
                ) : (
                  <EyeIcon size={16} aria-hidden="true" />
                )}
              </button>
            )}
          </div>

          <FieldDescription>{description}</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export type TextAreaFieldProps = React.ComponentProps<typeof Textarea> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formReturn: UseFormReturn<any>
  label: ReactNode
  description?: ReactNode
}

export const TextareaField: FunctionComponent<TextAreaFieldProps> = ({
  formReturn,
  label,
  description,
  ...props
}) => {
  const id = useId()
  return (
    <Controller
      control={formReturn.control}
      name={props.name || ""}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="w-full">
          <FieldLabel className="block w-full" htmlFor={id}>
            {label}
          </FieldLabel>
          <div className="relative">
            <Textarea id={id} {...props} {...field} value={field.value || ""} />
          </div>
          <FieldDescription>{description}</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export type SelectFieldProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formReturn: UseFormReturn<any>
  label: ReactNode
  description?: ReactNode
  placeholder?: string
  name: string
  items: {
    value: any
    label: string
  }[]
  withSearch?: boolean
  searchPLaceholder?: string
  multiselect?: boolean
}

export const SelectField: FunctionComponent<SelectFieldProps> = ({
  formReturn,
  label,
  description,
  name,
  placeholder,
  items,
  searchPLaceholder,
  withSearch,
  multiselect,
}) => {
  const id = useId()
  return (
    <Controller
      control={formReturn.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="w-full">
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          {withSearch ? (
            <SelectWithSearch
              items={items}
              onValueChange={field.onChange}
              placeholder={placeholder}
              searchPLaceholder={searchPLaceholder}
              value={field.value && field.value.toString()}
            />
          ) : multiselect ? (
            <SelectMultiple
              placeholder={placeholder}
              value={
                field.value
                  ? items.filter((item) => field.value.includes(item.value))
                  : field.value
              }
              items={items}
              onValueChange={(v) => {
                field.onChange(v.map((item) => item.value))
              }}
            />
          ) : (
            <Select
              onValueChange={field.onChange}
              value={field.value && field.value.toString()}
            >
              <SelectTrigger id={id} className="w-full" value={field.value}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent className="w-full max-w-125">
                {items.map((item, key) => (
                  <SelectItem key={key} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <FieldDescription>{description}</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
export type DateFieldProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formReturn: UseFormReturn<any>
  label: ReactNode
  description?: ReactNode
  placeholder?: string
  disabledDates?: ({ startDate: Date; endDate: Date } | Date)[]
  name: string
}

export const DateField: FunctionComponent<DateFieldProps> = ({
  label,
  name,
  formReturn,
  placeholder,
  description,
  disabledDates,
}) => {
  const isDateDisabled = (date: Date) => {
    if (date <= new Date() || date < new Date("1900-01-01")) {
      return true
    }
    if (disabledDates && disabledDates.length > 0) {
      return disabledDates.some((disabledDate) => {
        if (disabledDate instanceof Date) {
          return date.toDateString() === disabledDate.toDateString()
        } else {
          const { startDate, endDate } = disabledDate
          return date >= startDate && date <= endDate
        }
      })
    }
    return false
  }

  return (
    <Controller
      control={formReturn.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="flex flex-col">
          <FieldLabel>{label}</FieldLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "h-9 w-full bg-transparent pr-4 pl-4! text-left font-normal hover:bg-transparent dark:bg-input/30 dark:hover:bg-input/30",
                  !field.value && "text-muted-foreground"
                )}
              >
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  <span>{placeholder}</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
                disabled={isDateDisabled}
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
          <FieldDescription>{description}</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}

export type InputOTPFieldProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formReturn: UseFormReturn<any>
  name: string
  label: ReactNode
  description?: ReactNode
}

export const InputOTPField: FunctionComponent<InputOTPFieldProps> = ({
  formReturn,
  name,
  label,
  description,
}) => {
  return (
    <Controller
      control={formReturn.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="w-full">
          <FieldLabel className="block w-full text-center">{label}</FieldLabel>
          <InputOTP
            containerClassName="justify-center"
            maxLength={6}
            {...field}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>{description}</FieldDescription>
          {fieldState.invalid && (
            <FieldError
              className="w-full text-center"
              errors={[fieldState.error]}
            />
          )}
        </Field>
      )}
    />
  )
}
