import { useDojo } from "@/hooks/context/dojo-context";
import { useArmiesInBattle, useArmyByArmyEntityId, useGetArmyByEntityId } from "@/hooks/helpers/use-armies";
import { useBattleManager } from "@/hooks/helpers/use-battles";
import { useStructureByEntityId, useStructureByPosition } from "@/hooks/helpers/use-structures";
import useUIStore from "@/hooks/store/use-ui-store";
import useNextBlockTimestamp from "@/hooks/use-next-block-timestamp";
import { Battle } from "@/ui/modules/military/battle-view/battle";
import { BattleManager, BattleSide, Structure } from "@bibliothecadao/eternum";
import { memo, useMemo } from "react";

export const BattleView = memo(() => {
  const dojo = useDojo();
  const getStructure = useStructureByPosition();
  const { getArmy } = useGetArmyByEntityId();

  const { nextBlockTimestamp: currentTimestamp } = useNextBlockTimestamp();
  const battleView = useUIStore((state) => state.battleView);
  const selectedHex = useUIStore((state) => state.selectedHex);

  // get updated army for when a battle starts: we need to have the updated component to have the correct battle_id
  const updatedTarget = useArmyByArmyEntityId(battleView?.targetArmy || 0);

  const battlePosition = useMemo(
    () => ({ x: selectedHex?.col || 0, y: selectedHex?.row || 0 }),
    [selectedHex?.col, selectedHex?.row],
  );

  const targetArmy = useMemo(() => {
    const tempBattleManager = new BattleManager(
      dojo.setup.components,
      dojo.network.provider,
      updatedTarget?.battle_id || 0,
    );
    const updatedBattle = tempBattleManager.getUpdatedBattle(currentTimestamp!);
    return tempBattleManager.getUpdatedArmy(updatedTarget, updatedBattle);
  }, [updatedTarget, battleView?.targetArmy]);

  const battleManager = useBattleManager(
    battleView?.battleEntityId ? battleView?.battleEntityId : battleView?.engage ? 0 : targetArmy?.battle_id || 0,
  );

  const armiesInBattle = useArmiesInBattle(battleManager.battleEntityId);

  const playerArmiesInBattle = useMemo(() => {
    return armiesInBattle.filter((army) => army.isMine);
  }, [armiesInBattle]);

  const ownArmySide = useMemo(
    () =>
      battleManager.isBattle()
        ? playerArmiesInBattle?.[0]?.battle_side || BattleSide[BattleSide.None]
        : BattleSide[BattleSide.Attack],
    [battleManager, playerArmiesInBattle],
  );

  const ownArmyBattleStarter = useMemo(
    () => getArmy(battleView?.ownArmyEntityId || 0),
    [battleView?.ownArmyEntityId || 0],
  );

  const attackerArmies = useMemo(
    () =>
      armiesInBattle.length > 0
        ? armiesInBattle.filter((army) => army.battle_side === BattleSide[BattleSide.Attack])
        : [ownArmyBattleStarter!],
    [armiesInBattle, ownArmyBattleStarter],
  );

  const defenderArmies = useMemo(
    () =>
      armiesInBattle.length > 0
        ? armiesInBattle.filter((army) => army.battle_side === BattleSide[BattleSide.Defence])
        : [targetArmy],
    [armiesInBattle, targetArmy],
  );

  const battleAdjusted = useMemo(() => {
    if (!battleManager) return undefined;
    return battleManager!.getUpdatedBattle(currentTimestamp!);
  }, [currentTimestamp, battleManager, battleManager?.battleEntityId, battleView]);

  const attackerHealth = useMemo(() => {
    if (battleAdjusted) {
      return {
        current: battleAdjusted.attack_army_health.current,
        lifetime: battleAdjusted.attack_army_health.lifetime,
      };
    } else {
      return {
        current: ownArmyBattleStarter?.health.current || 0n,
        lifetime: ownArmyBattleStarter?.health.lifetime || 0n,
      };
    }
  }, [battleAdjusted, ownArmyBattleStarter]);

  const defenderHealth = useMemo(() => {
    if (battleAdjusted) {
      return {
        current: battleAdjusted.defence_army_health.current,
        lifetime: battleAdjusted.defence_army_health.lifetime,
      };
    } else if (targetArmy) {
      return {
        current: targetArmy.health.current || 0n,
        lifetime: targetArmy.health.lifetime || 0n,
      };
    }
    return undefined;
  }, [battleAdjusted, targetArmy]);

  const attackerTroops = useMemo(
    () => (battleAdjusted ? battleAdjusted!.attack_army.troops : ownArmyBattleStarter?.troops),
    [battleAdjusted, ownArmyBattleStarter],
  );

  const defenderTroops = useMemo(
    () => (battleAdjusted ? battleAdjusted!.defence_army.troops : targetArmy?.troops),
    [battleAdjusted, targetArmy],
  );

  const structureFromPosition = getStructure({ x: battlePosition.x, y: battlePosition.y });

  const structureId = useStructureByEntityId(
    defenderArmies.find((army) => army?.protectee)?.protectee?.protectee_id || 0,
  );

  const structure = useMemo(() => {
    return battleView?.engage && !battleView?.battleEntityId && !battleView.targetArmy
      ? structureFromPosition
      : structureId;
  }, [battleView?.engage, battleView?.battleEntityId, battleView?.targetArmy, structureFromPosition, structureId]);

  return (
    <Battle
      battleManager={battleManager}
      ownArmySide={ownArmySide}
      ownArmyEntityId={battleView?.ownArmyEntityId || 0}
      battleAdjusted={battleAdjusted}
      attackerArmies={attackerArmies}
      attackerHealth={attackerHealth}
      attackerTroops={attackerTroops!}
      defenderArmies={defenderArmies}
      defenderHealth={defenderHealth}
      defenderTroops={defenderTroops}
      userArmiesInBattle={playerArmiesInBattle}
      structure={structure as Structure}
    />
  );
});
