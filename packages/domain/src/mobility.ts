export type JmaIntensityClass =
  | "4_or_lower"
  | "5_lower"
  | "5_upper"
  | "6_lower"
  | "6_upper"
  | "7";

export type SeismicMobilityConstraint =
  | "normal"
  | "impaired"
  | "severely_impaired"
  | "crawl_or_support";

export function seismicMobilityConstraint(
  intensity: JmaIntensityClass,
): SeismicMobilityConstraint {
  switch (intensity) {
    case "4_or_lower":
    case "5_lower":
      return "normal";
    case "5_upper":
      return "impaired";
    case "6_lower":
      return "severely_impaired";
    case "6_upper":
    case "7":
      return "crawl_or_support";
  }
}
