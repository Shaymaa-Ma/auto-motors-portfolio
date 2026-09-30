const crypto = require("crypto");


// ============================================================
// BROWSER ID VALIDATION
// ============================================================
//
// The Browser ID is NOT a fingerprint.
//
// It is simply a random, meaningless identifier generated
// by our server and stored in an HttpOnly cookie.
//
// Example:
//
// Browser A → 7f3c...a91
// Browser B → 21ab...e82
//
// The ID does not contain:
// - email
// - password
// - user ID
// - IP address
// - personal information
//
// Its only purpose is to identify the same browser between
// login requests so we can apply a per-browser login limit.
// ============================================================

const BROWSER_ID_REGEX =
  /^[0-9a-f]{64}$/i;


// ============================================================
// ENSURE BROWSER ID
// ============================================================
//
// This middleware runs before the login rate limiters.
//
// If the browser already has a valid ID, we reuse it.
//
// If it does not have one, we generate a new cryptographically
// random ID and send it to the browser.
//
// Because the cookie is HttpOnly, normal frontend JavaScript
// cannot read or modify it.
// ============================================================

const ensureBrowserId = (req, res, next) => {
  let browserId =
    req.cookies?.login_browser_id;


  // ----------------------------------------------------------
  // Check whether the browser already has a valid ID
  // ----------------------------------------------------------

  if (
    !browserId ||
    !BROWSER_ID_REGEX.test(browserId)
  ) {
    // Generate 32 cryptographically secure random bytes.
    //
    // 32 bytes = 256 bits of randomness.
    //
    // This is much stronger than using a predictable ID.
    browserId =
      crypto.randomBytes(32).toString("hex");


    const isProduction =
      process.env.NODE_ENV === "production";


    // --------------------------------------------------------
    // Store the Browser ID in a secure cookie
    // --------------------------------------------------------

    res.cookie(
      "login_browser_id",
      browserId,
      {
        // JavaScript cannot access this cookie.
        httpOnly: true,

        // HTTPS is required in production.
        secure: isProduction,

        // Your admin frontend and API may be on different
        // domains in production, so SameSite=None is used
        // there. Browsers require Secure when using None.
        sameSite:
          isProduction
            ? "none"
            : "lax",

        // The cookie is available to the whole application.
        path: "/",

        // The browser ID can remain for one year.
        //
        // This is NOT an authentication token.
        // It only identifies this browser for throttling.
        maxAge:
          365 *
          24 *
          60 *
          60 *
          1000,
      }
    );
  }


  // ----------------------------------------------------------
  // Make the ID immediately available to later middleware
  // ----------------------------------------------------------
  //
  // This is important because the login rate limiter runs
  // immediately after this middleware.
  //

  req.browserId = browserId;


  next();
};


module.exports = {
  ensureBrowserId,
};