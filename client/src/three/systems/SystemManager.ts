import { SetupResult } from "@/dojo/setup";
import { EternumGlobalConfig, StructureType } from "@bibliothecadao/eternum";
import {
  Component,
  defineComponentSystem,
  defineQuery,
  getComponentValue,
  HasValue,
  isComponentUpdate,
} from "@dojoengine/recs";
import {
  ArmySystemUpdate,
  BattleSystemUpdate,
  BuildingSystemUpdate,
  StructureSystemUpdate,
  TileSystemUpdate,
} from "./types";
import { HexPosition } from "@/types";
import { getEntityIdFromKeys } from "@dojoengine/utils";

// The SystemManager class is responsible for updating the Three.js models when there are changes in the game state.
// It listens for updates from torii and translates them into a format that can be consumed by the Three.js model managers.
export class SystemManager {
  constructor(private dojo: SetupResult) {}

  private setupSystem<T>(
    component: Component,
    callback: (value: T) => void,
    getUpdate: (update: any) => T | undefined,
    runOnInit: boolean = true,
  ) {
    const handleUpdate = (update: any) => {
      const value = getUpdate(update);
      if (value) callback(value);
    };

    defineComponentSystem(this.dojo.network.world, component, handleUpdate, { runOnInit });
  }

  public get Army() {
    return {
      onUpdate: (callback: (value: ArmySystemUpdate) => void) => {
        this.setupSystem(this.dojo.components.Position, callback, (update: any) => {
          const army = getComponentValue(this.dojo.components.Army, update.entity);
          if (!army) return;

          // filter armies that are in battle
          if (army.battle_id !== 0) return;

          // filter armies that are dead
          const health = getComponentValue(this.dojo.components.Health, update.entity);
          if (!health || health.current / EternumGlobalConfig.troop.healthPrecision === 0n) return;

          const entityOwner = getComponentValue(this.dojo.components.EntityOwner, update.entity);
          const owner = getComponentValue(
            this.dojo.components.Owner,
            getEntityIdFromKeys([BigInt(entityOwner.entity_owner_id)]),
          );
          const isMine = this.isOwner(owner);

          return {
            entityId: army.entity_id,
            hexCoords: this.getHexCoords(update.value),
            isMine,
          };
        });
      },
    };
  }

  public get Structure() {
    return {
      onUpdate: (callback: (value: StructureSystemUpdate) => void) => {
        this.setupSystem(this.dojo.components.Position, callback, (update: any) => {
          const structure = getComponentValue(this.dojo.components.Structure, update.entity);
          if (!structure) return;

          const owner = getComponentValue(this.dojo.components.Owner, update.entity);
          const isMine = this.isOwner(owner);

          const categoryKey = structure.category as keyof typeof StructureType;

          return {
            entityId: structure.entity_id,
            hexCoords: this.getHexCoords(update.value),
            structureType: StructureType[categoryKey],
            isMine,
          };
        });
      },
    };
  }

  public get Battle() {
    return {
      onUpdate: (callback: (value: BattleSystemUpdate) => void) => {
        this.setupSystem(this.dojo.components.Battle, callback, (update: any) => {
          const battle = getComponentValue(this.dojo.components.Battle, update.entity);
          if (!battle) return;

          const position = getComponentValue(this.dojo.components.Position, update.entity);
          if (!position) return;

          return {
            entityId: battle.entity_id,
            hexCoords: { col: position.x, row: position.y },
          };
        });
      },
    };
  }

  public get Tile() {
    return {
      onUpdate: (callback: (value: TileSystemUpdate) => void) => {
        this.setupSystem(this.dojo.components.Tile, callback, (update: any) => {
          if (!update.value[0]) return;

          return { hexCoords: { col: update.value[0]?.col || 0, row: update.value[0]?.row || 0 } };
        });
      },
    };
  }

  public get Buildings() {
    return {
      subscribeToHexUpdates: (hexCoords: HexPosition, callback: (value: BuildingSystemUpdate) => void) => {
        const query = defineQuery([
          HasValue(this.dojo.components.Building, {
            outer_col: hexCoords.col,
            outer_row: hexCoords.row,
          }),
        ]);

        return query.update$.subscribe((update) => {
          if (isComponentUpdate(update, this.dojo.components.Building)) {
            const building = getComponentValue(this.dojo.components.Building, update.entity);
            if (!building) return;

            const innerCol = building.inner_col;
            const innerRow = building.inner_row;
            const buildingType = building.category;

            callback({
              buildingType,
              innerCol,
              innerRow,
            });
          }
        });
      },
    };
  }

  private isOwner(owner: any): boolean {
    return owner?.address === BigInt(this.dojo.network.burnerManager.account?.address || 0);
  }

  private getHexCoords(value: any): { col: number; row: number } {
    return { col: value[0]?.x || 0, row: value[0]?.y || 0 };
  }
}
