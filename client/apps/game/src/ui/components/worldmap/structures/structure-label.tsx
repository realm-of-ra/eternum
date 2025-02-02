import { useGuilds } from "@/hooks/helpers/use-guilds";
import { useQuery } from "@/hooks/helpers/use-query";
import { useIsStructureImmune, useStructureImmunityTimer, useStructures } from "@/hooks/helpers/use-structures";
import useUIStore from "@/hooks/store/use-ui-store";
import useNextBlockTimestamp from "@/hooks/use-next-block-timestamp";
import { StructureListItem } from "@/ui/components/worldmap/structures/structure-list-item";
import { BaseThreeTooltip, Position } from "@/ui/elements/base-three-tooltip";
import { Headline } from "@/ui/elements/headline";
import { formatTime } from "@/ui/utils/utils";
import { ContractAddress, Structure } from "@bibliothecadao/eternum";
import { memo, useMemo } from "react";

export const ImmunityTimer = ({
  isImmune,
  timer,
  className,
}: {
  isImmune: boolean;
  timer: number;
  className?: string;
}) => {
  if (!isImmune) return null;

  return (
    <div className={`mt-2 p-2 bg-blue-500 bg-opacity-20 rounded-md ${className}`}>
      <div className="text-sm font-semibold text-blue-300">Immune</div>
      <div className="text-lg font-bold text-white animate-pulse">{formatTime(timer)}</div>
    </div>
  );
};

export const StructureInfoLabel = memo(() => {
  const { isMapView } = useQuery();
  const hoveredStructure = useUIStore((state) => state.hoveredStructure);
  const { getStructureByEntityId } = useStructures();
  const { getGuildFromPlayerAddress } = useGuilds();

  const structure = useMemo(() => {
    return getStructureByEntityId(hoveredStructure?.entityId || 0);
  }, [hoveredStructure]);

  const playerGuild = getGuildFromPlayerAddress(ContractAddress(structure?.owner.address || 0n));

  const { nextBlockTimestamp } = useNextBlockTimestamp();

  const isImmune = useIsStructureImmune(structure, nextBlockTimestamp || 0);
  const timer = useStructureImmunityTimer(structure as Structure, nextBlockTimestamp || 0);

  return (
    <>
      {structure && isMapView && (
        <BaseThreeTooltip position={Position.CLEAN} className={`pointer-events-none w-[350px]`}>
          <div className="flex flex-col gap-1">
            <Headline className="text-center text-lg">
              <div>{structure.ownerName}</div>
              {playerGuild && (
                <div>
                  {"< "}
                  {playerGuild.name}
                  {" >"}
                </div>
              )}
            </Headline>
            <StructureListItem
              structure={structure as Structure}
              ownArmySelected={undefined}
              setShowMergeTroopsPopup={() => {}}
              maxInventory={3}
            />
            <ImmunityTimer isImmune={isImmune} timer={timer} />
          </div>
        </BaseThreeTooltip>
      )}
    </>
  );
});

StructureInfoLabel.displayName = "StructureInfoLabel";
