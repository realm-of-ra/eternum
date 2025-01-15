import { getComponentValue, type Entity } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { uuid } from "@latticexyz/utils";
import { Account, AccountInterface } from "starknet";
import {
  CapacityConfigCategory,
  FELT_CENTER,
  getDirectionBetweenAdjacentHexes,
  getNeighborHexes,
  ResourcesIds,
} from "../constants";
import { ClientComponents } from "../dojo/createClientComponents";
import { EternumProvider } from "../provider";
import { ContractAddress, ID, TravelTypes, type HexPosition } from "../types";
import { multiplyByPrecision } from "../utils";
import { configManager } from "./ConfigManager";
import { ResourceManager } from "./ResourceManager";
import { StaminaManager } from "./StaminaManager";
import { DojoAccount } from "./types";
import { computeExploreFoodCosts, computeTravelFoodCosts, getRemainingCapacity } from "./utils/ArmyMovementUtils";

export class TravelPaths {
  private readonly paths: Map<string, { path: HexPosition[]; isExplored: boolean }>;

  constructor() {
    this.paths = new Map();
  }

  set(key: string, value: { path: HexPosition[]; isExplored: boolean }): void {
    this.paths.set(key, value);
  }

  deleteAll(): void {
    this.paths.clear();
  }

  get(key: string): { path: HexPosition[]; isExplored: boolean } | undefined {
    return this.paths.get(key);
  }

  has(key: string): boolean {
    return this.paths.has(key);
  }

  values(): IterableIterator<{ path: HexPosition[]; isExplored: boolean }> {
    return this.paths.values();
  }

  getHighlightedHexes(): Array<{ col: number; row: number }> {
    return Array.from(this.paths.values()).map(({ path }) => ({
      col: path[path.length - 1].col - FELT_CENTER,
      row: path[path.length - 1].row - FELT_CENTER,
    }));
  }

  isHighlighted(row: number, col: number): boolean {
    return this.paths.has(TravelPaths.posKey({ col: col + FELT_CENTER, row: row + FELT_CENTER }));
  }

  getPaths(): Map<string, { path: HexPosition[]; isExplored: boolean }> {
    return this.paths;
  }

  static posKey(pos: HexPosition, normalized = false): string {
    const col = normalized ? pos.col + FELT_CENTER : pos.col;
    const row = normalized ? pos.row + FELT_CENTER : pos.row;
    return `${col},${row}`;
  }
}

export class ArmyMovementManager {
  private readonly entity: Entity;
  private readonly entityId: ID;
  private readonly fishManager: ResourceManager;
  private readonly wheatManager: ResourceManager;
  private readonly staminaManager: StaminaManager;

  constructor(
    private readonly components: ClientComponents,
    private readonly provider: EternumProvider,
    entityId: ID,
  ) {
    this.entity = getEntityIdFromKeys([BigInt(entityId)]);
    this.entityId = entityId;
    const entityOwnerId = getComponentValue(this.components.EntityOwner, this.entity);
    this.wheatManager = new ResourceManager(this.components, entityOwnerId!.entity_owner_id, ResourcesIds.Wheat);
    this.fishManager = new ResourceManager(this.components, entityOwnerId!.entity_owner_id, ResourcesIds.Fish);
    this.staminaManager = new StaminaManager(this.components, entityId);
  }

  private _canExplore(currentDefaultTick: number, currentArmiesTick: number): boolean {
    const stamina = this.staminaManager.getStamina(currentArmiesTick);

    if (stamina.amount < configManager.getExploreStaminaCost()) {
      return false;
    }

    const entityArmy = getComponentValue(this.components.Army, this.entity);
    const exploreFoodCosts = computeExploreFoodCosts(entityArmy?.troops);
    const { wheat, fish } = this.getFood(currentDefaultTick);

    if (fish < multiplyByPrecision(exploreFoodCosts.fishPayAmount)) {
      return false;
    }
    if (wheat < multiplyByPrecision(exploreFoodCosts.wheatPayAmount)) {
      return false;
    }

    if (this._getArmyRemainingCapacity() < configManager.getExploreReward()) {
      return false;
    }

    return true;
  }

