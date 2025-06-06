/**
 * @typedef {Object} EPmvResult
 * @property {number} e_pmv - Predicted Mean Vote
 * @public
 */

/**
 * @typedef {Object} E_pmvKwargs
 * @property {'SI'|'IP'} units - select the SI (International System of Units) or the IP (Imperial Units) system.
 * @property { boolean } limit_inputs - Default is True. By default, if the inputs are outside the standard
 *    applicability limits the function returns NaN. If false, returns pmv and ppd values even if input values
 *    are outside the applicability limits of the model.
 *
 *    The ISO 7730 2005 limits are 10 < tdb [°C] < 30, 10 < tr [°C] < 40,
 *    0 < vr [m/s] < 1, 0.8 < met [met] < 4, 0 < clo [clo] < 2, and -2 < PMV < 2.
 * @public
 */

import { EPmvResult } from "../../../../src/models/e_pmv";

/**
 * Returns Adjusted Predicted Mean Votes with Expectancy Factor (ePMV). This index was developed by
 * Fanger, P. O. et al. (2002). In non-air-conditioned buildings in warm climates, occupants may sense
 * the warmth as being less severe than the PMV predicts. The main reason is low expectations, but a
 * metabolic rate that is estimated too high can also contribute to explaining the difference. An extension
 * of the PMV model that includes an expectancy factor is introduced for use in non-air-conditioned buildings
 * in warm climates {@link #ref_26|[26]}.
 *
 * This is a version that supports scalar arguments.
 * @see {@link e_pmv_array} for a version that supports arrays.
 *
 * @public
 * @memberof models
 * @docname Adjusted Predicted Mean Votes with Expectancy Factor (ePMV)
 *
 * @param {number} tdb - Dry bulb air temperature, default in [°C] in [°F] if `units` = 'IP'
 * @param {number} tr - Mean radiant temperature, default in [°C] in [°F] if `units` = 'IP'
 * @param {number} vr - Relative air speed, default in [m/s] in [fps] if `units` = 'IP'
 *
 *   Note: vr is the relative air speed caused by body movement and not the air
 *   speed measured by the air speed sensor. The relative air speed is the sum of the
 *   average air speed measured by the sensor plus the activity-generated air speed
 *   (Vag). Where Vag is the activity-generated air speed caused by motion of
 *   individual body parts. vr can be calculated using the function v_relative in utilities.js.
 * @param {number} rh - Relative humidity, [%]
 * @param {number} met - Metabolic rate, [met]
 * @param {number} clo - Clothing insulation, [clo]
 *
 *   Note: The activity as well as the air speed modify the insulation characteristics
 *   of the clothing and the adjacent air layer. Consequently, the ISO 7730 states that
 *   the clothing insulation shall be corrected {@link #ref_2|[2]}. The ASHRAE 55 Standard corrects
 *   for the effect of the body movement for met equal or higher than 1.2 met using
 *   the equation clo = Icl × (0.6 + 0.4/met) The dynamic clothing insulation, clo,
 *   can be calculated using the function clo_dynamic in utilities.js.
 * @param {number} e_coefficient - expectancy factor
 * @param {number} [wme=0] - External work
 * @param {E_pmvKwargs} [kwargs] - additional arguments
 *
 * @returns {EPmvResult} set containing results for the model
 *
 * @example
 * const tdb = 28;
 * const tr = 28;
 * const v = 0.1;
 * const met = 1.4;
 * const clo = 0.5;
 * // Calculate relative air speed
 * const v_r = v_relative(v, met);
 * // Calculate dynamic clothing
 * const clo_d = clo_dynamic(clo, met);
 * const e_coefficient = 0.6;
 *
 * const result = e_pmv(tdb, tr, v_r, rh, met, clo_d, e_coefficient);
 * console.log(result) // output {e_pmv: 0.51}
 */
