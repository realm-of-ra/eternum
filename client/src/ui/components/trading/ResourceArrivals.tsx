import { ArrivalInfo } from "@/hooks/helpers/use-resource-arrivals";
import { Headline } from "@/ui/elements/Headline";
import { HintModalButton } from "@/ui/elements/HintModalButton";
import { memo } from "react";
import { EntityArrival } from "../entities/Entity";
import { HintSection } from "../hints/HintModal";

export const AllResourceArrivals = memo(
  ({ arrivals, className = "" }: { arrivals: ArrivalInfo[]; className?: string }) => (
    <div className={`p-2 flex flex-col space-y-1 overflow-y-auto gap-2 ${className}`}>
      <Headline>
        <div className="flex gap-2">
          <div className="self-center">Transfers</div>
          <HintModalButton section={HintSection.Transfers} />
        </div>
      </Headline>
      {arrivals.map((arrival) => (
        <EntityArrival arrival={arrival} key={arrival.entityId} />
      ))}
    </div>
  ),
);