  private readonly _calculateMaxTravelPossible = (currentDefaultTick: number, currentArmiesTick: number) => {
    const stamina = this.staminaManager.getStamina(currentArmiesTick);
    const travelStaminaCost = configManager.getTravelStaminaCost();

    const maxStaminaSteps = travelStaminaCost
      ? Math.floor((stamina.amount || 0) / configManager.getTravelStaminaCost())
      : 999;

    const entityArmy = getComponentValue(this.components.Army, this.entity);
    const travelFoodCosts = computeTravelFoodCosts(entityArmy?.troops);

    const { wheat, fish } = this.getFood(currentDefaultTick);
    const maxTravelWheatSteps = Math.floor(wheat / multiplyByPrecision(travelFoodCosts.wheatPayAmount));
    const maxTravelFishSteps = Math.floor(fish / multiplyByPrecision(travelFoodCosts.fishPayAmount));
    const maxTravelSteps = Math.min(maxTravelWheatSteps, maxTravelFishSteps);
    return Math.min(maxStaminaSteps, maxTravelSteps);
  };

  private readonly _getCurrentPosition = () => {
    const position = getComponentValue(this.components.Position, this.entity);
    return { col: position!.x, row: position!.y };
  };

  public getFood(currentDefaultTick: number) {
    const wheatBalance = this.wheatManager.balance(currentDefaultTick);
    const fishBalance = this.fishManager.balance(currentDefaultTick);

    return {
      wheat: wheatBalance,
      fish: fishBalance,
    };
  }

  public findPaths(
    exploredHexes: Map<number, Set<number>>,
    currentDefaultTick: number,
    currentArmiesTick: number,
  ): TravelPaths {
    const startPos = this._getCurrentPosition();
    const maxHex = this._calculateMaxTravelPossible(currentDefaultTick, currentArmiesTick);
    const canExplore = this._canExplore(currentDefaultTick, currentArmiesTick);

    const priorityQueue: Array<{ position: HexPosition; distance: number; path: HexPosition[] }> = [
      { position: startPos, distance: 0, path: [startPos] },
    ];
    const travelPaths = new TravelPaths();
    const shortestDistances = new Map<string, number>();

    while (priorityQueue.length > 0) {
      priorityQueue.sort((a, b) => a.distance - b.distance); // This makes the queue work as a priority queue
      const { position: current, distance, path } = priorityQueue.shift()!;
      const currentKey = TravelPaths.posKey(current);

      if (!shortestDistances.has(currentKey) || distance < shortestDistances.get(currentKey)!) {
        shortestDistances.set(currentKey, distance);
        const isExplored = exploredHexes.get(current.col - FELT_CENTER)?.has(current.row - FELT_CENTER) || false;
        if (path.length >= 2) {
          travelPaths.set(currentKey, { path, isExplored });
        }
        if (!isExplored) continue;

        const neighbors = getNeighborHexes(current.col, current.row); // This function needs to be defined
        for (const { col, row } of neighbors) {
          const neighborKey = TravelPaths.posKey({ col, row });
          const nextDistance = distance + 1;
          const nextPath = [...path, { col, row }];

          const isExplored = exploredHexes.get(col - FELT_CENTER)?.has(row - FELT_CENTER) || false;
          if ((isExplored && nextDistance <= maxHex) || (!isExplored && canExplore && nextDistance === 1)) {
            if (!shortestDistances.has(neighborKey) || nextDistance < shortestDistances.get(neighborKey)!) {
              priorityQueue.push({ position: { col, row }, distance: nextDistance, path: nextPath });
            }
          }
        }
      }
    }

    return travelPaths;
  }

