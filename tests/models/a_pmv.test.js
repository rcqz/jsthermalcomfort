import { describe, test } from "@jest/globals";
import { a_pmv, a_pmv_array } from "../../src/models/a_pmv.js";
import { testDataUrls } from "./comftest";
import { loadTestData, validateResult } from "./testUtils"; // Use the utils

let returnArray = false;

// use top-level await to load test data before tests are defined.
let { testData, tolerances } = await loadTestData(
  testDataUrls.aPmv,
  returnArray,
);

describe("a_pmv", () => {
  // automatically number each test case
  test.each(testData.data)("Test case #%#", (testCase) => {
    const { inputs, outputs: expectedOutput } = testCase;
    const { tdb, tr, vr, rh, met, clo, a_coefficient, wme } = inputs;

    // choose the appropriate function based on whether any inputs contain arrays
    const hasArrayInput = Object.values(inputs).some((value) =>
      Array.isArray(value),
    );

    const modelResult = hasArrayInput
      ? a_pmv_array(tdb, tr, vr, rh, met, clo, a_coefficient, wme)
      : a_pmv(tdb, tr, vr, rh, met, clo, a_coefficient, wme);

    validateResult(modelResult, expectedOutput, tolerances, inputs);
  });
});
