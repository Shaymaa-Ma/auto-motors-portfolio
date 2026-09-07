export const ICON_OPTIONS = {
  services: [
    { key: "car", label: "Car", className: "bi-car-front" },
    { key: "battery", label: "Battery", className: "bi-battery-full" },
    { key: "oil", label: "Lubricants", className: "bi-droplet" },
    { key: "truck", label: "Truck", className: "bi-truck" },
    { key: "boxes", label: "Wholesale", className: "bi-boxes" },
  ],

  advantages: [
    { key: "award", label: "Quality", className: "bi-award" },
    { key: "shield", label: "Reliable", className: "bi-shield-check" },
    { key: "currency", label: "Competitive Price", className: "bi-currency-dollar" },
    { key: "boxes", label: "Wide Range", className: "bi-boxes" },
    { key: "truck", label: "Distribution", className: "bi-truck" },
  ],

  social: [
    { key: "facebook", label: "Facebook", className: "bi-facebook" },
    { key: "instagram", label: "Instagram", className: "bi-instagram" },
    { key: "whatsapp", label: "WhatsApp", className: "bi-whatsapp" },
    { key: "linkedin", label: "LinkedIn", className: "bi-linkedin" },
    { key: "youtube", label: "YouTube", className: "bi-youtube" },
  ],
};

export const getIconClass = (section, key) => {
  const icon = ICON_OPTIONS[section]?.find(
    (item) => item.key === key
  );

  return icon?.className || "bi-check-circle";
};