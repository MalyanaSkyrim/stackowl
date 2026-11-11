import { AppError } from '../../errors'

/** Sign-up with an email that already has a confirmed account. */
export class EmailTakenError extends AppError {
  readonly reason = 'EMAIL_TAKEN'
  readonly status = 409
}

/** Unknown email, wrong password, or an Apple or Google-only account. */
export class InvalidCredentialsError extends AppError {
  readonly reason = 'INVALID_CREDENTIALS'
  readonly status = 401
}

/** Sign-in with an unconfirmed email. A new code has already been sent. */
export class UnverifiedEmailError extends AppError {
  readonly reason = 'EMAIL_NOT_VERIFIED'
  readonly status = 403

  constructor(
    /** Seconds before the app may ask for another code. */
    readonly resendInSeconds: number,
    message?: string,
  ) {
    super(message)
  }
}

/** Wrong, expired or already used code. */
export class InvalidCodeError extends AppError {
  readonly reason = 'INVALID_CODE'
  readonly status = 400
}

/** Too many wrong codes: the code is burnt. */
export class TooManyAttemptsError extends AppError {
  readonly reason = 'TOO_MANY_ATTEMPTS'
  readonly status = 429
}

/** A code went out moments ago, or too many in the last hour. */
export class ResendCooldownError extends AppError {
  readonly reason = 'RESEND_COOLDOWN'
  readonly status = 429
}

/** Unknown, revoked or expired session, or a deleted account: sign out. */
export class SessionExpiredError extends AppError {
  readonly reason = 'SESSION_EXPIRED'
  readonly status = 401
}

export class InvalidOAuthTokenError extends AppError {
  readonly reason = 'OAUTH_INVALID_TOKEN'
  readonly status = 401
}

export class OAuthEmailNotVerifiedError extends AppError {
  readonly reason = 'OAUTH_EMAIL_NOT_VERIFIED'
  readonly status = 401
}

export class OAuthNoEmailError extends AppError {
  readonly reason = 'OAUTH_NO_EMAIL'
  readonly status = 400
}

/** The provider's client ids are missing from the environment. */
export class OAuthNotConfiguredError extends AppError {
  readonly reason = 'OAUTH_NOT_CONFIGURED'
  readonly status = 412
}