  public isMine = (address: ContractAddress) => {
    const entityOwner = getComponentValue(this.components.EntityOwner, this.entity);
    let owner = getComponentValue(this.components.Owner, this.entity);
    if (!owner && entityOwner?.entity_owner_id) {
      owner = getComponentValue(this.components.Owner, getEntityIdFromKeys([BigInt(entityOwner.entity_owner_id)]));
    }
    return owner?.address === address;
  };

  private readonly _optimisticStaminaUpdate = (overrideId: string, cost: number, currentArmiesTick: number) => {
    const stamina = this.staminaManager.getStamina(currentArmiesTick);

    // substract the costs
    this.components.Stamina.addOverride(overrideId, {
      entity: this.entity,
      value: {
        entity_id: stamina.entity_id,
        last_refill_tick: stamina.last_refill_tick,
        amount: stamina.amount - cost,
      },
    });
  };

  private readonly _optimisticCapacityUpdate = (overrideId: string, capacity: number) => {
    const currentWeight = getComponentValue(this.components.Weight, this.entity);

    this.components.Weight.addOverride(overrideId, {
      entity: this.entity,
      value: {
        entity_id: this.entityId,
        value: (currentWeight?.value || 0n) + BigInt(capacity),
      },
    });
  };

  private readonly _optimisticTileUpdate = (overrideId: string, col: number, row: number) => {
    const entity = getEntityIdFromKeys([BigInt(col), BigInt(row)]);

    this.components.Tile.addOverride(overrideId, {
      entity,
      value: {
        col,
        row,
        explored_by_id: this.entityId,
        explored_at: BigInt(Math.floor(Date.now() / 1000)),
        biome: "None",
      },
    });
  };

  private readonly _optimisticPositionUpdate = (overrideId: string, col: number, row: number) => {
    this.components.Position.addOverride(overrideId, {
      entity: this.entity,
      value: {
        entity_id: this.entityId,
        x: col,
        y: row,
      },
    });
  };

  private readonly _optimisticArrivalTimeUpdate = (blockTimestamp: number, overrideId: string) => {
    this.components.ArrivalTime.addOverride(overrideId, {
      entity: this.entity,
      value: {
        entity_id: this.entityId,
        arrives_at: BigInt(blockTimestamp || 0),
      },
    });
  };

  private readonly _optimisticExplore = (
    blockTimestamp: number,
    col: number,
    row: number,
    currentArmiesTick: number,
  ) => {
    const overrideId = uuid();

    this._optimisticStaminaUpdate(overrideId, configManager.getExploreStaminaCost(), currentArmiesTick);
    this._optimisticTileUpdate(overrideId, col, row);
    this._optimisticPositionUpdate(overrideId, col, row);
    this._optimisticArrivalTimeUpdate(blockTimestamp, overrideId);
    this._optimisticCapacityUpdate(
      overrideId,
      // all resources you can find have the same weight as wood
      configManager.getExploreReward() * configManager.getResourceWeight(ResourcesIds.Wood),
    );
    this._optimisticFoodCosts(overrideId, TravelTypes.Explore);

    return overrideId;
  };

  private readonly _findDirection = (path: HexPosition[]) => {
    if (path.length !== 2) return undefined;

    const startPos = { col: path[0].col, row: path[0].row };
    const endPos = { col: path[1].col, row: path[1].row };
    return getDirectionBetweenAdjacentHexes(startPos, endPos);
  };

  private readonly _exploreHex = async (
    signer: DojoAccount,
    blockTimestamp: number,
    path: HexPosition[],
    currentArmiesTick: number,
  ) => {
    const direction = this._findDirection(path);
    if (direction === undefined || direction === null) return;

    const overrideId = this._optimisticExplore(blockTimestamp, path[1].col, path[1].row, currentArmiesTick);

    this.provider
      .explore({
        unit_id: this.entityId,
        direction,
        signer,
      })
      .catch((e) => {
        // remove all visual overrides only when the action fails
        this._removeVisualOverride(overrideId);
        this._removeNonVisualOverrides(overrideId);
      })
      .then(() => {
        // remove all non visual overrides
        this._removeNonVisualOverrides(overrideId);
      });
  };

