import { create } from 'zustand';
import RenderBridge, { type RenderBridgeEvent } from '../core/worker/RenderBridge';
import type { MaterialData, MaterialParams, NodeId, ObjectData, RenderMode, Transform } from '../core/worker/protocol';

interface EditorState {
  ready: boolean;
  error: string | null;
  objects: Map<NodeId, ObjectData>;
  materials: Map<NodeId, MaterialData>;
  selectedId: NodeId | null;
  renderMode: RenderMode;
  bridge: RenderBridge | null;
  materialParams: MaterialParams | null;
  transform: Transform | null;
  attach: (bridge: RenderBridge) => void;
  detach: () => void;
  select: (id: NodeId | null) => void;
  setPosition: (index: number, value: number) => void;
  setScale: (index: number, value: number) => void;
  setMaterial: (materialId: NodeId) => void;
  setMaterialParams: (params: MaterialParams) => void;
  getMateriaParams: (id: NodeId) => void;
  getTransform: (id: NodeId) => void;
  setRenderMode: (mode: RenderMode) => void;
}

let unsubscribeBridge: (() => void) | null = null;

export const useEditorStore = create<EditorState>((set, get) => ({
  ready: false,
  error: null,
  objects: new Map(),
  materials: new Map(),
  selectedId: null,
  renderMode: 0,
  bridge: null,
  materialParams: null,
  transform: null,

  attach: (bridge) => {
    if (get().bridge) return;

    unsubscribeBridge?.();
    unsubscribeBridge = bridge.subscribe((event: RenderBridgeEvent) => {
      if (get().bridge !== bridge) return;
      if (event.type === 'error') {
        set({ error: event.error instanceof Error ? event.error.message : event.error });
        return;
      }

      switch (event.type) {
        case 'ready':
          set({ ready: true, error: null });
          break;
        case 'sceneData': {
          const objects = new Map(event.objects.map((object) => [object.UUID, object]));
          const materials = new Map(event.materials.map((material) => [material.UUID, material]));
          set((state) => ({
            objects,
            materials,
            selectedId: state.selectedId && objects.has(state.selectedId) ? state.selectedId : null,
          }));
          break;
        }
        case 'getMateriaParams': {
          const materialParams = event.params;
          set(() => ({ materialParams }));
          break;
        }
        case 'getTransform': {
          const transform = event.transform;
          set(() => ({ transform }));
          break;
        }
      }
    });

    set({
      bridge,
      ready: false,
      error: null,
      objects: new Map(),
      materials: new Map(),
      selectedId: null,
    });
  },

  detach: () => {
    const bridge = get().bridge;
    if (!bridge) return;
    unsubscribeBridge?.();
    unsubscribeBridge = null;
    bridge.terminate();
    set({
      bridge: null,
      ready: false,
      error: null,
      objects: new Map(),
      materials: new Map(),
      selectedId: null,
    });
  },

  select: (id) => {
    set({ selectedId: id, materialParams: null });

    if (id) {
        const object = get().objects.get(id);
        if (object) {
            get().getMateriaParams(object.materialUUID);
            get().getTransform(id);
        }
    }
  },

  setPosition: (index, value) => {
    const transform = get().transform;
    const id = get().selectedId;
    if (!id || !transform || !Number.isInteger(index) || index < 0 || index > 2 || !Number.isFinite(value)) return;

    const translation = new Float32Array(transform.translation ?? [0, 0, 0]);
    translation[index] = value;
    set({transform : { ...transform, translation }});
    get().bridge?.setPosition(id, translation);
  },

  setScale: (index, value) => {
    const transform = get().transform;
    const id = get().selectedId;
    if (!id || !transform || !Number.isInteger(index) || index < 0 || index > 2 || !Number.isFinite(value)) return;

    const scale = new Float32Array(transform.scale ?? [1, 1]);
    scale[index] = value;
    set({transform : { ...transform, scale }});
    get().bridge?.setScale(id, scale);
  },

  setMaterial: (materialId) => {
    const id = get().selectedId;
    if (!id || !get().materials.has(materialId)) return;

    const object = get().objects.get(id);
    if (!object) return;

    const objects = new Map(get().objects);
    objects.set(id, { ...object, materialUUID: materialId });
    set({ objects, materialParams: null });
    get().bridge?.setMaterial(id, materialId);
  },

  setMaterialParams: (params) => {
    const id = get().selectedId;
    if (!id) return;

    const object = get().objects.get(id);
    if (!object) return;

    set({ materialParams: params });
    get().bridge?.setMaterialParams(id, object.materialUUID, params);
  },

  getMateriaParams: (id) => {
    if (!get().bridge)
        return;
    get().bridge?.getMateriaParams(id);
  },

  getTransform: (id) => {
    if (!get().bridge)
        return;
    get().bridge?.getTransform(id);
  },

  setRenderMode: (mode) => {
    set({ renderMode: mode });
    get().bridge?.setMode(mode);
  },
}));
