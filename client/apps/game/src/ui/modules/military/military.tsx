import { useDojo } from "@/hooks/context/dojo-context";
import { useQuery } from "@/hooks/helpers/use-query";
import { EntityArmyList } from "@/ui/components/military/army-list";
import { EntitiesArmyTable } from "@/ui/components/military/entities-army-table";
import { UserBattles } from "@/ui/components/military/user-battles";
import { Tabs } from "@/ui/elements/tab";
import { getStructure } from "@/utils/entities";
import { ID } from "@bibliothecadao/eternum";
import { useState } from "react";

export const Military = ({ entityId, className }: { entityId: ID | undefined; className?: string }) => {
  const {
    setup: { components },
  } = useDojo();

  const { isMapView } = useQuery();
  const selectedStructure = entityId ? getStructure(entityId, components) : undefined;

  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = [
    {
      label: "Army",
      component: isMapView ? (
        <EntitiesArmyTable />
      ) : (
        selectedStructure && <EntityArmyList structure={selectedStructure} />
      ),
    },
    { label: "Battles", component: <UserBattles /> },
  ];

  return (
    <div className={`relative ${className}`}>
      <Tabs
        selectedIndex={selectedTab}
        onChange={(index: any) => {
          setSelectedTab(index);
        }}
        className="h-full"
      >
        <Tabs.List>
          {tabs.map((tab, index) => (
            <Tabs.Tab key={index}>{tab.label}</Tabs.Tab>
          ))}
        </Tabs.List>

        <Tabs.Panels className="overflow-hidden">
          {tabs.map((tab, index) => (
            <Tabs.Panel key={index}>{tab.component}</Tabs.Panel>
          ))}
        </Tabs.Panels>
      </Tabs>
    </div>
  );
};
