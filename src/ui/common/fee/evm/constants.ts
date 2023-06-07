import { parseUnits } from "ethers/lib/utils";

export const MINIMUM_GAS_LIMIT = 21000;

export const defaultPriorityFees = [parseUnits("1", "gwei"), parseUnits("1.5", "gwei"), parseUnits("2.0", "gwei")];
