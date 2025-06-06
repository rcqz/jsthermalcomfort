import { roundArray, two_nodes, two_nodes_array } from "../models/two_nodes.js";
import {
  check_standard_compliance_array,
  round,
  units_converter,
  units_converter_array,
} from "../utilities/utilities.js";

/**
 * @typedef {Object} SetTmpResult
 * @property {number} set - Standard effective temperature in array, [°C]
 * @public
 */

/**
 * @typedef {Object} SetTmpKwargs - a keywords argument set containing the additional arguments for Standard Effective Temperature calculation
 * @property {boolean} [round=true] - round the result of the SET
 * @property {boolean} [calculate_ce=false] - select if SET is used to calculate Cooling Effect
 * @public
 */

/**
 * @typedef {Object} SetTmpKwargsRequired
 * @property {boolean} round
 * @property {boolean} calculate_ce
 */
/**
 * Calculates the Standard Effective Temperature (SET). The SET is the
 * temperature of a hypothetical isothermal environment at 50% (rh),
 * <0.1 m/s (20 fpm) average air speed (v), and tr = tdb, in which the
 * total heat loss from the skin of an imaginary occupant wearing
 * clothing, standardized for the activity concerned is the same as
 * that from a person in the actual environment with actual clothing
 * and activity level {@link #ref_10|[10]}.
 * @public
 * @memberof models
 * @docname Standard Effective Temperature (SET)
 *
 * @see {@link set_tmp_array} for a version that supports arrays
 *
 * @param {number} tdb Dry bulb air temperature, default in [°C] in [°F] if `units` = 'IP'.
 * @param {number} tr Mean radiant temperature, default in [°C]
 * @param {number} v Air speed, default in [m/s]
 * @param {number} rh Relative humidity, [%].
 * @param {number} met Metabolic rate, [W/(m2)]
 * @param {number} clo Clothing insulation, [clo]
 * @param {number} [wme=0] External work, [W/(m2)] default 0
 * @param {number} [body_surface_area] Body surface area, default value 1.8258 [m2] in [ft2] if units = ‘IP’
 * @param {number} [p_atm] Atmospheric pressure, default value 101325 [Pa] in [atm] if units = ‘IP’
 * @param {"standing" | "sitting"} [body_position="standing"] Select either “sitting” or “standing”
 * @param {"SI" | "IP"} [units="SI"] Select the SI (International System of Units) or the IP (Imperial Units) system.
 * @param {boolean} [limit_inputs=true] By default, if the inputs are outsude the following limits the function returns nan. If False returns values regardless of the input values.
 * @param {SetTmpKwargs} [kwargs]
 * @returns {SetTmpResult} set containing results for the model
 *
 * @example
 * const set = set_tmp(25, 25, 0.1, 50, 1.2, 0.5); // returns {set: 24.3}
 */
export function set_tmp(
  tdb,
  tr,
  v,
  rh,
  met,
  clo,
  wme = 0,
  body_surface_area,
  p_atm,
  body_position = "standing",
  units = "SI",
  limit_inputs = true,
  kwargs = {},
) {
  const defaults_kwargs = {
    calculate_ce: false,
    round: true,
  };

  let joint_kwargs = Object.assign(defaults_kwargs, kwargs);

  if (body_surface_area === undefined)
    body_surface_area = units === "SI" ? 1.8258 : 19.65;
  if (p_atm === undefined) p_atm = units === "SI" ? 101325 : 1;

  if (units === "IP") {
    const unit_convert = units_converter(
      {
        tdb: tdb,
        tr: tr,
        v: v,
        area: body_surface_area,
        pressure: p_atm,
      },
      "IP",
    );
    tdb = unit_convert.tdb;
    tr = unit_convert.tr;
    v = unit_convert.v;
    body_surface_area = unit_convert.area;
    p_atm = unit_convert.pressure;
  }

  let set_tmp = two_nodes(
    tdb,
    tr,
    v,
    rh,
    met,
    clo,
    wme,
    body_surface_area,
    p_atm,
    body_position,
    undefined,
    { round: false, calculate_ce: joint_kwargs.calculate_ce },
  ).set;

  if (units === "IP") {
    ({ tmp: set_tmp } = units_converter({ tmp: set_tmp }, "SI"));
  }

  if (limit_inputs) {
    const {
      tdb: tdb_valid,
      tr: tr_valid,
      v: v_valid,
      met: met_valid,
      clo: clo_valid,
    } = check_standard_compliance_array("ASHRAE", {
      tdb: [tdb],
      tr: [tr],
      v: [v],
      met: [met],
      clo: [clo],
    });

    if (
      isNaN(tdb_valid[0]) ||
      isNaN(tr_valid[0]) ||
      isNaN(v_valid[0]) ||
      isNaN(met_valid[0]) ||
      isNaN(clo_valid[0])
    ) {
      set_tmp = NaN;
    }
  }

  if (joint_kwargs.round) {
    set_tmp = round(set_tmp, 1);
  }
  return { set: set_tmp };
}

/**
 * @typedef {Object} SetTmpArrayKwargs - a keywords argument set containing the additional arguments for SET array calculation
 * @property {boolean} [round=true] - round the result of the SET
 * @property {boolean} [calculate_ce=false] - select if SET array is used to calculate Cooling Effect
 * @public
 */

