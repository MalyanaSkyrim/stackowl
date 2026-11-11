---
name: react-native-component-layers
description: Split React Native mobile screens into three layers - screen (layout), feature (logic), and presentation (UI). Use ONLY for mobile (React Native / Expo) implementation, NOT for web applications.
---

# React Native Component Layers

Structure mobile screens with three distinct layers for clean separation of concerns.

## When to Use

- Use ONLY for mobile applications (React Native / Expo, e.g., `apps/mobile`)
- Do NOT use for web applications (`apps/web`, `packages/ui`, etc.)
- Use when implementing new mobile screens
- Use when refactoring mobile screens with mixed concerns
- Use when mobile screen code exceeds 100 lines in one file

## Instructions

### The Three-Layer Pattern

**Layer 1: Screen Component** (Layout only)

- File: `app/(auth)/signin.tsx`
- Purpose: Composition and layout structure
- Contains: SafeAreaView, spacing, component imports
- Does NOT contain: Business logic, state, API calls

**Layer 2: Feature Component** (Logic)

- File: `components/auth/SignInForm.tsx`
- Purpose: Business logic and state management
- Contains: Form state, validation, API calls, event handlers
- Does NOT contain: Custom UI building

**Layer 3: Presentation Component** (UI)

- File: `components/auth/AuthScreenHeader.tsx`
- Purpose: Reusable UI elements
- Contains: Props-based rendering, display logic
- Does NOT contain: Business logic, state management

### Example Implementation

**Screen Component:**

```tsx
// app/(auth)/signin.tsx
import { AuthScreenHeader } from '@/components/auth/AuthScreenHeader'
import { SignInForm } from '@/components/auth/SignInForm'
import { View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SignIn() {
  const insets = useSafeAreaInsets()
  const topPadding = Math.max(insets.top, 16)

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <AuthScreenHeader
        title="Welcome Back!"
        description="Sign in to continue"
        style={{ marginTop: topPadding + 16 }}
      />
      <View className="flex-1 px-6">
        <SignInForm />
      </View>
    </SafeAreaView>
  )
}
```

**Feature Component:**

```tsx
// components/auth/SignInForm.tsx
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth'
import { Button, Form, FormInput, Text } from '@starter/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

export const SignInForm = () => {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleSignIn = async (data: SignInFormValues) => {
    // Business logic here
    await signInAPI(data)
  }

  return (
    <Form form={form}>
      <FormInput name="email" control={form.control} label="Email" />
      <FormInput
        name="password"
        control={form.control}
        label="Password"
        secureTextEntry
      />
      <Button onPress={form.handleSubmit(handleSignIn)}>
        <Text>Sign In</Text>
      </Button>
    </Form>
  )
}
```

**Presentation Component:**

```tsx
// components/auth/AuthScreenHeader.tsx
import { View, Text, type ViewStyle } from 'react-native'

interface AuthScreenHeaderProps {
  title: string
  description: string
  style?: ViewStyle
}

export const AuthScreenHeader = ({
  title,
  description,
  style,
}: AuthScreenHeaderProps) => (
  <View className="px-6" style={style}>
    <Text className="mb-2 text-2xl font-bold">{title}</Text>
    <Text className="text-sm text-gray-500">{description}</Text>
  </View>
)
```

### File Structure

```
app/
  (auth)/
    signin.tsx              # Screen layer
components/
  auth/
    SignInForm.tsx          # Feature layer
    AuthScreenHeader.tsx    # Presentation layer
lib/
  validations/
    auth.ts                 # Schemas
```

### When to Split

**Split when:**

- Component exceeds 50 lines
- Logic is reused elsewhere
- Testing needs isolation

**Keep combined when:**

- Component is < 30 lines
- Used only once
- No business logic

### Quick Rules

✅ Screen = Composition only
✅ Feature = Logic + design system components
✅ Presentation = Props in, UI out
❌ Never mix layers

### Icon buttons

Use the kit `Button` with `variant="ghost" size="icon"` and a kit `Icon` inside, never a raw lucide icon in a `Pressable`:

```tsx
<Button
  variant="ghost"
  size="icon"
  accessibilityLabel={t('close')}
  onPress={onClose}>
  <Icon as={X} size={20} className="text-foreground" />
</Button>
```

On iOS a drawn SVG shape takes the touch itself, so taps on the icon's lines never reach the button. The kit `Icon` sets `pointerEvents="none"`; a raw icon needs it too (on the icon or a wrapping `View`).

### When to Ask Questions

Use ask questions tool if unclear on:

- Whether to split a specific component
- Where to place shared components
- Project-specific structure conventions
