/**
 * Formats user input as a Russian phone number: +7 (999) 999-99-99
 * Clean, pure JavaScript without deprecated findDOMNode / react-input-mask
 */
export function formatRussianPhone(val) {
  if (!val) return "";
  const digits = val.replace(/\D/g, "");

  if (!digits || digits === "7" || digits === "8") {
    // If user cleared down to +7 or only 1 digit, allow clearing completely
    return val.length <= 4 ? "" : "+7 (";
  }

  let normalized = digits;
  if (normalized.startsWith("8")) {
    normalized = "7" + normalized.slice(1);
  } else if (!normalized.startsWith("7")) {
    normalized = "7" + normalized;
  }
  normalized = normalized.slice(0, 11);

  let res = "+7 (";
  res += normalized.slice(1, 4);

  if (normalized.length > 4) {
    res += ") " + normalized.slice(4, 7);
  } else if (normalized.length === 4) {
    res += ") ";
  }

  if (normalized.length > 7) {
    res += "-" + normalized.slice(7, 9);
  }

  if (normalized.length > 9) {
    res += "-" + normalized.slice(9, 11);
  }

  return res;
}
