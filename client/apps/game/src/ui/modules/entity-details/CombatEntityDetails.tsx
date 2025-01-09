import { useBattlesByPosition } from "@/hooks/helpers/battles/useBattles";
import { useOwnArmiesByPosition } from "@/hooks/helpers/useArmies";
import { ArmyInfo } from "@bibliothecadao/eternum";

import { useEntities } from "@/hooks/helpers/useEntities";
import { useStructureAtPosition } from "@/hooks/helpers/useStructures";
import useUIStore from "@/hooks/store/useUIStore";
import { Position } from "@/types/Position";
import { HintSection } from "@/ui/components/hints/HintModal";
import { ArmyChip } from "@/ui/components/military/ArmyChip";
import { PillageHistory } from "@/ui/components/military/PillageHistory";
import { HintModalButton } from "@/ui/elements/HintModalButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/elements/Select";
import { Tabs } from "@/ui/elements/tab";
import { ID } from "@bibliothecadao/eternum";
import { useMemo, useState } from "react";
import { Entities } from "./Entities";

export const CombatEntityDetails = () => {
  const selectedHex = useUIStore((state) => state.selectedHex);
  const selectedEntityId = useUIStore((state) => state.armyActions.selectedEntityId);
  const setSelectedEntityId = useUIStore((state) => state.updateSelectedEntityId);

  const hexPosition = useMemo(
    () => new Position({ x: selectedHex?.col || 0, y: selectedHex?.row || 0 }),
    [selectedHex],
  );
  const { playerStructures } = useEntities();

  const ownArmiesAtPosition = useOwnArmiesByPosition({
    position: hexPosition.getContract(),
    inBattle: false,
    playerStructures: playerStructures(),
  });

  const userArmies = useMemo(
    () => ownArmiesAtPosition.filter((army) => army.health.current > 0),
    [ownArmiesAtPosition],
  );

  const ownArmy = useMemo(() => {
    return ownArmiesAtPosition.find((army) => army.entity_id === selectedEntityId);
  }, [ownArmiesAtPosition, selectedEntityId]);

  const structure = useStructureAtPosition(hexPosition.getContract());
  const battles = useBattlesByPosition(hexPosition.getContract());

  const tabs = useMemo(
    () => [
      {
        key: "entities",
        label: (
          <div className="flex relative group flex-col items-center">
            <div>Entities</div>
          </div>
        ),
        component: selectedHex && <Entities position={hexPosition} ownArmy={ownArmy} battles={battles} />,
      },
      ...(structure
        ? [
            {
              key: "pillages",
              label: (
                <div className="flex relative group flex-col items-center">
                  <div>Pillage History</div>
                </div>
              ),
              component: <PillageHistory structureId={structure.entity_id} />,
            },
          ]
        : []),
    ],
    [selectedHex, hexPosition, ownArmy, structure, battles],
  );

  const [selectedTab, setSelectedTab] = useState(0);

  return (
    hexPosition && (
      <div className="px-2 h-full">
        <HintModalButton className="absolute top-1 right-1" section={HintSection.Combat} />

        <div>
          <Tabs selectedIndex={selectedTab} onChange={(index: any) => setSelectedTab(index)} className="h-full">
            <Tabs.List>
              {tabs.map((tab, index) => (
                <Tabs.Tab key={index}>{tab.label}</Tabs.Tab>
              ))}
            </Tabs.List>
            {selectedTab !== 2 && userArmies.length > 0 && (
              <SelectActiveArmy
                selectedEntity={selectedEntityId || 0}
                setOwnArmySelected={setSelectedEntityId}
                userAttackingArmies={userArmies}
              />
            )}

            <Tabs.Panels className="">
              {tabs.map((tab, index) => (
                <Tabs.Panel key={index} className="h-full">
                  {tab.component}
                </Tabs.Panel>
              ))}
            </Tabs.Panels>
          </Tabs>
        </div>
      </div>
    )
  );
};

const SelectActiveArmy = ({
  selectedEntity,
  setOwnArmySelected,
  userAttackingArmies,
}: {
  selectedEntity: ID;
  setOwnArmySelected: (id: ID) => void;
  userAttackingArmies: ArmyInfo[];
}) => {
  return (
    <div className="w-[31rem]">
      <Select
        value={selectedEntity.toString()}
        onValueChange={(a: string) => {
          setOwnArmySelected(ID(a));
        }}
      >
        <SelectTrigger className="w-[31rem] px-2">
          <SelectValue placeholder="Your armies" />
        </SelectTrigger>
        <SelectContent className="text-gold w-[31rem]">
          {userAttackingArmies.map((army, index) => {
            return (
              <SelectItem
                className="flex justify-between text-sm w-full"
                key={index}
                value={army.entity_id?.toString() || ""}
              >
                <ArmyChip className={`w-[27rem] bg-green/10`} army={army} showButtons={false} />
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
