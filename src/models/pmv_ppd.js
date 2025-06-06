import {
  check_standard_compliance_array,
  round,
  units_converter,
  units_converter_array,
  valid_range,
} from "../utilities/utilities.js";
import { cooling_effect } from "./cooling_effect.js";

/**
 * @typedef {Object} Pmv_ppdKwargs
 * @property {'SI'|'IP'} units - select the SI (International System of Units) or the IP (Imperial Units) system.
 * @property { boolean } limit_inputs - Default is True. By default, if the inputs are outside the standard applicability
 *    limits the function returns NaN. If false, returns pmv and ppd values even if input values are outside
 *    the applicability limits of the model.
 *
 *    The ASHRAE 55 2020 limits are 10 < tdb [°C] < 40, 10 < tr [°C] < 40,
 *    0 < vr [m/s] < 2, 1 < met [met] < 4, and 0 < clo [clo] < 1.5.
 *    The ISO 7730 2005 limits are 10 < tdb [°C] < 30, 10 < tr [°C] < 40,
 *    0 < vr [m/s] < 1, 0.8 < met [met] < 4, 0 < clo [clo] < 2, and -2 < PMV < 2.
 * @property { boolean } airspeed_control - This only applies if standard = "ASHRAE".
 *
 *    Default is True. By default, it is assumed that the occupant has control over the airspeed.
 *    In this case, the ASHRAE 55 Standard does not impose any airspeed limits.
 *    On the other hand, if the occupant has no control over the airspeed,
 *    the ASHRAE 55 imposes an upper limit for v which varies as a function of
 *    the operative temperature, for more information please consult the Standard.
 * @public
 */

/**
 * @typedef {Object} Pmv_ppdReturns
 * @property { number } pmv - Predicted Mean Vote
 * @property { number } ppd - Predicted Percentage of Dissatisfied occupants, [%]
 * @public
 */

