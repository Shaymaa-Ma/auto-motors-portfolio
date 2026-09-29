import React from "react";

function NotFound() {
  const handleBackHome = () => {
    window.location.hash = "home";
  };

  return (
    <>
      <style>
        {`
          /* =========================================================
             NOT FOUND PAGE
             ========================================================= */

          .not-found-page {
            min-height: 100vh;
            width: 100%;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 40px 20px;

            background:
              radial-gradient(
                circle at 50% 35%,
                rgba(25, 167, 255, 0.08),
                transparent 35%
              ),
              #f4f8fc;

            position: relative;
            overflow: hidden;
          }


          /* =========================================================
             BACKGROUND DECORATION
             ========================================================= */

          .not-found-page::before,
          .not-found-page::after {
            content: "";

            position: absolute;

            border-radius: 50%;

            pointer-events: none;
          }

          .not-found-page::before {
            width: 420px;
            height: 420px;

            top: -220px;
            right: -180px;

            border: 70px solid rgba(8, 120, 209, 0.04);
          }

          .not-found-page::after {
            width: 320px;
            height: 320px;

            bottom: -190px;
            left: -150px;

            border: 60px solid rgba(25, 167, 255, 0.04);
          }


          /* =========================================================
             CONTENT
             ========================================================= */

          .not-found-content {
            width: 100%;
            max-width: 620px;

            text-align: center;

            position: relative;
            z-index: 1;
          }


          /* =========================================================
             404 NUMBER
             ========================================================= */

          .not-found-code {
            margin: 0 0 8px;

            font-size: clamp(6rem, 18vw, 10rem);
            line-height: 0.9;

            font-weight: 800;
            letter-spacing: -0.08em;

            color: #0878d1;

            user-select: none;
          }


          /* =========================================================
             TITLE
             ========================================================= */

          .not-found-content h1 {
            margin: 0 0 16px;

            font-size: clamp(1.8rem, 4vw, 2.6rem);
            line-height: 1.2;

            font-weight: 700;

            color: #071a2b;
          }


          /* =========================================================
             DESCRIPTION
             ========================================================= */

          .not-found-description {
            max-width: 500px;

            margin: 0 auto 30px;

            font-size: 1rem;
            line-height: 1.7;

            color: #5f7285;
          }


          /* =========================================================
             BACK TO HOME BUTTON
             ========================================================= */

          .not-found-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;

            min-height: 46px;

            padding: 11px 22px;

            border: 0;
            border-radius: 7px;

            background: #0878d1;
            color: #ffffff;

            font-size: 0.95rem;
            font-weight: 600;

            cursor: pointer;

            transition:
              background-color 0.2s ease,
              transform 0.2s ease,
              box-shadow 0.2s ease;
          }

          .not-found-button:hover {
            background: #055da5;

            transform: translateY(-2px);

            box-shadow:
              0 8px 20px rgba(8, 120, 209, 0.18);
          }

          .not-found-button:active {
            transform: translateY(0);
          }

          .not-found-button i {
            font-size: 1rem;
          }


          /* =========================================================
             MOBILE
             ========================================================= */

          @media (max-width: 576px) {
            .not-found-page {
              padding: 30px 18px;
            }

            .not-found-code {
              font-size: 7rem;
            }

            .not-found-content h1 {
              font-size: 1.75rem;
            }

            .not-found-description {
              font-size: 0.95rem;
              line-height: 1.6;
            }

            .not-found-button {
              width: 100%;
              max-width: 220px;
            }
          }


          /* =========================================================
             REDUCED MOTION
             ========================================================= */

          @media (prefers-reduced-motion: reduce) {
            .not-found-button {
              transition: none;
            }

            .not-found-button:hover {
              transform: none;
            }
          }
        `}
      </style>

      <main className="not-found-page">
        <div className="not-found-content">
          <p className="not-found-code">404</p>

          <h1>Page Not Found</h1>

          <p className="not-found-description">
            The page you are looking for does not exist or the URL is invalid.
          </p>

          <button
            type="button"
            className="not-found-button"
            onClick={handleBackHome}
          >
            <i className="bi bi-house-door" />
            Back to Home
          </button>
        </div>
      </main>
    </>
  );
}

export default NotFound;