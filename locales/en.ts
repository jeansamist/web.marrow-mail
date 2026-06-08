export default {
  "common.app-name": "AppName",

  "home.ready.title": "Project ready!",
  "home.ready.description": "You may now add components and start building.",
  "home.ready.button-hint": "We've already added the button component for you.",
  "home.ready.button": "Button",
  "home.dark-mode-hint": "(Press d to toggle dark mode)",

  "auth.signUp.page.title": "Start now",
  "auth.signUp.page.description": "Create an account to start using AppName",
  "auth.signUp.meta.title": "Create an account",
  "auth.signUp.meta.description":
    "Sign up for AppName and take control of your finances.",
  "auth.signIn.page.title": "Welcome back",
  "auth.signIn.page.description": "Sign in to your AppName account",
  "auth.signIn.meta.title": "Sign in",
  "auth.signIn.meta.description":
    "Sign in to your AppName account to manage your budget.",
  "auth.verifyEmail.page.title": "Verify your email",
  "auth.verifyEmail.meta.title": "Verify your email",
  "auth.verifyEmail.meta.description":
    "Enter the verification code we sent to your email address.",
  "auth.forgotPassword.page.title": "Forgot your password?",
  "auth.forgotPassword.page.description":
    "Enter your email and we'll send you a reset link",
  "auth.forgotPassword.meta.title": "Forgot your password?",
  "auth.forgotPassword.meta.description":
    "Reset your AppName password by entering your email address.",
  "auth.resetPassword.page.title": "Reset your password",
  "auth.resetPassword.page.description":
    "Enter the token from your email and choose a new password",
  "auth.resetPassword.meta.title": "Reset your password",
  "auth.resetPassword.meta.description":
    "Choose a new password for your AppName account.",

  "auth.signUp.firstName.label": "First name",
  "auth.signUp.firstName.placeholder": "Enter your first name",
  "auth.signUp.lastName.label": "Last name",
  "auth.signUp.lastName.placeholder": "Enter your last name",
  "auth.signUp.email.label": "Email",
  "auth.signUp.email.placeholder": "Enter your email",
  "auth.signUp.password.label": "Password",
  "auth.signUp.password.placeholder": "Enter a password",
  "auth.signUp.submit": "Create account",
  "auth.signUp.signIn.link": "I already have an account",

  "auth.signIn.email.label": "Email",
  "auth.signIn.email.placeholder": "Enter your email",
  "auth.signIn.password.label": "Password",
  "auth.signIn.password.placeholder": "Enter your password",
  "auth.signIn.submit": "Sign in",
  "auth.signIn.signUp.link": "Create an account",
  "auth.signIn.forgotPassword.link": "Forgot your password?",

  "auth.verifyEmail.sent": "We sent an email to",
  "auth.verifyEmail.checkInbox": ": check your mailbox or spams",
  "auth.verifyEmail.code.label": "Verification code",
  "auth.verifyEmail.code.description":
    "Enter the 6-digit code sent to your email address",
  "auth.verifyEmail.submit": "Verify email",
  "auth.verifyEmail.signIn.link": "Back to sign in",

  "auth.forgotPassword.email.label": "Email",
  "auth.forgotPassword.email.placeholder": "Enter your email",
  "auth.forgotPassword.submit": "Send reset link",
  "auth.forgotPassword.signIn.link": "Back to sign in",
  "auth.forgotPassword.success.title": "Check your inbox",
  "auth.forgotPassword.success.description":
    "We sent a password reset link to your email address. Follow the link to reset your password.",

  "auth.resetPassword.email.label": "Email",
  "auth.resetPassword.token.label": "Reset token",
  "auth.resetPassword.token.placeholder": "Enter the token from your email",
  "auth.resetPassword.newPassword.label": "New password",
  "auth.resetPassword.newPassword.placeholder": "Enter your new password",
  "auth.resetPassword.submit": "Reset password",
  "auth.resetPassword.signIn.link": "Back to sign in",

  unknownError: "Something went wrong",
} as const
export type Locale = typeof import("./en").default
export type LocaleKey = keyof Locale