/**
 * Returns Predicted Mean Vote ( {@link https://en.wikipedia.org/wiki/Thermal_comfort#PMV/PPD_method|PMV} ) and
 * Predicted Percentage of Dissatisfied ( {@link https://en.wikipedia.org/wiki/Thermal_comfort#PMV/PPD_method|PPD} )
 * calculated in accordance with main thermal comfort Standards. The PMV is an index that predicts the mean
 * value of the thermal sensation votes (self-reported perceptions) of a large group of people on a
 * sensation scale expressed from –3 to +3 corresponding to the categories:
 * cold, cool, slightly cool, neutral, slightly warm, warm, and hot. {@link #ref_1|[1]}
 *
 * While the PMV equation is the same for both the ISO and ASHRAE standards, in the
 * ASHRAE 55 PMV equation, the SET is used to calculate the cooling effect first,
 * this is then subtracted from both the air and mean radiant temperatures, and the
 * differences are used as input to the PMV model, while the airspeed is set to 0.1m/s.
 * Please read more in the Note below.
 *
 * Notes:
 *
 * You can use this function to calculate the {@link https://en.wikipedia.org/wiki/Thermal_comfort#PMV/PPD_method|PMV}
 * and {@link https://en.wikipedia.org/wiki/Thermal_comfort#PMV/PPD_method|PPD} in accordance with
 * either the ASHRAE 55 2020 Standard {@link #ref_1|[1]} or the ISO 7730 Standard {@link #ref_2|[2]}.
 *
 * This is a version that supports scalar arguments.
 * @see {@link pmv_ppd_array} for a version that supports arrays.
 *
 * @public
 * @memberof models
 * @docname Predicted Mean Vote (PMV) and Predicted Percentage of Dissatisfied (PPD)
 *
 * @param { number } tdb - dry bulb air temperature, default in [°C] in [°F] if `units` = 'IP'
 * @param { number } tr - mean radiant temperature, default in [°C] in [°F] if `units` = 'IP'
 * @param { number } vr - relative air speed, default in [m/s] in [fps] if `units` = 'IP'
 *
 * Note: vr is the relative air speed caused by body movement and not the air
 * speed measured by the air speed sensor. The relative air speed is the sum of the
 * average air speed measured by the sensor plus the activity-generated air speed
 * (Vag). Where Vag is the activity-generated air speed caused by motion of
 * individual body parts. vr can be calculated using the function `v_relative` which is in .utilities.js.
 * @param { number } rh - relative humidity, [%]
 * @param { number } met - metabolic rate
 * @param { number } clo - clothing insulation
 *
 * Note: The activity as well as the air speed modify the insulation characteristics
 * of the clothing and the adjacent air layer. Consequently, the ISO 7730 states that
 * the clothing insulation shall be corrected {@link #ref_2|[2]}. The ASHRAE 55 Standard corrects
 * for the effect of the body movement for met equal or higher than 1.2 met using
 * the equation clo = Icl × (0.6 + 0.4/met) The dynamic clothing insulation, clo,
 * can be calculated using the function `clo_dynamic` which is in .utilities.js.
 * @param { number } [wme=0] - external work
 * @param { "ISO"|"ASHRAE" } [standard="ISO"] - comfort standard used for calculation
 *
 * · If "ISO", then the ISO Equation is used
 *
 * · If "ASHRAE", then the ASHRAE Equation is used
 *
 * Note: While the PMV equation is the same for both the ISO and ASHRAE standards, the ASHRAE Standard Use of
 * the PMV model is limited to air speeds below 0.10m/s (20 fpm). When air speeds exceed 0.10 m/s (20 fpm), the comfort
 * zone boundaries are adjusted based on the SET model. This change was introduced by the
 * {@link https://www.ashrae.org/file%20library/technical%20resources/standards%20and%20guidelines/standards%20addenda/55_2020_c_20210430.pdf|Addendum_C to Standard 55-2020}
 * @param { Pmv_ppdKwargs }kwargs - additional arguments
 *
 * @returns { Pmv_ppdReturns } - Result of pmv and ppd
 *
 * @example
 * const tdb = 25;
 * const tr = 25;
 * const rh = 50;
 * const v = 0.1;
 * const met = 1.4;
 * const clo = 0.5;
 * // Calculate relative air speed
 * const v_r = v_relative(v, met);
 * // Calculate dynamic clothing
 * const clo_d = clo_dynamic(clo, met);
 * const results = pmv_ppd(tdb, tr, v_r, rh, met, clo_d);
 * console.log(results); // Output: { pmv: 0.06, ppd: 5.1 }
 * console.log(results.pmv); // Output: -0.06
 */
export function pmv_ppd(
  tdb,
  tr,
  vr,
  rh,
  met,
  clo,
  wme = 0,
  standard = "ISO",
  kwargs = {},
) {
  const default_kwargs = {
    units: "SI",
    limit_inputs: true,
    airspeed_control: true,
  };
  kwargs = Object.assign(default_kwargs, kwargs);

  if (kwargs.units && kwargs.units.toUpperCase() === "IP") {
    // Conversion from IP to SI units
    ({ tdb, tr, vr } = units_converter({ tdb, tr, vr }, "IP"));
  }

  if (standard !== "ISO" && standard !== "ASHRAE") {
    throw new Error(
      "PMV calculations can only be performed in compliance with ISO or ASHRAE Standards",
    );
  }

  const {
    tdb: tdb_valid,
    tr: tr_valid,
    v: v_valid,
    met: met_valid,
    clo: clo_valid,
  } = check_standard_compliance_array(standard, {
    tdb: [tdb],
    tr: [tr],
    v: [vr],
    met: [met],
    clo: [clo],
    airspeed_control: kwargs.airspeed_control,
  });
  let ce = 0;
  if (standard === "ASHRAE") {
    //if v_r is higher than 0.1 follow methodology ASHRAE Appendix H, H3
    ce = vr > 0.1 ? cooling_effect(tdb, tr, vr, rh, met, clo, wme).ce : 0;
  }

  tdb = tdb - ce;
  tr = tr - ce;
  vr = ce > 0 ? 0.1 : vr;

  let pmv = pmv_calculation(tdb, tr, vr, rh, met, clo, wme);
  let ppd =
    100.0 -
    95.0 *
      Math.exp(-0.03353 * Math.pow(pmv, 4.0) - 0.2179 * Math.pow(pmv, 2.0));

  // Checks that inputs are within the bounds accepted by the model if not return NaN
  if (kwargs.limit_inputs) {
    const pmv_valid =
      standard === "ASHRAE"
        ? valid_range([pmv], [-100, 100])
        : valid_range([pmv], [-2, 2]); // this is the ISO limit

    if (
      isNaN(pmv) ||
      tdb_valid.includes(NaN) ||
      tr_valid.includes(NaN) ||
      v_valid.includes(NaN) ||
      met_valid.includes(NaN) ||
      clo_valid.includes(NaN) ||
      pmv_valid.includes(NaN)
    ) {
      pmv = NaN;
      ppd = NaN;
    }
  }

  return {
    pmv: round(pmv, 2),
    ppd: round(ppd, 1),
  };
}