  private readonly _optimisticTravelHex = (
    col: number,
    row: number,
    pathLength: number,
    blockTimestamp: number,
    currentArmiesTick: number,
  ) => {
    const overrideId = uuid();

    this._optimisticStaminaUpdate(overrideId, configManager.getTravelStaminaCost() * pathLength, currentArmiesTick);
    this._optimisticFoodCosts(overrideId, TravelTypes.Travel);
    this._optimisticArrivalTimeUpdate(blockTimestamp, overrideId);

    this.components.Position.addOverride(overrideId, {
      entity: this.entity,
      value: {
        entity_id: this.entityId,
        x: col,
        y: row,
      },
    });
    return overrideId;
  };

  // only remove visual overrides (linked to models on world map) when the action fails
  private readonly _removeVisualOverride = (overrideId: string) => {
    this.components.Tile.removeOverride(overrideId);
    this.components.Position.removeOverride(overrideId);
  };

  // you can remove all non visual overrides when the action fails or succeeds
  private readonly _removeNonVisualOverrides = (overrideId: string) => {
    this.components.Stamina.removeOverride(overrideId);
    this.components.Resource.removeOverride(overrideId);
    this.components.Weight.removeOverride(overrideId);
    this.components.ArrivalTime.removeOverride(overrideId);
  };

  private readonly _optimisticFoodCosts = (overrideId: string, travelType: TravelTypes) => {
    const entityArmy = getComponentValue(this.components.Army, this.entity);
    let costs = { wheatPayAmount: 0, fishPayAmount: 0 };
    if (travelType === TravelTypes.Explore) {
      costs = computeExploreFoodCosts(entityArmy?.troops);
    } else {
      costs = computeTravelFoodCosts(entityArmy?.troops);
    }

    this.wheatManager.optimisticResourceUpdate(overrideId, -BigInt(multiplyByPrecision(costs.wheatPayAmount)));
    this.fishManager.optimisticResourceUpdate(overrideId, -BigInt(multiplyByPrecision(costs.fishPayAmount)));
  };

  private readonly _travelToHex = async (
    signer: Account | AccountInterface,
    path: HexPosition[],
    blockTimestamp: number,
    currentArmiesTick: number,
  ) => {
    const overrideId = this._optimisticTravelHex(
      path[path.length - 1].col,
      path[path.length - 1].row,
      path.length - 1,
      blockTimestamp,
      currentArmiesTick,
    );

    const directions = path
      .map((_, i) => {
        if (path[i + 1] === undefined) return undefined;
        return this._findDirection([
          { col: path[i].col, row: path[i].row },
          { col: path[i + 1].col, row: path[i + 1].row },
        ]);
      })
      .filter((d) => d !== undefined) as number[];

    this.provider
      .travel_hex({
        signer,
        travelling_entity_id: this.entityId,
        directions,
      })
      .catch(() => {
        this._removeVisualOverride(overrideId);
        this._removeNonVisualOverrides(overrideId);
      })
      .then(() => {
        this._removeNonVisualOverrides(overrideId);
      });
  };

  public moveArmy = (
    signer: Account | AccountInterface,
    path: HexPosition[],
    isExplored: boolean,
    blockTimestamp: number,
    currentArmiesTick: number,
  ) => {
    if (!isExplored) {
      this._exploreHex(signer, blockTimestamp, path, currentArmiesTick);
    } else {
      this._travelToHex(signer, path, blockTimestamp, currentArmiesTick);
    }
  };

  private readonly _getArmyRemainingCapacity = () => {
    const armyCapacity = getComponentValue(
      this.components.CapacityConfig,
      getEntityIdFromKeys([BigInt(CapacityConfigCategory.Army)]),
    );
    const armyWeight = getComponentValue(this.components.Weight, this.entity);
    const armyEntity = getComponentValue(this.components.Army, this.entity);

    if (!armyEntity || !armyCapacity) return 0n;

    return getRemainingCapacity(armyEntity, armyCapacity, armyWeight);
  };
}