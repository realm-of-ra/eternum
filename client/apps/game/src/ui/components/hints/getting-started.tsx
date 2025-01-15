import { configManager } from "@/dojo/setup";
import { Headline } from "@/ui/elements/headline";
import { TickIds } from "@bibliothecadao/eternum";
import { tableOfContents } from "./utils";

export const GettingStarted = () => {
  const chapters = [
    {
      title: "The Time Cycle",
      content: `Everything in this world revolves around an Eternum Day. A day in Eternum is ${
        configManager.getTick(TickIds.Armies) / 60
      } minutes.`,
    },
    {
      title: "Resources",
      content:
        "Everything in this world is fungible. Resources, Troops, Donkeys. All of these are generated by production buildings.",
    },
    {
      title: "Cost of Production",
      content:
        "Every resource has a cost to production. You must maintain these in balance in order to keep production going. If you do not have enough resources, production stops until you replenish them.",
    },
    {
      title: "Trading",
      content:
        "The Lords Market' facilitates trade via Donkeys, which are essential for transactions. Acquire Donkeys through market buildings or trade them as a resource. A Donkey balance is required for all trading activities.",
    },
    {
      title: "Travel",
      content:
        "Armies possess a limited amount of stamina, which is expended during movement on the map. This vital resource is partially restored at the dawn of each new Eternum Day, allowing for strategic planning of military maneuvers.",
    },
  ];

  const chapterTitles = chapters.map((chapter) => chapter.title);

  return (
    <>
      <Headline>Key Concepts</Headline>
      {tableOfContents(chapterTitles)}

      {chapters.map((chapter) => (
        <div key={chapter.title} className="my-4" id={chapter.title}>
          <h2>{chapter.title}</h2>
          <div>{chapter.content}</div>
        </div>
      ))}
    </>
  );
};