/**
 * @typedef {Object} Pmv_ppd_arrayReturns
 * @property { number[] } pmv - Predicted Mean Vote
 * @property { number[] } ppd - Predicted Percentage of Dissatisfied occupants, [%]
 * @public
 */

/**
 * Returns Predicted Mean Vote ( {@link https://en.wikipedia.org/wiki/Thermal_comfort#PMV/PPD_method|PMV} ) and
 * Predicted Percentage of Dissatisfied ( {@link https://en.wikipedia.org/wiki/Thermal_comfort#PMV/PPD_method|PPD} )
 * calculated in accordance with main thermal comfort Standards. The PMV is an index that predicts the mean
 * value of the thermal sensation votes (self-reported perceptions) of a large group of people on a
 * sensation scale expressed from –3 to +3 corresponding to the categories:
 * cold, cool, slightly cool, neutral, slightly warm, warm, and hot. {@link #ref_1|[1]}
 *
 * While the PMV equation is the same for both the ISO and ASHRAE standards, in the
 * ASHRAE 55 PMV equation, the SET is used to calculate the cooling effect first,
 * this is then subtracted from both the air and mean radiant temperatures, and the
 * differences are used as input to the PMV model, while the airspeed is set to 0.1m/s.
 * Please read more in the Note below.
 *
 * Notes:
 *
 * You can use this function to calculate the {@link https://en.wikipedia.org/wiki/Thermal_comfort#PMV/PPD_method|PMV}
 * and {@link https://en.wikipedia.org/wiki/Thermal_comfort#PMV/PPD_method|PPD} in accordance with
 * either the ASHRAE 55 2020 Standard {@link #ref_1|[1]} or the ISO 7730 Standard {@link #ref_2|[2]}.
 *
 * This is a version that supports arrays.
 * @see {@link pmv_ppd} for a version that supports scalar arguments.
 *
 * @public
 * @memberof models
 * @docname Predicted Mean Vote (PMV) and Predicted Percentage of Dissatisfied (PPD) (array version)
 *
 * @param { number[] } tdb - dry bulb air temperature, default in [°C] in [°F] if `units` = 'IP'
 * @param { number[] } tr - mean radiant temperature, default in [°C] in [°F] if `units` = 'IP'
 * @param { number[] } vr - relative air speed, default in [m/s] in [fps] if `units` = 'IP'
 *
 * Note: vr is the relative air speed caused by body movement and not the air
 * speed measured by the air speed sensor. The relative air speed is the sum of the
 * average air speed measured by the sensor plus the activity-generated air speed
 * (Vag). Where Vag is the activity-generated air speed caused by motion of
 * individual body parts. vr can be calculated using the function `v_relative_array` which is in .utilities.js.
 * @param { number[] } rh - relative humidity, [%]
 * @param { number[] } met - metabolic rate, [met]
 * @param { number[] } clo - clothing insulation, [clo]
 *
 * Note: The activity as well as the air speed modify the insulation characteristics
 * of the clothing and the adjacent air layer. Consequently, the ISO 7730 states that
 * the clothing insulation shall be corrected {@link #ref_2|[2]}. The ASHRAE 55 Standard corrects
 * for the effect of the body movement for met equal or higher than 1.2 met using
 * the equation clo = Icl × (0.6 + 0.4/met) The dynamic clothing insulation, clo,
 * can be calculated using the function `clo_dynamic_array` which is in .utilities.js.
 * @param { number[] } wme - external work, default is array of 0
 * @param { "ISO"|"ASHRAE" } [standard="ISO"] - comfort standard used for calculation
 *
 * · If "ISO", then the ISO Equation is used
 *
 * · If "ASHRAE", then the ASHRAE Equation is used
 *
 * Note: While the PMV equation is the same for both the ISO and ASHRAE standards, the ASHRAE Standard Use of
 * the PMV model is limited to air speeds below 0.10m/s (20 fpm). When air speeds exceed 0.10 m/s (20 fpm), the comfort
 * zone boundaries are adjusted based on the SET model. This change was introduced by the
 * {@link https://www.ashrae.org/file%20library/technical%20resources/standards%20and%20guidelines/standards%20addenda/55_2020_c_20210430.pdf|Addendum_C to Standard 55-2020}
 * @param { Pmv_ppdKwargs }kwargs - additional arguments
 *
 * @returns {Pmv_ppd_arrayReturns} - Result of pmv and ppd
 *
 * @example
 * const tdb = [22, 25];
 * const tr = [25, 25];
 * const rh = [50, 50];
 * const v = [0.1, 0.1];
 * const met = [1.4, 1.4];
 * const clo = [0.5, 0.5];
 * // Calculate relative air speed
 * const v_r = v_relative_array(v, met);
 * // Calculate dynamic clothing
 * const clo_d = clo_dynamic_array(clo, met);
 * const arrayResults = pmv_ppd_array(tdb, tr, v_r, rh, met, clo_d);
 * console.log(arrayResults); // Output: { pmv: [-0.47, 0.06], ppd: [9.6, 5.1] }
 * console.log(results.pmv); // Output: [-0.47, 0.06]
 */
