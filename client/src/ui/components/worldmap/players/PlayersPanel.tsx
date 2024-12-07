import { useDojo } from "@/hooks/context/DojoContext";
import { useGetAllPlayers } from "@/hooks/helpers/use-get-all-players";
import { useEntitiesUtils } from "@/hooks/helpers/useEntities";
import { useGuilds } from "@/hooks/helpers/useGuilds";
import TextInput from "@/ui/elements/TextInput";
import { getEntityIdFromKeys, toHexString } from "@/ui/utils/utils";
import { ContractAddress, Player } from "@bibliothecadao/eternum";
import { Has, HasValue, getComponentValue, runQuery } from "@dojoengine/recs";
import { useMemo, useState } from "react";
import { PlayerCustom, PlayerList } from "./PlayerList";

export const PlayersPanel = ({
  players,
  viewPlayerInfo,
}: {
  players: Player[];
  viewPlayerInfo: (playerAddress: ContractAddress) => void;
}) => {
  const {
    setup: {
      components: { Structure, Owner, GuildWhitelist },
      systemCalls: { whitelist_player, remove_player_from_whitelist },
    },
    account: { account },
  } = useDojo();

  const { getGuildFromPlayerAddress } = useGuilds();

  const userGuild = getGuildFromPlayerAddress(ContractAddress(account.address));

  const [isLoading, setIsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");

  const { getEntityName } = useEntitiesUtils();
  const getPlayers = useGetAllPlayers();

  const playersWithStructures: PlayerCustom[] = useMemo(() => {
    // Sort players by points in descending order
    const sortedPlayers = [...players].sort((a, b) => (b.points || 0) - (a.points || 0));

    const playersWithStructures = sortedPlayers.map((player, index) => {
      const structuresEntityIds = runQuery([
        Has(Structure),
        HasValue(Owner, { address: ContractAddress(player.address) }),
      ]);
      const structures = Array.from(structuresEntityIds)
        .map((entityId) => {
          const structure = getComponentValue(Structure, entityId);
          if (!structure) return undefined;

          const structureName = getEntityName(structure.entity_id);
          return structureName;
        })
        .filter((structure) => structure !== undefined);

      const guild = getGuildFromPlayerAddress(player.address);

      let isInvited = false;
      if (userGuild) {
        isInvited =
          getComponentValue(GuildWhitelist, getEntityIdFromKeys([player.address, BigInt(userGuild?.entityId)]))
            ?.is_whitelisted ?? false;
      }
      return {
        ...player,
        structures,
        isUser: player.address === ContractAddress(account.address),
        points: player.points || 0,
        rank: index + 1,
        isInvited,
        guild,
      };
    });
    return playersWithStructures;
  }, [getPlayers, isLoading]);

  const filteredPlayers = useMemo(() => {
    return playersWithStructures.filter(
      (player) =>
        player.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        player.structures.some(
          (structure) => structure && structure.toLowerCase().includes(searchInput.toLowerCase()),
        ) ||
        toHexString(player.address).toLowerCase().includes(searchInput.toLowerCase()),
    );
  }, [playersWithStructures, searchInput]);

  const whitelistPlayer = (address: ContractAddress) => {
    setIsLoading(true);
    whitelist_player({
      player_address_to_whitelist: address,
      guild_entity_id: userGuild?.entityId!,
      signer: account,
    }).finally(() => setIsLoading(false));
  };

  const removePlayerFromWhitelist = (address: ContractAddress) => {
    setIsLoading(true);
    remove_player_from_whitelist({
      player_address_to_remove: address,
      guild_entity_id: userGuild?.entityId!,
      signer: account,
    }).finally(() => setIsLoading(false));
  };

  return (
    <div className="flex flex-col min-h-72 p-2 h-full w-full overflow-hidden">
      <div>
        <TextInput
          placeholder="Search players/realms/structures..."
          onChange={(searchInput) => setSearchInput(searchInput)}
          className="mb-4"
        />
      </div>

      <div className="flex-1 min-h-0 ">
        <PlayerList
          players={filteredPlayers}
          viewPlayerInfo={viewPlayerInfo}
          isGuildMaster={userGuild?.isOwner ?? false}
          whitelistPlayer={whitelistPlayer}
          removePlayerFromWhitelist={removePlayerFromWhitelist}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
