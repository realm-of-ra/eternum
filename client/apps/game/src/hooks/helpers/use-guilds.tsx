import { useDojo } from "@/hooks/context/dojo-context";
import { useLeaderBoardStore } from "@/hooks/store/use-leaderboard-store";
import useUIStore from "@/hooks/store/use-ui-store";
import { formatTime, toHexString } from "@/ui/utils/utils";
import { getAddressName, getEntityName } from "@/utils/entities";
import {
  ClientComponents,
  ContractAddress,
  GuildInfo,
  GuildMemberInfo,
  GuildWhitelistInfo,
  ID,
  PlayerInfo,
} from "@bibliothecadao/eternum";
import { useEntityQuery } from "@dojoengine/react";
import { Component, Entity, Has, HasValue, NotValue, getComponentValue, runQuery } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useCallback } from "react";
import { shortString } from "starknet";

const formatGuilds = (
  guildsRanked: [ID, number][],
  guilds: Entity[],
  nextBlockTimestamp: number | undefined,
  address: string,
  getEntityName: (entityId: ID) => string,
  Guild: Component<ClientComponents["Guild"]["schema"]>,
  Owner: Component<ClientComponents["Owner"]["schema"]>,
  GuildMember: Component<ClientComponents["GuildMember"]["schema"]>,
  CreateGuild: Component<ClientComponents["events"]["CreateGuild"]["schema"]>,
): GuildInfo[] => {
  const guildMember = getComponentValue(GuildMember, getEntityIdFromKeys([ContractAddress(address)]));

  return guilds
    .map((guild_entity_id) => {
      const guild = getComponentValue(Guild, guild_entity_id);
      if (!guild) return;

      const owner = getComponentValue(Owner, getEntityIdFromKeys([BigInt(guild.entity_id)]));
      const name = getEntityName(guild.entity_id);

      const createGuildEvent = getComponentValue(CreateGuild, getEntityIdFromKeys([BigInt(guild.entity_id)]));

      let timeSinceCreation = "";
      if (createGuildEvent) {
        const guildCreationTimestamp = createGuildEvent?.timestamp ?? 0;
        timeSinceCreation = formatTime((nextBlockTimestamp || 0) - guildCreationTimestamp, undefined, true);
      }

      const rankIndex = guildsRanked.findIndex(([guildEntityId, _]) => guildEntityId === guild.entity_id);
      const hasPoints = rankIndex !== -1;

      return {
        entityId: guild.entity_id,
        name,
        isOwner: owner?.address === ContractAddress(address),
        memberCount: guild.member_count,
        rank: hasPoints ? rankIndex + 1 : Number.MAX_SAFE_INTEGER,
        points: hasPoints ? guildsRanked[rankIndex][1] : 0,
        isPublic: guild.is_public,
        age: timeSinceCreation,
        isMember: guild.entity_id === guildMember?.guild_entity_id,
      };
    })
    .filter((guild): guild is NonNullable<typeof guild> => guild !== undefined)
    .sort((a, b) => a.rank - b.rank)
    .map((guild, index) => ({
      ...guild,
      rank: guild.rank === Number.MAX_SAFE_INTEGER ? index + 1 : guild.rank,
    }));
};