export function pmv_ppd_array(
  tdb,
  tr,
  vr,
  rh,
  met,
  clo,
  wme,
  standard = "ISO",
  kwargs = {},
) {
  const default_kwargs = {
    units: "SI",
    limit_inputs: true,
    airspeed_control: true,
  };
  kwargs = Object.assign(default_kwargs, kwargs);

  // default wme is an array of 0
  if (wme === undefined) {
    wme = tdb.map(() => 0);
  }

  if (kwargs.units && kwargs.units === "IP") {
    // Conversion from IP to SI units
    ({ tdb, tr, vr } = units_converter_array({ tdb, tr, vr }, "IP"));
  }

  if (standard !== "ISO" && standard !== "ASHRAE") {
    throw new Error(
      "PMV calculations can only be performed in compliance with ISO or ASHRAE Standards",
    );
  }

  const {
    tdb: tdb_valid,
    tr: tr_valid,
    v: v_valid,
    met: met_valid,
    clo: clo_valid,
  } = check_standard_compliance_array(standard, {
    tdb,
    tr,
    v: vr,
    met,
    clo,
    airspeed_control: kwargs.airspeed_control,
  });

  let ce = [];
  if (standard === "ASHRAE") {
    ce = vr.map((vrValue, i) => {
      //if v_r is higher than 0.1 follow methodology ASHRAE Appendix H, H3
      return vrValue > 0.1
        ? cooling_effect(tdb[i], tr[i], vrValue, rh[i], met[i], clo[i], wme[i])
            .ce
        : 0;
    });
  }

  if (ce.length === 0) {
    for (let i = 0; i < tdb.length; i++) {
      ce[i] = 0;
    }
  }

  for (let i = 0; i < tdb.length; i++) {
    tdb[i] -= ce[i];
    tr[i] -= ce[i];
    if (ce[i] > 0) {
      vr[i] = 0.1;
    }
  }

  const pmv_array = tdb.map((tdbValue, i) =>
    pmv_calculation(tdbValue, tr[i], vr[i], rh[i], met[i], clo[i], wme[i]),
  );

  const ppd_array = pmv_array.map((pmvValue) => {
    return (
      100 -
      95 *
        Math.exp(
          -0.03353 * Math.pow(pmvValue, 4) - 0.2179 * Math.pow(pmvValue, 2),
        )
    );
  });

  // Checks that inputs are within the bounds accepted by the model if not return NaN
  if (kwargs.limit_inputs) {
    const pmv_valid =
      standard === "ASHRAE"
        ? valid_range(pmv_array, [-100, 100])
        : valid_range(pmv_array, [-2, 2]); // this is the ISO limit

    for (let i = 0; i < pmv_array.length; ++i) {
      if (
        isNaN(pmv_array[i]) ||
        isNaN(tdb_valid[i]) ||
        isNaN(tr_valid[i]) ||
        isNaN(v_valid[i]) ||
        isNaN(met_valid[i]) ||
        isNaN(clo_valid[i]) ||
        isNaN(pmv_valid[i])
      ) {
        pmv_array[i] = NaN;
        ppd_array[i] = NaN;
      }
    }
  }

  for (let i = 0; i < pmv_array.length; ++i) {
    pmv_array[i] = round(pmv_array[i], 2);
    ppd_array[i] = round(ppd_array[i], 1);
  }

  return {
    pmv: pmv_array,
    ppd: ppd_array,
  };
}

