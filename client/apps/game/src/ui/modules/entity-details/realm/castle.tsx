import { configManager } from "@/dojo/setup";
import { useDojo } from "@/hooks/context/dojo-context";
import { useStructureByEntityId } from "@/hooks/helpers/use-structures";
import useUIStore from "@/hooks/store/use-ui-store";
import { RealmResourcesIO } from "@/ui/components/resources/realm-resources-io";
import Button from "@/ui/elements/button";
import { ResourceCost } from "@/ui/elements/resource-cost";
import { divideByPrecision, getEntityIdFromKeys } from "@/ui/utils/utils";
import { getRealmInfo } from "@/utils/realm";
import { getBalance } from "@/utils/resources";
import {
  ContractAddress,
  LEVEL_DESCRIPTIONS,
  REALM_MAX_LEVEL,
  RealmLevels,
  StructureType,
} from "@bibliothecadao/eternum";
import { useMemo, useState } from "react";

export const Castle = () => {
  const dojo = useDojo();

  const structureEntityId = useUIStore((state) => state.structureEntityId);

  const [isLoading, setIsLoading] = useState(false);

  const realmInfo = useMemo(
    () => getRealmInfo(getEntityIdFromKeys([BigInt(structureEntityId)]), dojo.setup.components),
    [structureEntityId, dojo.setup.components],
  );

  const structure = useStructureByEntityId(structureEntityId);

  const getNextRealmLevel = useMemo(() => {
    if (!realmInfo) return null;
    const nextLevel = realmInfo.level + 1;
    return nextLevel < REALM_MAX_LEVEL ? nextLevel : null;
  }, [realmInfo]);

  const checkBalance = useMemo(() => {
    if (!getNextRealmLevel) return false;

    const cost = configManager.realmUpgradeCosts[getNextRealmLevel];

    return Object.keys(cost).every((resourceId) => {
      const resourceCost = cost[Number(resourceId)];
      const balance = getBalance(structureEntityId, resourceCost.resource, dojo.setup.components);
      return divideByPrecision(balance.balance) >= resourceCost.amount;
    });
  }, [getBalance, structureEntityId]);

  const levelUpRealm = async () => {
    setIsLoading(true);
    if (!realmInfo) return;

    await dojo.setup.systemCalls.upgrade_realm({
      signer: dojo.account.account,
      realm_entity_id: realmInfo.entityId,
    });
    setIsLoading(false);
  };

  if (!realmInfo) return null;
  const isOwner = realmInfo.owner === ContractAddress(dojo.account.account.address);

  return (
    structure && (
      <div className="castle-selector w-full text-sm">
        <div className="p-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-4">
                <div className="text-2xl">{RealmLevels[realmInfo.level]}</div>
                {getNextRealmLevel && isOwner && (
                  <Button variant="outline" disabled={!checkBalance} isLoading={isLoading} onClick={levelUpRealm}>
                    {checkBalance ? `Upgrade to ${RealmLevels[getNextRealmLevel]}` : "Need Resources"}
                  </Button>
                )}
              </div>
              {getNextRealmLevel && isOwner && (
                <div className="mt-4">
                  <p className="text-sm mb-4">
                    Next Level: {RealmLevels[realmInfo.level + 1]},{" "}
                    {LEVEL_DESCRIPTIONS[(realmInfo.level + 1) as keyof typeof LEVEL_DESCRIPTIONS]}
                  </p>
                  <div className="mb-2 font-semibold uppercase">Upgrade Cost to {RealmLevels[realmInfo.level + 1]}</div>
                  <div className="flex gap-4">
                    {configManager.realmUpgradeCosts[getNextRealmLevel]?.map((a: any) => (
                      <ResourceCost
                        key={a.resource}
                        className="!text-gold"
                        type="vertical"
                        size="xs"
                        resourceId={a.resource}
                        amount={a.amount}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            {structure && structure.category === StructureType[StructureType.Realm] && (
              <RealmResourcesIO size="md" titleClassName="uppercase" realmEntityId={structure.entity_id} />
            )}
          </div>
        </div>
      </div>
    )
  );
};
