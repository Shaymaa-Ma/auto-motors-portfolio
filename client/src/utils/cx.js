// Join class names, skipping falsy values — a tiny classnames/clsx
// replacement so we don't add a dependency just for this.
export const cx = (...classes) => classes.filter(Boolean).join(" ");