/**
 * @param {number} tdb
 * @param {number} tr
 * @param {number} vr
 * @param {number} rh
 * @param {number} met
 * @param {number} clo
 * @param {number} wme
 *
 * @returns {number} _pmv
 */
export function pmv_calculation(tdb, tr, vr, rh, met, clo, wme) {
  const pa = rh * 10 * Math.exp(16.6536 - 4030.183 / (tdb + 235));

  const icl = 0.155 * clo; //thermal insulation of the clothing in M2K/W
  const m = met * 58.15; //metabolic rate in W/M2
  const w = wme * 58.15; //external work in W/M2
  const mw = m - w; //internal heat production in the human body

  //calculation of the clothing area factor
  let f_cl;
  if (icl <= 0.078) {
    f_cl = 1 + 1.29 * icl; // ratio of surface clothed body over nude body
  } else {
    f_cl = 1.05 + 0.645 * icl;
  }

  //heat transfer coefficient by forced convection
  const hcf = 12.1 * Math.sqrt(vr);
  let hc = hcf;

  const taa = tdb + 273;
  const tra = tr + 273;
  const t_cla = taa + (35.5 - tdb) / (3.5 * icl + 0.1);

  const p1 = icl * f_cl;
  const p2 = p1 * 3.96;
  const p3 = p1 * 100;
  const p4 = p1 * taa;
  const p5 = 308.7 - 0.028 * mw + p2 * Math.pow(tra / 100.0, 4);
  let xn = t_cla / 100;
  let xf = t_cla / 50;
  const eps = 0.00015;

  let n = 0;

  while (Math.abs(xn - xf) > eps) {
    xf = (xf + xn) / 2;
    let hcn = 2.38 * Math.pow(Math.abs(100.0 * xf - taa), 0.25);
    if (hcf > hcn) {
      hc = hcf;
    } else {
      hc = hcn;
    }
    xn = (p5 + p4 * hc - p2 * Math.pow(xf, 4)) / (100 + p3 * hc);
    n += 1;
    if (n > 150) {
      throw new Error("Max iterations exceeded");
    }
  }

  const tcl = 100 * xn - 273;
  //heat loss diff. through skin
  const hl1 = 3.05 * 0.001 * (5733 - 6.99 * mw - pa);
  //heat loss by sweating
  let hl2;
  if (mw > 58.15) {
    hl2 = 0.42 * (mw - 58.15);
  } else {
    hl2 = 0;
  }
  //latent respiration heat loss
  const hl3 = 1.7 * 0.00001 * m * (5867 - pa);
  //dry respiration heat loss
  const hl4 = 0.0014 * m * (34 - tdb);
  //heat loss by radiation
  const hl5 = 3.96 * f_cl * (Math.pow(xn, 4) - Math.pow(tra / 100.0, 4));
  //heat loss by convection
  const hl6 = f_cl * hc * (tcl - tdb);

  const ts = 0.303 * Math.exp(-0.036 * m) + 0.028;

  return ts * (mw - hl1 - hl2 - hl3 - hl4 - hl5 - hl6);
}