export function e_pmv(tdb: number, tr: number, vr: number, rh: number, met: number, clo: number, e_coefficient: number, wme?: number, kwargs?: E_pmvKwargs): EPmvResult;
/**
 * Returns Adjusted Predicted Mean Votes with Expectancy Factor (ePMV). This index was developed by
 * Fanger, P. O. et al. (2002). In non-air-conditioned buildings in warm climates, occupants may sense
 * the warmth as being less severe than the PMV predicts. The main reason is low expectations, but a
 * metabolic rate that is estimated too high can also contribute to explaining the difference. An extension
 * of the PMV model that includes an expectancy factor is introduced for use in non-air-conditioned buildings
 * in warm climates {@link #ref_26|[26]}.
 *
 * This is a version that supports arrays.
 * @see {@link a_pmv} for a version that supports scalar arguments.
 *
 * @public
 * @memberof models
 * @docname Adjusted Predicted Mean Votes with Expectancy Factor (ePMV) (array version)
 *
 * @param {number[]} tdb - Dry bulb air temperature, default in [°C] in [°F] if `units` = 'IP'
 * @param {number[]} tr - Mean radiant temperature, default in [°C] in [°F] if `units` = 'IP'
 * @param {number[]} vr - Relative air speed, default in [m/s] in [fps] if `units` = 'IP'
 *
 *   Note: vr is the relative air speed caused by body movement and not the air
 *   speed measured by the air speed sensor. The relative air speed is the sum of the
 *   average air speed measured by the sensor plus the activity-generated air speed
 *   (Vag). Where Vag is the activity-generated air speed caused by motion of
 *   individual body parts. vr can be calculated using the function v_relative_array in utilities.js.
 * @param {number[]} rh - Relative humidity, [%]
 * @param {number[]} met - Metabolic rate, [met]
 * @param {number[]} clo - Clothing insulation, [clo]
 *
 *   Note: The activity as well as the air speed modify the insulation characteristics
 *   of the clothing and the adjacent air layer. Consequently, the ISO 7730 states that
 *   the clothing insulation shall be corrected {@link #ref_2|[2]}. The ASHRAE 55 Standard corrects
 *   for the effect of the body movement for met equal or higher than 1.2 met using
 *   the equation clo = Icl × (0.6 + 0.4/met) The dynamic clothing insulation, clo,
 *   can be calculated using the function clo_dynamic_array in utilities.js.
 * @param {number[]} e_coefficient - expectancy factor
 * @param {number[]} wme - External work, default is array of 0
 * @param {E_pmvKwargs} [kwargs] - additional arguments
 *
 * @returns {number[]} pmv - Predicted Mean Vote
 *
 * @example
 * const tdb = [24, 30];
 * const tr = [30, 30];
 * const v = [0.22, 0.22];
 * const met = [1.4, 1.4];
 * const clo = [0.5, 0.5];
 * // Calculate relative air speed
 * const v_r = v_relative_array(v, met);
 * // Calculate dynamic clothing
 * const clo_d = clo_dynamic_array(clo, met);
 * const e_coefficient = [0.6, 0.6];
 *
 * const result = e_pmv_array(tdb, tr, v_r, rh, met, clo_d, e_coefficient);
 * console.log(result) // output [0.29, 0.91]
 */
export function e_pmv_array(tdb: number[], tr: number[], vr: number[], rh: number[], met: number[], clo: number[], e_coefficient: number[], wme: number[], kwargs?: E_pmvKwargs): number[];
export type E_pmvKwargs = {
    /**
     * - select the SI (International System of Units) or the IP (Imperial Units) system.
     */
    units: 'SI' | 'IP';
    /**
     * - Default is True. By default, if the inputs are outside the standard
     * applicability limits the function returns NaN. If false, returns pmv and ppd values even if input values
     * are outside the applicability limits of the model.
     *
     * The ISO 7730 2005 limits are 10 < tdb [°C] < 30, 10 < tr [°C] < 40,
     * 0 < vr [m/s] < 1, 0.8 < met [met] < 4, 0 < clo [clo] < 2, and -2 < PMV < 2.
     */
    limit_inputs: boolean;
};
//# sourceMappingURL=e_pmv.d.ts.map