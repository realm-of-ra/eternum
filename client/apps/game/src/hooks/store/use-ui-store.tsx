import { BuildModeStore, createBuildModeStoreSlice } from "@/hooks/store/_build-mode-store";
import { PopupsStore, createPopupsSlice } from "@/hooks/store/_popups-store";
import { ThreeStore, createThreeStoreSlice } from "@/hooks/store/_three-store";
import { BlockchainStore, createBlockchainStore } from "@/hooks/store/use-blockchain-store";
import { RealmStore, createRealmStoreSlice } from "@/hooks/store/use-realm-store";
import { WorldStore, createWorldStoreSlice } from "@/hooks/store/use-world-loading";
import { LeftView } from "@/ui/modules/navigation/left-navigation-module";
import { RightView } from "@/ui/modules/navigation/right-navigation-module";
import { ContractAddress } from "@bibliothecadao/eternum";
import React from "react";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { tracks } from "../use-music";
import { BattleViewInfo } from "./types";

type TooltipType = {
  content: React.ReactNode;
  position?: "top" | "left" | "right" | "bottom";
  fixed?: {
    x: number;
    y: number;
  };
} | null;

interface UIStore {
  theme: string;
  setTheme: (theme: string) => void;
  showBlurOverlay: boolean;
  setShowBlurOverlay: (show: boolean) => void;
  showBlankOverlay: boolean;
  setShowBlankOverlay: (show: boolean) => void;
  isSideMenuOpened: boolean;
  toggleSideMenu: () => void;
  isSoundOn: boolean;
  trackName: string;
  setTrackName: (name: string) => void;
  trackIndex: number;
  setTrackIndex: (index: number) => void;
  toggleSound: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  musicLevel: number;
  setMusicLevel: (level: number) => void;
  effectsLevel: number;
  setEffectsLevel: (level: number) => void;
  compassDirection: number;
  setCompassDirection: (direction: number) => void;
  tooltip: TooltipType;
  setTooltip: (tooltip: TooltipType) => void;
  showRealmsFlags: boolean;
  setShowRealmsFlags: (show: boolean) => void;
  isLoadingScreenEnabled: boolean;
  setIsLoadingScreenEnabled: (enabled: boolean) => void;
  modalContent: React.ReactNode;
  toggleModal: (content: React.ReactNode) => void;
  showModal: boolean;
  battleView: BattleViewInfo | null;
  setBattleView: (participants: BattleViewInfo | null) => void;
  leftNavigationView: LeftView;
  setLeftNavigationView: (view: LeftView) => void;
  rightNavigationView: RightView;
  setRightNavigationView: (view: RightView) => void;
  showMinimap: boolean;
  setShowMinimap: (show: boolean) => void;
  selectedPlayer: ContractAddress | null;
  setSelectedPlayer: (player: ContractAddress | null) => void;
  isSpectatorMode: boolean;
  setSpectatorMode: (enabled: boolean) => void;
  hasAcceptedToS: boolean;
  setHasAcceptedToS: (accepted: boolean) => void;
  showToS: boolean;
  setShowToS: (show: boolean) => void;
}

export type AppStore = UIStore & PopupsStore & ThreeStore & BuildModeStore & RealmStore & BlockchainStore & WorldStore;

const initialTrackIndex = Math.floor(Math.random() * tracks.length);

const useUIStore = create(
  subscribeWithSelector<AppStore>((set, get) => ({
    theme: "light",
    setTheme: (theme) => set({ theme }),
    showBlurOverlay: false,
    setShowBlurOverlay: (show) => set({ showBlurOverlay: show }),
    showBlankOverlay: true,
    setShowBlankOverlay: (show) => set({ showBlankOverlay: show }),
    isSideMenuOpened: true,
    toggleSideMenu: () => set((state) => ({ isSideMenuOpened: !state.isSideMenuOpened })),
    isSoundOn: localStorage.getItem("soundEnabled") ? localStorage.getItem("soundEnabled") === "true" : true,
    trackName: tracks[initialTrackIndex].name,
    setTrackName: (name) => set({ trackName: name }),
    trackIndex: initialTrackIndex,
    setTrackIndex: (index) => set({ trackIndex: index }),
    toggleSound: () =>
      set((state) => {
        localStorage.setItem("soundEnabled", String(!state.isSoundOn));
        return { isSoundOn: !state.isSoundOn };
      }),
    isPlaying: false,
    setIsPlaying: (playing) => set({ isPlaying: playing }),
    musicLevel: localStorage.getItem("musicLevel") ? parseInt(localStorage.getItem("musicLevel") as string) : 50,
    setMusicLevel: (level) => {
      set({ musicLevel: level });
      localStorage.setItem("musicLevel", level.toString());
    },
    effectsLevel: localStorage.getItem("effectsLevel") ? parseInt(localStorage.getItem("effectsLevel") as string) : 50,
    setEffectsLevel: (level) => {
      set({ effectsLevel: level });
      localStorage.setItem("effectsLevel", level.toString());
    },
    compassDirection: 0,
    setCompassDirection: (direction) => set({ compassDirection: direction }),
    tooltip: null,
    setTooltip: (tooltip) => set({ tooltip }),
    showRealmsFlags: true,
    setShowRealmsFlags: (show) => set({ showRealmsFlags: show }),
    isLoadingScreenEnabled: true,
    setIsLoadingScreenEnabled: (enabled) => set({ isLoadingScreenEnabled: enabled }),
    modalContent: null,
    toggleModal: (content) => set({ modalContent: content, showModal: !get().showModal }),
    showModal: false,
    battleView: null,
    setBattleView: (participants: BattleViewInfo | null) => set({ battleView: participants }),
    leftNavigationView: LeftView.None,
    setLeftNavigationView: (view: LeftView) => set({ leftNavigationView: view }),
    rightNavigationView: RightView.None,
    setRightNavigationView: (view: RightView) => set({ rightNavigationView: view }),
    showMinimap: false,
    setShowMinimap: (show: boolean) => set({ showMinimap: show }),
    selectedPlayer: null,
    setSelectedPlayer: (player: ContractAddress | null) => set({ selectedPlayer: player }),
    isSpectatorMode: false,
    setSpectatorMode: (enabled: boolean) => set({ isSpectatorMode: enabled }),
    hasAcceptedToS: localStorage.getItem("hasAcceptedToS") ? localStorage.getItem("hasAcceptedToS") === "true" : false,
    setHasAcceptedToS: (accepted: boolean) => {
      set({ hasAcceptedToS: accepted });
      localStorage.setItem("hasAcceptedToS", String(accepted));
    },
    showToS: false,
    setShowToS: (show: boolean) => set({ showToS: show }),
    ...createPopupsSlice(set, get),
    ...createThreeStoreSlice(set, get),
    ...createBuildModeStoreSlice(set),
    ...createRealmStoreSlice(set),
    ...createBlockchainStore(set),
    ...createWorldStoreSlice(set),
  })),
);

export default useUIStore;