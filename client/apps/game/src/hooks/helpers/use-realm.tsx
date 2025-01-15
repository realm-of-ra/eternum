import { useDojo } from "@/hooks/context/dojo-context";
import { getRealmInfo } from "@/utils/realm";
import { ClientComponents, ContractAddress, RealmInfo } from "@bibliothecadao/eternum";
import { useEntityQuery } from "@dojoengine/react";
import { ComponentValue, getComponentValue, Has, HasValue } from "@dojoengine/recs";
import { useMemo } from "react";

export function usePlayerRealms(): RealmInfo[] {
  const {
    account: { account },
    setup: { components },
  } = useDojo();

  const { Realm, Owner } = components;

  const realmEntities = useEntityQuery([Has(Realm), HasValue(Owner, { address: ContractAddress(account.address) })]);

  const realms = useMemo(() => {
    return realmEntities
      .map((entity) => {
        return getRealmInfo(entity, components);
      })
      .filter(Boolean) as RealmInfo[];
  }, [realmEntities]);

  return realms;
}

export const useRealms = () => {
  const {
    setup: {
      components: { Realm },
    },
  } = useDojo();

  const realmEntities = useEntityQuery([Has(Realm)]);

  const realms = useMemo(() => {
    return realmEntities
      .map((entity) => {
        return getComponentValue(Realm, entity);
      })
      .filter(Boolean) as ComponentValue<ClientComponents["Realm"]["schema"]>[];
  }, [realmEntities]);

  return realms;
};