const formatGuildMembers = (
  guildMembers: Entity[],
  players: PlayerInfo[],
  nextBlockTimestamp: number | undefined,
  userAddress: string,
  getAddressName: (address: ContractAddress) => string | undefined,
  GuildMember: Component<ClientComponents["GuildMember"]["schema"]>,
  Owner: Component<ClientComponents["Owner"]["schema"]>,
  JoinGuild: Component<ClientComponents["events"]["JoinGuild"]["schema"]>,
): GuildMemberInfo[] => {
  return guildMembers
    .map((entity) => {
      const guildMember = getComponentValue(GuildMember, entity);
      if (!guildMember) return;

      const joinGuildEvent = getComponentValue(
        JoinGuild,
        getEntityIdFromKeys([BigInt(guildMember.guild_entity_id), ContractAddress(guildMember.address)]),
      );
      const owner = getComponentValue(Owner, getEntityIdFromKeys([BigInt(guildMember.guild_entity_id)]));
      const addressName = getAddressName(guildMember.address);

      const playerIndex = players.findIndex((player) => player.address === guildMember.address);
      if (playerIndex === -1) return;

      let timeSinceJoined = "";
      if (joinGuildEvent) {
        const joinGuildTimestamp = joinGuildEvent?.timestamp ?? 0;
        timeSinceJoined = formatTime((nextBlockTimestamp || 0) - joinGuildTimestamp, undefined, true);
      }

      return {
        address: guildMember.address,
        guildEntityId: guildMember.guild_entity_id,
        age: timeSinceJoined,
        name: addressName ? addressName : "Unknown",
        rank: players[playerIndex].rank,
        points: players[playerIndex].points,
        isUser: guildMember.address === ContractAddress(userAddress),
        isGuildMaster: owner?.address === guildMember.address,
      };
    })
    .filter((guildMember): guildMember is NonNullable<typeof guildMember> => guildMember !== undefined);
};

const formatGuildWhitelist = (
  whitelist: Entity[],
  players: PlayerInfo[],
  GuildWhitelist: Component<ClientComponents["GuildWhitelist"]["schema"]>,
  getAddressName: (address: ContractAddress) => string | undefined,
  getEntityName: (entityId: ID) => string,
): GuildWhitelistInfo[] => {
  return whitelist
    .map((entity) => {
      const guildWhitelist = getComponentValue(GuildWhitelist, entity);
      if (!guildWhitelist) return;

      const addressName = getAddressName(guildWhitelist.address);
      const guildName = getEntityName(guildWhitelist.guild_entity_id);
      const playerIndex = players.findIndex((player) => player.address === guildWhitelist.address);

      return {
        guildEntityId: guildWhitelist.guild_entity_id,
        name: addressName ?? "Unknown",
        guildName,
        rank: players[playerIndex].rank,
        points: players[playerIndex].points,
        address: guildWhitelist.address,
      };
    })
    .filter((guildWhitelist): guildWhitelist is NonNullable<typeof guildWhitelist> => guildWhitelist !== undefined);
};

const formatPlayerWhitelist = (
  addressWhitelist: Entity[],
  GuildWhitelist: Component<ClientComponents["GuildWhitelist"]["schema"]>,
  getEntityName: (entityId: ID) => string,
): GuildWhitelistInfo[] => {
  return addressWhitelist
    .map((entity) => {
      const addressWhitelist = getComponentValue(GuildWhitelist, entity);
      if (!addressWhitelist) return;

      const guildName = getEntityName(addressWhitelist.guild_entity_id);
      return {
        guildEntityId: addressWhitelist.guild_entity_id,
        guildName,
      };
    })
    .filter(
      (addressWhitelist): addressWhitelist is NonNullable<typeof addressWhitelist> => addressWhitelist !== undefined,
    );
};

