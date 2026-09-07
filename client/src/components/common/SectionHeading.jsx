
import React from "react";

const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
}) => {
  return (
    <div
      className={`section-heading section-heading--${align}`}
    >
      {eyebrow && (
        <span className="section-heading__eyebrow">
          {eyebrow}
        </span>
      )}

      {title && (
        <h2 className="section-heading__title">
          {title}
        </h2>
      )}

      {subtitle && (
        <p className="section-heading__subtitle">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
