import { useModalStore } from "@/hooks/store/use-modal-store";
import CircleButton from "@/ui/elements/circle-button";
import { HintModal } from "../components/hints/hint-modal";
import { BuildingThumbs } from "../config";

type HintModalButtonProps = {
  section?: string;
  className?: string;
};

export const HintModalButton = ({ className, section }: HintModalButtonProps) => {
  const { toggleModal } = useModalStore();

  return (
    <CircleButton
      className={className}
      onClick={() => toggleModal(<HintModal initialActiveSection={section} />)}
      size={"xs"}
      image={BuildingThumbs.question}
    />
  );
};
