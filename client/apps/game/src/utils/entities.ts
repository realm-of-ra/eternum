import { getRealmNameById } from "@/ui/utils/realms";
import {
  CAPACITY_CONFIG_CATEGORY_STRING_MAP,
  ClientComponents,
  ContractAddress,
  divideByPrecision,
  EntityType,
  ID,
  PlayerStructure,
  RealmWithPosition,
} from "@bibliothecadao/eternum";
import { ComponentValue, getComponentValue } from "@dojoengine/recs";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { getResourcesFromBalance } from "./resources";

export const getRealm = (entityId: ID, components: ClientComponents) => {
  const { Realm, Owner, Position } = components;
  const entity = getEntityIdFromKeys([BigInt(entityId)]);
  const realm = getComponentValue(Realm, entity);
  if (!realm) return undefined;

  const position = getComponentValue(Position, entity);
  const owner = getComponentValue(Owner, entity);

  return {
    ...realm,
    position,
    name: getRealmNameById(realm.realm_id),
    owner,
  } as RealmWithPosition;
};

export const getStructure = (entityId: ID, components: ClientComponents) => {
  const { Structure, Position, Owner } = components;
  const entity = getEntityIdFromKeys([BigInt(entityId)]);
  const structure = getComponentValue(Structure, entity);
  if (!structure) return undefined;

  const position = getComponentValue(Position, entity);
  const owner = getComponentValue(Owner, entity);
  const structureName = getEntityName(structure.entity_id, components);
  const name = structureName ? `${structure?.category} ${structureName}` : structure.category || "";

  return {
    ...structure,
    position,
    name,
    owner,
  } as PlayerStructure;
};

export const getEntityInfo = (entityId: ID, playerAccount: ContractAddress, components: ClientComponents) => {
  const { ArrivalTime, Movable, CapacityCategory, CapacityConfig, EntityOwner, Owner, Structure, Army, Position } =
    components;
  const entityIdBigInt = BigInt(entityId);
  const arrivalTime = getComponentValue(ArrivalTime, getEntityIdFromKeys([entityIdBigInt]));
  const movable = getComponentValue(Movable, getEntityIdFromKeys([entityIdBigInt]));

  const entityCapacityCategory = getComponentValue(CapacityCategory, getEntityIdFromKeys([entityIdBigInt]))
    ?.category as unknown as string;
  const capacityCategoryId = CAPACITY_CONFIG_CATEGORY_STRING_MAP[entityCapacityCategory] || 0n;
  const capacity = getComponentValue(CapacityConfig, getEntityIdFromKeys([BigInt(capacityCategoryId)]));

  const entityOwner = getComponentValue(EntityOwner, getEntityIdFromKeys([entityIdBigInt]));
  const owner = getComponentValue(Owner, getEntityIdFromKeys([BigInt(entityOwner?.entity_owner_id || 0)]));

  const name = getEntityName(entityId, components);

  const structure = getComponentValue(Structure, getEntityIdFromKeys([entityIdBigInt]));

  const resources = getResourcesFromBalance(entityId, components);
  const army = getComponentValue(Army, getEntityIdFromKeys([entityIdBigInt]));
  const rawIntermediateDestination = movable
    ? { x: movable.intermediate_coord_x, y: movable.intermediate_coord_y }
    : undefined;
  const intermediateDestination = rawIntermediateDestination
    ? { x: rawIntermediateDestination.x, y: rawIntermediateDestination.y }
    : undefined;

  const position = getComponentValue(Position, getEntityIdFromKeys([entityIdBigInt]));

  const homePosition = entityOwner
    ? getComponentValue(Position, getEntityIdFromKeys([BigInt(entityOwner?.entity_owner_id || 0)]))
    : undefined;

  return {
    entityId,
    arrivalTime: arrivalTime?.arrives_at,
    blocked: Boolean(movable?.blocked),
    capacity: divideByPrecision(Number(capacity?.weight_gram) || 0),
    intermediateDestination,
    position: position ? { x: position.x, y: position.y } : undefined,
    homePosition: homePosition ? { x: homePosition.x, y: homePosition.y } : undefined,
    owner: owner?.address,
    isMine: ContractAddress(owner?.address || 0n) === playerAccount,
    isRoundTrip: movable?.round_trip || false,
    resources,
    entityType: army ? EntityType.TROOP : EntityType.DONKEY,
    structureCategory: structure?.category,
    structure,
    name,
  };
};

export const getEntityName = (entityId: ID, components: ClientComponents, abbreviate: boolean = false) => {
  const entityName = getComponentValue(components.EntityName, getEntityIdFromKeys([BigInt(entityId)]));
  const realm = getComponentValue(components.Realm, getEntityIdFromKeys([BigInt(entityId)]));
  const structure = getComponentValue(components.Structure, getEntityIdFromKeys([BigInt(entityId)]));
  if (structure?.category === "Realm" && realm) {
    return getRealmName(realm);
  }

  if (entityName) {
    return entityName.name.toString();
  }

  if (abbreviate && structure) {
    const abbreviations: Record<string, string> = {
      FragmentMine: "FM",
      Hyperstructure: "HS",
      Bank: "BK",
    };

    const abbr = abbreviations[structure.category];
    if (abbr) {
      return `${abbr} ${structure.entity_id}`;
    }
  }
  return `${structure?.category} ${structure?.entity_id}`;
};

const getRealmName = (realm: ComponentValue<ClientComponents["Realm"]["schema"]>) => {
  const baseName = getRealmNameById(realm.realm_id);
  return realm.has_wonder ? `WONDER - ${baseName}` : baseName;
};

export const getAddressName = (address: ContractAddress, components: ClientComponents) => {
  const addressName = getComponentValue(components.AddressName, getEntityIdFromKeys([BigInt(address)]));

  return addressName ? addressName.name.toString() : undefined;
};

export const getAddressNameFromEntity = (entityId: ID, components: ClientComponents) => {
  const address = getPlayerAddressFromEntity(entityId, components);
  if (!address) return;

  const addressName = getComponentValue(components.AddressName, getEntityIdFromKeys([BigInt(address)]));

  return addressName ? addressName.name.toString() : undefined;
};

export const getPlayerAddressFromEntity = (entityId: ID, components: ClientComponents): ContractAddress | undefined => {
  const entityOwner = getComponentValue(components.EntityOwner, getEntityIdFromKeys([BigInt(entityId)]));
  return entityOwner?.entity_owner_id
    ? getComponentValue(components.Owner, getEntityIdFromKeys([BigInt(entityOwner.entity_owner_id)]))?.address
    : undefined;
};
