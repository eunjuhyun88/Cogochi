import { persistedWritable } from '$lib/stores/persisted';
import type { HubCareAction, HubStyle } from '$lib/types';

export type HubPanel = 'customize' | 'care' | 'growth' | 'memory' | 'doctrine';
export type StylePreview = HubStyle;
export type CareMode = HubCareAction;

export interface HubState {
  activePanel: HubPanel;
  stylePreview: StylePreview;
  careMode: CareMode;
}

const initialState: HubState = {
  activePanel: 'customize',
  stylePreview: 'field',
  careMode: 'note',
};

const validPanels = new Set<HubPanel>(['customize', 'care', 'growth', 'memory', 'doctrine']);
const validStylePreviews = new Set<StylePreview>(['field', 'archive', 'proof']);
const validCareModes = new Set<CareMode>(['gift', 'rest', 'note']);

function reconcileHubState(state: HubState): HubState {
  return {
    activePanel: validPanels.has(state.activePanel) ? state.activePanel : initialState.activePanel,
    stylePreview: validStylePreviews.has(state.stylePreview) ? state.stylePreview : initialState.stylePreview,
    careMode: validCareModes.has(state.careMode) ? state.careMode : initialState.careMode,
  };
}

function createHubStore() {
  const store = persistedWritable<HubState>('cogochi.hub.v1', initialState);
  const { subscribe, set, update } = store;

  update((state) => reconcileHubState(state));

  return {
    subscribe,
    reset() {
      set(initialState);
    },
    setActivePanel(activePanel: HubPanel) {
      update((state) => ({ ...reconcileHubState(state), activePanel }));
    },
    setStylePreview(stylePreview: StylePreview) {
      update((state) => ({
        ...reconcileHubState(state),
        activePanel: 'customize',
        stylePreview,
      }));
    },
    setCareMode(careMode: CareMode) {
      update((state) => ({
        ...reconcileHubState(state),
        activePanel: 'care',
        careMode,
      }));
    },
    syncAgentSelections(stylePreview: StylePreview, careMode: CareMode) {
      update((state) => {
        const nextState = reconcileHubState(state);
        if (nextState.stylePreview === stylePreview && nextState.careMode === careMode) {
          return nextState;
        }
        return {
          ...nextState,
          stylePreview,
          careMode,
        };
      });
    },
  };
}

export const hubStore = createHubStore();