export const useGuilds = () => {
  const dojo = useDojo();

  const {
    setup: {
      components,
      account: { account },
    },
  } = dojo;
  const {
    Guild,
    GuildMember,
    GuildWhitelist,
    Owner,
    AddressName,
    events: { CreateGuild, JoinGuild },
  } = components;

  const nextBlockTimestamp = useUIStore.getState().nextBlockTimestamp;

  const useGuildQuery = () => {
    const guildsRanked = useLeaderBoardStore.getState().guildsByRank;
    const guilds = useEntityQuery([Has(Guild), NotValue(Guild, { member_count: 0 })]);

    return {
      guilds: formatGuilds(
        guildsRanked,
        guilds,
        nextBlockTimestamp,
        account.address,
        (entityId: number) => getEntityName(entityId, components) || "Unknown",
        Guild,
        Owner,
        GuildMember,
        CreateGuild,
      ),
    };
  };

  const getGuildFromEntityId = useCallback(
    (entityId: ID, accountAddress: ContractAddress, components: ClientComponents) => {
      const guildsRanked = useLeaderBoardStore.getState().guildsByRank;
      const guild = formatGuilds(
        guildsRanked,
        [getEntityIdFromKeys([BigInt(entityId)])],
        nextBlockTimestamp,
        account.address,
        (entityId: number) => getEntityName(entityId, components) || "Unknown",
        Guild,
        Owner,
        GuildMember,
        CreateGuild,
      )[0];
      if (!guild) return;

      const owner = getComponentValue(Owner, getEntityIdFromKeys([BigInt(guild.entityId)]));

      return { guild, isOwner: owner?.address === ContractAddress(accountAddress), name: guild.name };
    },
    [],
  );

  const getGuildFromPlayerAddress = useCallback((accountAddress: ContractAddress): GuildInfo | undefined => {
    const guildMember = getComponentValue(GuildMember, getEntityIdFromKeys([accountAddress]));
    if (!guildMember) return;

    const guild = getComponentValue(Guild, getEntityIdFromKeys([BigInt(guildMember.guild_entity_id)]));
    const owner = getComponentValue(Owner, getEntityIdFromKeys([BigInt(guildMember.guild_entity_id)]));

    const name = guildMember.guild_entity_id
      ? getEntityName(guildMember.guild_entity_id, components) || "Unknown"
      : "Unknown";

    return {
      entityId: guildMember?.guild_entity_id,
      name,
      isOwner: owner?.address === ContractAddress(accountAddress),
      memberCount: guild?.member_count || 0,
    };
  }, []);

  const useGuildMembers = (guildEntityId: ID, players: PlayerInfo[]) => {
    const guildMembers = useEntityQuery([HasValue(GuildMember, { guild_entity_id: guildEntityId })]);

    return {
      guildMembers: formatGuildMembers(
        guildMembers,
        players,
        nextBlockTimestamp,
        account.address,
        (address: ContractAddress) => getAddressName(address, components),
        GuildMember,
        Owner,
        JoinGuild,
      ),
    };
  };

  const useGuildWhitelist = (guildEntityId: ID, players: PlayerInfo[]) => {
    const whitelist = useEntityQuery([
      HasValue(GuildWhitelist, { guild_entity_id: guildEntityId, is_whitelisted: true }),
    ]);

    return formatGuildWhitelist(
      whitelist,
      players,
      GuildWhitelist,
      (address: ContractAddress) => getAddressName(address, components) || "Unknown",
      (entityId: number) => getEntityName(entityId, components) || "Unknown",
    );
  };

  const usePlayerWhitelist = (address: ContractAddress) => {
    const whitelist = useEntityQuery([HasValue(GuildWhitelist, { address, is_whitelisted: true })]);

    return formatPlayerWhitelist(
      whitelist,
      GuildWhitelist,
      (entityId: number) => getEntityName(entityId, components) || "Unknown",
    );
  };

  const getPlayersInPlayersGuild = useCallback((accountAddress: ContractAddress) => {
    const guild = getGuildFromPlayerAddress(accountAddress);
    if (!guild) return [];

    const guildEntityId = guild.entityId;
    if (typeof guildEntityId !== "number") return [];

    return getPlayerListInGuild(guildEntityId);
  }, []);

  const getPlayerListInGuild = (guild_entity_id: ID) => {
    const players = Array.from(
      runQuery([Has(AddressName), Has(GuildMember), HasValue(Guild, { entity_id: guild_entity_id })]),
    ).map((playerEntity) => {
      const player = getComponentValue(AddressName, playerEntity);

      const name = player ? shortString.decodeShortString(player.name.toString()) : "Unknown";
      const address = toHexString(player?.address || 0n);

      return {
        name,
        address,
      };
    });

    return players;
  };

  return {
    useGuildQuery,
    getGuildFromPlayerAddress,
    useGuildMembers,
    useGuildWhitelist,
    usePlayerWhitelist,
    getGuildFromEntityId,
    getPlayersInPlayersGuild,
    getPlayerListInGuild,
  };
};