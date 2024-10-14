import { CapacityConfigCategory, ResourcesIds } from ".";

export const EternumGlobalConfig = {
  stamina: {
    travelCost: 10,
    exploreCost: 20,
  },
  resources: {
    resourcePrecision: 1000,
    resourceMultiplier: 1000,
    resourceAmountPerTick: 10,
    startingResourcesInputProductionFactor: 4,
  },
  banks: {
    name: "Central Bank",
    lordsCost: 1000,
    lpFeesNumerator: 15,
    lpFeesDenominator: 100, // %
    ownerFeesNumerator: 15,
    ownerFeesDenominator: 100, // %
    ownerBridgeFeeOnDepositPercent: 1000, // 10 % using scale of 10_000
    ownerBridgeFeeOnWithdrawalPercent: 1000, // 10 % using scale of 10_000
  },
  populationCapacity: {
    workerHuts: 5,
  },
  exploration: {
    reward: 750,
    shardsMinesFailProbability: 99000,
  },
  tick: {
    defaultTickIntervalInSeconds: 1,
    armiesTickIntervalInSeconds: 3600, // 1 hour
  },
  carryCapacityGram: {
    [CapacityConfigCategory.None]: 0,
    [CapacityConfigCategory.Structure]: BigInt(2) ** BigInt(128) - BigInt(1),
    [CapacityConfigCategory.Donkey]: 400_000,
    [CapacityConfigCategory.Army]: 10_000,
    [CapacityConfigCategory.Storehouse]: 3_000_000_000,
  },
  speed: {
    donkey: 6,
    army: 1,
  },
  battle: {
    graceTickCount: 24,
    delaySeconds: 8 * 60 * 60,
  },
  troop: {
    health: 1,
    knightStrength: 1,
    paladinStrength: 1,
    crossbowmanStrength: 1,
    advantagePercent: 1000,
    disadvantagePercent: 1000,
    maxTroopCount: 500_000,
    baseArmyNumberForStructure: 3,
    armyExtraPerMilitaryBuilding: 1,
    // max attacking armies per structure = 6 + 1 defensive army
    maxArmiesPerStructure: 7, // 3 + (3 * 1) = 7 // so they get benefits from at most 3 military buildings
    // By setting the divisor to 8, the max health that can be taken from the weaker army
    // during pillage is 100 / 8 = 12.5% . Adjust this value to change that.
    //
    // The closer the armies are in strength and health, the closer they both
    // get to losing 12.5% each. If an army is far stronger than the order,
    // they lose a small precentage (it goes closer to 0% health loss) while the
    // weak army's loss is closer to 12.5%
    pillageHealthDivisor: 8,

    // 25%
    battleLeaveSlashNum: 25,
    battleLeaveSlashDenom: 100,
    // 1_000. multiply this number by 2 to reduce battle time by 2x,
    // and reduce by 2x to increase battle time by 2x, etc
    battleTimeReductionScale: 1_000,
  },
  mercenaries: {
    troops: {
      knight_count: 1000,
      paladin_count: 1000,
      crossbowman_count: 1000,
    },
    rewards: [
      { resource: ResourcesIds.Wheat, amount: 100 },
      { resource: ResourcesIds.Fish, amount: 200 },
    ],
  },
  settlement: {
    radius: 2000,
    angle_scaled: 0,
    center: 2147483646,
    min_distance: 10,
    max_distance: 30,
    min_scaling_factor_scaled: 1844674407370955161n,
    min_angle_increase: 10,
    max_angle_increase: 40,
  },
};

export const FELT_CENTER = 2147483646;
export const WORLD_CONFIG_ID = 999999999n;
export const HYPERSTRUCTURE_CONFIG_ID = 999999992n;
export const U32_MAX = 4294967295;
export const MAX_NAME_LENGTH = 31;
export const ONE_MONTH = 2628000;

// Buildings
export const BASE_POPULATION_CAPACITY = 5;
export const BUILDING_FIXED_COST_SCALE_PERCENT = 5_000; // 5_000/10_000 = 50%
// Points
export const HYPERSTRUCTURE_POINTS_PER_CYCLE = 10;
export const HYPERSTRUCTURE_POINTS_ON_COMPLETION = 2_000_000; // about the amount of points generated by the structure in 2 days
export const HYPERSTRUCTURE_TIME_BETWEEN_SHARES_CHANGE_S = 17280; // 2 days
export const HYPERSTRUCTURE_POINTS_FOR_WIN = 6_320_000;

// Entity Types
export const DONKEY_ENTITY_TYPE = 256;
export const REALM_ENTITY_TYPE = 257;
export const ARMY_ENTITY_TYPE = 258;

export const STAMINA_REFILL_PER_TICK = 20;
