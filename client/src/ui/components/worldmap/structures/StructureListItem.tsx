import { ReactComponent as Inventory } from "@/assets/icons/common/bagpack.svg";
import { ReactComponent as Sword } from "@/assets/icons/common/cross-swords.svg";
import { ReactComponent as Eye } from "@/assets/icons/common/eye.svg";
import { ReactComponent as Shield } from "@/assets/icons/common/shield.svg";
import { BattleManager } from "@/dojo/modelManager/BattleManager";
import { useDojo } from "@/hooks/context/DojoContext";
import { ArmyInfo, getUserArmyInBattle } from "@/hooks/helpers/useArmies";
import { useHyperstructures } from "@/hooks/helpers/useHyperstructures";
import { Structure } from "@/hooks/helpers/useStructures";
import useBlockchainStore from "@/hooks/store/useBlockchainStore";
import useUIStore from "@/hooks/store/useUIStore";
import { ResourcesIds, StructureType } from "@bibliothecadao/eternum";
import { useMemo, useState } from "react";
import { useRealm } from "../../../../hooks/helpers/useRealm";
import { TroopMenuRow } from "../../military/TroopChip";
import { InventoryResources } from "../../resources/InventoryResources";

type StructureListItemProps = {
  structure: Structure;
  setShowMergeTroopsPopup: (show: boolean) => void;
  ownArmySelected: ArmyInfo | undefined;
};

export const StructureListItem = ({ structure, setShowMergeTroopsPopup, ownArmySelected }: StructureListItemProps) => {
  const dojo = useDojo();

  const { nextBlockTimestamp: currentTimestamp } = useBlockchainStore();

  const [showInventory, setShowInventory] = useState(false);
  const setBattleView = useUIStore((state) => state.setBattleView);

  const { getRealmAddressName } = useRealm();
  const addressName = getRealmAddressName(structure.entity_id);

  const { getHyperstructureProgress } = useHyperstructures();

  const progress =
    structure.category === StructureType[StructureType.Hyperstructure]
      ? getHyperstructureProgress(structure.entity_id)
      : undefined;

  const battleManager = useMemo(() => new BattleManager(structure.protector?.battle_id || 0, dojo), [structure]);

  const { updatedBattle } = useMemo(() => {
    if (!currentTimestamp) throw new Error("Current timestamp is undefined");
    const updatedBattle = battleManager.getUpdatedBattle(currentTimestamp!);
    return { updatedBattle };
  }, [currentTimestamp]);

  const userArmyInBattle = getUserArmyInBattle(updatedBattle?.entity_id || 0);

  const battleButtons = useMemo(() => {
    if (!currentTimestamp) throw new Error("Current timestamp is undefined");
    const isBattleOngoing = battleManager.isBattleOngoing(currentTimestamp);
    const eyeButton = (
      <Eye
        key={"eye-0"}
        className="fill-gold h-6 w-6 my-auto animate-slow transition-all hover:fill-gold/50 hover:scale-125"
        onClick={() =>
          setBattleView({
            battleEntityId: updatedBattle!.entity_id,
            targetArmy: undefined,
            ownArmyEntityId: undefined,
          })
        }
      />
    );

    const shieldButton = (
      <Shield
        key={"shield-1"}
        className="fill-gold h-6 w-6 my-auto animate-slow transition-all hover:fill-gold/50 hover:scale-125"
        onClick={() => setShowMergeTroopsPopup(true)}
      />
    );

    const swordButton = (
      <Sword
        key={"sword-2"}
        className="fill-gold h-6 w-6 my-auto animate-slow transition-all hover:fill-gold/50 hover:scale-125"
        onClick={() =>
          setBattleView({
            battleEntityId: updatedBattle?.entity_id,
            targetArmy: structure.protector?.entity_id,
            ownArmyEntityId: ownArmySelected?.entity_id,
          })
        }
      />
    );
    if (!ownArmySelected && !isBattleOngoing) {
      return [];
    }
    if (!ownArmySelected) {
      return [eyeButton];
    }
    if (isBattleOngoing) {
      return [swordButton];
    } else {
      if (structure.isMine) {
        return [shieldButton];
      }
      if (userArmyInBattle) {
        return [eyeButton];
      }
      return [
        <Sword
          key={"sword-2"}
          className="fill-gold h-6 w-6 my-auto animate-slow transition-all hover:fill-gold/50 hover:scale-125"
          onClick={() =>
            setBattleView({
              engage: true,
              battleEntityId: undefined,
              ownArmyEntityId: ownArmySelected?.entity_id,
              targetArmy: structure.protector?.entity_id,
            })
          }
        />,
      ];
    }
  }, [currentTimestamp, userArmyInBattle, ownArmySelected, updatedBattle, setBattleView, setShowMergeTroopsPopup]);

  return (
    <div className="flex justify-between flex-row mt-2 ">
      <div
        className={`flex w-[27rem] h-full justify-between  ${
          structure.isMine ? "bg-blueish/20" : "bg-red/20"
        } rounded-md border-gold/20 p-2`}
      >
        <div className="flex w-full justify-between">
          <div className="flex flex-col w-[45%]">
            <div className="h4 text-xl flex flex-row">
              <div className="mr-2">{structure.name}</div>
            </div>
            {structure.category === StructureType[StructureType.Hyperstructure] && (
              <div className="text-xs">Progress: {progress?.percentage ?? 0}%</div>
            )}
            <div className="flex flex-row font-bold text-xs">
              <div className="font-bold">Owner: {addressName === "" ? "Bandits" : addressName}</div>
              <Inventory
                className="my-auto w-4 mx-auto hover:fill-gold/50 fill-gold hover:scale-125 hover:animate-pulse duration-300 transition-all"
                onClick={() => setShowInventory(!showInventory)}
              />
            </div>
          </div>
          <div className="flex flex-col content-center w-[55%]">
            <TroopMenuRow troops={updatedBattle?.defence_army?.troops || structure.protector?.troops} />
            {showInventory && (
              <InventoryResources
                entityIds={[structure.entity_id]}
                className="flex gap-1 h-14 mt-2 overflow-x-auto no-scrollbar"
                resourcesIconSize="xs"
                dynamic={
                  structure.category === StructureType[StructureType.FragmentMine] ? [ResourcesIds.Earthenshard] : []
                }
              />
            )}
          </div>
        </div>
      </div>
      {battleButtons}
    </div>
  );
};