/**
 * @typedef {Object} SetTmpArrayKwargsRequired
 * @property {boolean} round
 * @property {boolean} calculate_ce
 */
/**
 *
 * Calculates the SET when the input parameters are arrays. The SET is the
 * temperature of a hypothetical isothermal environment at 50% (rh),
 * <0.1 m/s (20 fpm) average air speed (v), and tr = tdb, in which the
 * total heat loss from the skin of an imaginary occupant wearing
 * clothing, standardized for the activity concerned is the same as
 * that from a person in the actual environment with actual clothing
 * and activity level {@link #ref_10|[10]}.
 * @public
 * @memberof models
 * @docname Standard Effective Temperature (SET) (array version)
 *
 * @see {@link set_tmp} for a version that supports scalar arguments
 *
 * @param {number[]} tdbArray Dry bulb air temperature, default in [°C] in [°F] if `units` = 'IP'.
 * @param {number[]} trArray Mean radiant temperature, default in [°C]
 * @param {number[]} vArray Air speed, default in [m/s]
 * @param {number[]} rhArray Relative humidity, [%].
 * @param {number[]} metArray Metabolic rate, [W/(m2)]
 * @param {number[]} cloArray Clothing insulation, [clo]
 * @param {number[]} [wmeArray] External work, [W/(m2)] default 0
 * @param {number[]} [bodySurfaceArray] Body surface area, default value 1.8258 [m2] in [ft2] if units = ‘IP’
 * @param {number[]} [pAtmArray] Atmospheric pressure, default value 101325 [Pa] in [atm] if units = ‘IP’
 * @param {"standing" | "sitting"} bodyPositionArray Select either “sitting” or “standing”
 * @param {"SI" | "IP"} [units="SI"] Select the SI (International System of Units) or the IP (Imperial Units) system.
 * @param {boolean} [limit_inputs=true] By default, if the inputs are outsude the following limits the function returns nan. If False returns values regardless of the input values.
 * @param {SetTmpKwargs} [kwargs]
 * @returns {number[]} SET Array – Standard effective temperature in array, [°C]
 *
 * @example
 * const set = set_tmp_array([25, 25], [25, 25], [0.1, 0.1], [50, 50], [1.2, 1.2], [0.5, 0.5]); // returns [24.3, 24.3]
 */
export function set_tmp_array(
  tdbArray,
  trArray,
  vArray,
  rhArray,
  metArray,
  cloArray,
  wmeArray,
  bodySurfaceArray,
  pAtmArray,
  bodyPositionArray,
  units = "SI",
  limit_inputs = true,
  kwargs = {},
) {
  const defaults_kwargs = {
    calculate_ce: false,
    round: true,
  };

  let joint_kwargs = Object.assign(defaults_kwargs, kwargs);

  if (wmeArray === undefined) {
    wmeArray = tdbArray.map((_) => 0);
  }

  if (bodyPositionArray === undefined) {
    bodyPositionArray = tdbArray.map((_) => "standing");
  }

  if (bodySurfaceArray === undefined)
    bodySurfaceArray = tdbArray.map((_) => (units === "SI" ? 1.8258 : 19.65));
  if (pAtmArray === undefined)
    pAtmArray = tdbArray.map((_) => (units === "SI" ? 101325 : 1));

  if (units === "IP") {
    const unit_convert = units_converter_array(
      {
        tdb: tdbArray,
        tr: trArray,
        v: vArray,
        area: bodySurfaceArray,
        pressure: pAtmArray,
      },
      "IP",
    );
    tdbArray = unit_convert.tdb;
    trArray = unit_convert.tr;
    vArray = unit_convert.v;
    bodySurfaceArray = unit_convert.area;
    pAtmArray = unit_convert.pressure;
  }

  let setArray = two_nodes_array(
    tdbArray,
    trArray,
    vArray,
    rhArray,
    metArray,
    cloArray,
    wmeArray,
    bodySurfaceArray,
    pAtmArray,
    bodyPositionArray,
    undefined,
    { round: false, calculate_ce: joint_kwargs.calculate_ce },
  ).set;

  if (units === "IP") {
    const convertedSet = units_converter_array(
      {
        tmp: setArray,
      },
      "SI",
    );
    setArray = convertedSet.tmp;
  }

  if (limit_inputs) {
    const {
      tdb: tdbValid,
      tr: trValid,
      v: vValid,
      met: metValid,
      clo: cloValid,
    } = check_standard_compliance_array("ASHRAE", {
      tdb: tdbArray,
      tr: trArray,
      v: vArray,
      met: metArray,
      clo: cloArray,
    });

    for (let index = 0; index < tdbArray.length; index++) {
      if (
        isNaN(tdbValid[index]) ||
        isNaN(trValid[index]) ||
        isNaN(vValid[index]) ||
        isNaN(metValid[index]) ||
        isNaN(cloValid[index])
      ) {
        setArray[index] = NaN;
      }
    }
  }

  if (joint_kwargs.round) {
    return roundArray(setArray, 1);
  }
  return setArray;
}
