---
name: react-native-forms
description: Set up and handle React Native mobile forms with React Hook Form, Zod validation, submission, and error handling. Use ONLY for mobile applications, NOT for web applications.
---

# React Native Forms

Complete guide for mobile forms with React Hook Form and Zod validation.

## When to Use

- Use ONLY for mobile applications (React Native / Expo, e.g., `apps/mobile`)
- Do NOT use for web applications (`apps/web`, `packages/ui`, etc.)
- Use when creating any form in mobile app
- Use when adding validation in mobile app
- Use when handling form submission and errors in mobile app

## Instructions

### Setup (3 Steps)

**Step 1: Install dependencies**

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

**Step 2: Create validation schema in `lib/validations/`**

```tsx
// lib/validations/auth.ts
import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type SignInFormValues = z.infer<typeof signInSchema>
```

**Step 3: Initialize form with useForm**

```tsx
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

const form = useForm<SignInFormValues>({
  resolver: zodResolver(signInSchema),
  defaultValues: { email: '', password: '' },
})
```

### Build Form UI

**Always use the kit's FormInput** (from `@starter/ui`, the universal kit shared with web):

```tsx
import { Button, Form, FormInput, Text } from '@starter/ui'

;<Form form={form}>
  <FormInput
    name="email"
    control={form.control}
    label="Email"
    placeholder="Enter email"
    keyboardType="email-address"
    autoCapitalize="none"
  />

  <FormInput
    name="password"
    control={form.control}
    label="Password"
    secureTextEntry
  />

  <Button onPress={form.handleSubmit(handleSubmit)}>
    <Text>Submit</Text>
  </Button>
</Form>
```

### Form Submission

**Always disabled and loading while busy.** From the tap until the request ends (`form.formState.isSubmitting`, then the mutation's `isPending`), the submit button is disabled and shows the kit spinner (`loading`). It is also disabled while the form is invalid.

```tsx
const signUp = useMutation(
  trpc.auth.signUp.mutationOptions({
    onSuccess: openCodeScreen,
    onError: () => form.setError('root', { message: t('errors.UNKNOWN') }),
  }),
)

// Checked against the schema, so the button stays disabled until the form is valid.
const values = useWatch({ control: form.control })
const canSubmit = schema.safeParse(values).success
const isBusy = form.formState.isSubmitting || signUp.isPending

;<Button
  disabled={!canSubmit || isBusy}
  loading={isBusy}
  onPress={form.handleSubmit((data) => signUp.mutate(data))}
>
  <Text>{t('submit')}</Text>
</Button>
```

Use `mode: 'onTouched'` in `useForm` with a disabled-while-invalid button, so each field shows its error once the user leaves it (the user can't tap the button to reveal them). Full example: `src/components/auth/EmailAuthForm.tsx`.

### Error Handling

**Form-level errors:**

```tsx
// Set error
form.setError('root', { message: 'Invalid credentials' })

// Display error
const rootError = form.formState.errors.root?.message
{
  rootError && <Text className="text-red-500">{rootError}</Text>
}
```

**Map API errors to fields:**

```tsx
catch (error) {
  if (error.response?.data?.errors) {
    Object.entries(error.response.data.errors).forEach(([field, message]) => {
      form.setError(field as keyof FormValues, {
        type: 'manual',
        message: message as string,
      });
    });
  } else {
    form.setError('root', { message: 'Unexpected error' });
  }
}
```

### Common Patterns

**Password toggle:**

```tsx
;<FormInput
  name="password"
  control={form.control}
  secureTextEntry
  enablePasswordToggle
/>
```

**Conditional fields:**

```tsx
const userType = form.watch('userType')

{
  userType === 'business' && (
    <FormInput name="companyName" control={form.control} label="Company" />
  )
}
```

**Multi-step forms:**

```tsx
const [step, setStep] = useState(1)

const handleNext = async () => {
  const isValid = await form.trigger(['email', 'password'])
  if (isValid) setStep(2)
}

{
  step === 1 && (
    <>
      <FormInput name="email" control={form.control} />
      <Button onPress={handleNext}>
        <Text>Next</Text>
      </Button>
    </>
  )
}

{
  step === 2 && (
    <>
      <FormInput name="name" control={form.control} />
      <Button onPress={form.handleSubmit(handleSubmit)}>
        <Text>Submit</Text>
      </Button>
    </>
  )
}
```

**Reset form:**

```tsx
form.reset() // Reset to defaults
form.reset({ email: 'new@email.com' }) // Reset to specific values
```

### Common Validation Patterns

```tsx
// Required
field: z.string().min(1, 'Required')

// Email
email: z.string().email('Invalid email')

// Number range
age: z.number().min(18).max(120)

// Optional
bio: z.string().optional()

// Enum
role: z.enum(['user', 'admin'])

// Custom regex
username: z.string().regex(/^[a-zA-Z0-9_]+$/, 'Invalid username')

// Dependent validation
const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
```

### FormInput Props

**Required:**

- `name` - Field name matching schema
- `control` - Form control object

**Common:**

- `label` - Field label
- `placeholder` - Input placeholder
- `keyboardType` - `email-address`, `numeric`, `phone-pad`, `url`
- `secureTextEntry` - Password fields
- `autoCapitalize` - `none`, `words`, `sentences`
- `leftIcon` / `rightIcon` - a lucide-react-native icon
- `enablePasswordToggle` - eye button for `secureTextEntry` fields
- `size` - `default` (48px) or `sm` (40px)
- `description` - help text under the field

For other controls (Switch, RadioGroup, ToggleGroup, OtpInput), use
`FormField` with `FormItem`, `FormLabel` and `FormMessage`, or the ready-made
`FormOtpInput`.

### Quick Rules

✅ Define schemas in `lib/validations/`
✅ Use `zodResolver` with `useForm`
✅ Initialize all fields in `defaultValues`
✅ Use FormInput and the other form components from `@starter/ui`
✅ Use `form.handleSubmit()` for submission
✅ Disable the submit button and show `loading` while the form submits or its request is pending (`isSubmitting || isPending`)
✅ Disable the submit button while the form is invalid
✅ Handle both field and form-level errors
❌ Never create custom input components (add to the kit instead, with a story)
❌ Never manually validate with useState
❌ Never skip error handling

### Common Issues

**Form not validating:**

- Check `resolver: zodResolver(schema)` is set
- Verify field `name` matches schema key

**Submit not working:**

- Use `form.handleSubmit(handler)` not just `handler`

**Errors not showing:**

- Ensure FormInput has `control` prop

**Default values ignored:**

- Set in `useForm` config, not after mount
- Initialize ALL fields (even optional as empty strings)

### When to Ask Questions

Use ask questions tool if unclear on:

- Specific validation rules
- API error response format
- Multi-step form flow details
