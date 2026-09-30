// ============================================================
// PASSWORD SECURITY POLICY
// ============================================================
//
// This helper is used whenever a NEW password is created or
// an existing password is changed.
//
// Login does NOT use this function.
//
// During login we only verify the supplied password against
// the stored bcrypt hash.
//
// Keeping password rules in one file prevents different parts
// of the application from accidentally using different rules.
// ============================================================


// ============================================================
// PASSWORD LIMITS
// ============================================================

const PASSWORD_MIN_LENGTH = 12;

const PASSWORD_MAX_LENGTH = 128;


// ============================================================
// VALIDATE PASSWORD
// ============================================================

const validatePassword = (password) => {

  // ----------------------------------------------------------
  // Make sure the value is actually a string
  // ----------------------------------------------------------

  if (typeof password !== "string") {
    return {
      valid: false,
      message: "Password must be a valid string.",
    };
  }


  // ----------------------------------------------------------
  // Minimum length
  // ----------------------------------------------------------

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message:
        `Password must contain at least ` +
        `${PASSWORD_MIN_LENGTH} characters.`,
    };
  }


  // ----------------------------------------------------------
  // Maximum length
  // ----------------------------------------------------------
  //
  // A generous maximum still allows long passphrases while
  // preventing unnecessarily huge request values.
  // ----------------------------------------------------------

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      valid: false,
      message:
        `Password must not exceed ` +
        `${PASSWORD_MAX_LENGTH} characters.`,
    };
  }


  // ----------------------------------------------------------
  // Uppercase letter
  // ----------------------------------------------------------

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message:
        "Password must contain at least one uppercase letter.",
    };
  }


  // ----------------------------------------------------------
  // Lowercase letter
  // ----------------------------------------------------------

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message:
        "Password must contain at least one lowercase letter.",
    };
  }


  // ----------------------------------------------------------
  // Number
  // ----------------------------------------------------------

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message:
        "Password must contain at least one number.",
    };
  }


  // ----------------------------------------------------------
  // Special character
  // ----------------------------------------------------------

  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      valid: false,
      message:
        "Password must contain at least one special character.",
    };
  }


  // ----------------------------------------------------------
  // Password passed all checks
  // ----------------------------------------------------------

  return {
    valid: true,
  };
};


module.exports = {
  validatePassword,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
};