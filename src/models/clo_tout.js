import { round, units_converter } from "../utilities/utilities.js";

/**
 * @typedef {object} CloToutResult
 * @property {number} clo - Representative clothing insulation Icl, [clo]
 * @public
 */

/**
 * Representative clothing insulation Icl as a function of outdoor air
 * temperature at 06:00 a.m {@link #ref_4|[4]}.
 *
 * Note: The ASHRAE 55 2020 states that it is acceptable to determine the
 * clothing insulation Icl using this equation in mechanically conditioned
 * buildings {@link #ref_1|[1]}.
 *
 * @public
 * @memberof models
 * @docname Clothing prediction
 *
 * @see {@link clo_tout_array} for a version that supports arrays
 *
 * @param {number} tout - outdoor air temperature at 06:00 a.m., default in
 * [°C] in [°F] if `units` = 'IP'
 * @param {("IP" | "SI")} units - select the SI (International System of Units)
 * or the IP (Imperial Units) system.
 *
 * @returns {CloToutResult} set containing results for the model
 */
export function clo_tout(tout, units = "SI") {
  const t = units === "IP" ? units_converter({ tmp: tout }).tmp : tout;

  let clo = t < 26 ? 10 ** (-0.1635 - 0.0066 * t) : 0.46;
  clo = t < 5 ? 0.818 - 0.0364 * t : clo;
  clo = t < -5 ? 1 : clo;
  clo = round(clo, 2);

  return { clo_tout: clo };
}

/**
 * Representative clothing insulation Icl as a function of outdoor air
 * temperature at 06:00 a.m {@link #ref_4|[4]}.
 *
 * Note: The ASHRAE 55 2020 states that it is acceptable to determine the
 * clothing insulation Icl using this equation in mechanically conditioned
 * buildings {@link #ref_1|[1]}.
 *
 * @public
 * @memberof models
 * @docname Clothing prediction (array version)
 *
 * @see {@link clo_tout} for a version that supports scalar arguments
 *
 * @param {number[]} tout - outdoor air temperatures at 06:00 a.m., default in
 * [°C] in [°F] if `units` = 'IP'
 * @param {("IP" | "SI")} units  - select the SI (International System of Units)
 * or the IP (Imperial Units) system.
 *
 * @returns {number[]} Representative clothing insulation Icl, [clo]
 */
export function clo_tout_array(tout, units = "SI") {
  return tout.map((t) => clo_tout(t, units));
}
