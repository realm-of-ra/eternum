import { configManager } from "@/dojo/setup";
import { useDojo } from "@/hooks/context/dojo-context";
import useNextBlockTimestamp from "@/hooks/use-next-block-timestamp";
import { ResourceChip } from "@/ui/components/resources/resource-chip";
import { getEntityIdFromKeys, gramToKg, multiplyByPrecision } from "@/ui/utils/utils";
import { BuildingType, CapacityConfigCategory, ID, RESOURCE_TIERS, StructureType } from "@bibliothecadao/eternum";
import { useComponentValue } from "@dojoengine/react";
import { getComponentValue } from "@dojoengine/recs";
import { useMemo } from "react";

export const EntityResourceTable = ({ entityId }: { entityId: ID | undefined }) => {
  const dojo = useDojo();

  const { currentDefaultTick: tick } = useNextBlockTimestamp();

  const quantity =
    useComponentValue(
      dojo.setup.components.BuildingQuantityv2,
      getEntityIdFromKeys([BigInt(entityId || 0), BigInt(BuildingType.Storehouse)]),
    )?.value || 0;

  const structure = getComponentValue(dojo.setup.components.Structure, getEntityIdFromKeys([BigInt(entityId || 0)]));

  const maxStorehouseCapacityKg = useMemo(() => {
    if (structure?.category !== StructureType[StructureType.Realm]) return Infinity;
    const storehouseCapacityKg = gramToKg(configManager.getCapacityConfig(CapacityConfigCategory.Storehouse));
    return multiplyByPrecision(quantity * storehouseCapacityKg + storehouseCapacityKg);
  }, [quantity, entityId]);

  if (!entityId || entityId === 0) {
    return <div>No Entity Selected</div>;
  }

  return Object.entries(RESOURCE_TIERS).map(([tier, resourceIds]) => {
    const resources = resourceIds.map((resourceId: any) => (
      <ResourceChip
        key={resourceId}
        resourceId={resourceId}
        entityId={entityId}
        maxStorehouseCapacityKg={maxStorehouseCapacityKg}
        tick={tick}
      />
    ));

    return (
      <div key={tier}>
        <div className="grid grid-cols-1 flex-wrap">{resources}</div>
      </div>
    );
  });
};