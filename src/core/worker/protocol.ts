import type { InputEvent } from '@tsraycaster/pt-engine';
import type { UUID } from 'crypto';

export type NodeId = UUID;
export type RenderMode = 0 | 1;

export type WorkerRequest =
  | { type: 'init'; width: number; height: number; canvas: OffscreenCanvas }
  | { type: 'setMode'; mode: RenderMode }
  | { type: 'Event'; event: InputEvent }
  | { type: 'setPosition'; id: NodeId; position: Float32Array }
  | { type: 'setScale'; id: NodeId; scale: Float32Array }
  | { type: 'setMaterial'; id: NodeId; materialId: NodeId }
  | { type: 'setMaterialParams'; id: NodeId; materialId: NodeId; params: MaterialParams }
  | { type: 'getMateriaParams'; id: NodeId; }
  | { type: 'getTransform'; id: NodeId; };

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'sceneData'; objects: ObjectData[]; materials: MaterialData[] }
  | { type: 'error'; error: string }
  | { type: 'getMateriaParams'; params: MaterialParams; }
  | { type: 'getTransform'; transform: Transform; };

export interface Transform {
  translation: Float32Array;
  scale: Float32Array;
}

export interface ObjectData {
  name: string;
  UUID: NodeId;
  primitiveType: number;
  materialUUID: NodeId;
  transform: Transform;
}

export interface MaterialData {
  name: string;
  UUID: NodeId;
}

export interface MaterialParams {
  albedo: Float32Array;
  emission: Float32Array;
  roughnessX: number;
  roughnessY: number;
  metallic: number;
  ior: number;
  transmission: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFloat32Array(value: unknown): value is Float32Array {
  return value instanceof Float32Array;
}

function isInputEvent(value: unknown): value is InputEvent {
  if (!isRecord(value) || typeof value.eventType !== 'string') return false;

  if (value.eventType === 'keydown' || value.eventType === 'keyup') {
    return typeof value.code === 'string' && typeof value.key === 'string';
  }

  if (value.eventType === 'resize') {
    return typeof value.width === 'number'
      && typeof value.height === 'number'
      && typeof value.dpr === 'number';
  }

  if (value.eventType === 'mousemove' || value.eventType === 'mousedown' || value.eventType === 'mouseup') {
    return isRecord(value.coord)
      && typeof value.coord.x === 'number'
      && typeof value.coord.y === 'number'
      && typeof value.button === 'number';
  }

  return false;
}

function isObjectData(value: unknown): value is ObjectData {
  if (!isRecord(value) || !isRecord(value.transform)) return false;
  return typeof value.name === 'string'
    && typeof value.UUID === 'string'
    && typeof value.primitiveType === 'number'
    && typeof value.materialUUID === 'string'
    && isFloat32Array(value.transform.translation)
    && isFloat32Array(value.transform.scale);
}

function isMaterialData(value: unknown): value is MaterialData {
  return isRecord(value)
    && typeof value.name === 'string'
    && typeof value.UUID === 'string';
}

function isMaterialParams(value: unknown): value is MaterialParams {
  return isRecord(value)
    && isFloat32Array(value.albedo)
    && isFloat32Array(value.emission)
    && typeof value.roughnessX === 'number'
    && typeof value.roughnessY === 'number'
    && typeof value.metallic === 'number'
    && typeof value.ior === 'number'
    && typeof value.transmission === 'number';
}

function isTransform(value: unknown): value is Transform {
  return isRecord(value)
    && isFloat32Array(value.translation)
    && isFloat32Array(value.scale);
}

export function isWorkerRequest(value: unknown): value is WorkerRequest {
  if (!isRecord(value) || typeof value.type !== 'string') return false;

  switch (value.type) {
    case 'init':
      return typeof value.width === 'number'
        && Number.isFinite(value.width)
        && value.width > 0
        && typeof value.height === 'number'
        && Number.isFinite(value.height)
        && value.height > 0
        && typeof OffscreenCanvas !== 'undefined'
        && value.canvas instanceof OffscreenCanvas;
    case 'setMode':
      return value.mode === 0 || value.mode === 1;
    case 'Event':
      return isInputEvent(value.event);
    case 'setPosition':
      return typeof value.id === 'string'
        && isFloat32Array(value.position);
    case 'setScale':
      return typeof value.id === 'string' && isFloat32Array(value.scale);
    case 'setMaterial':
      return typeof value.id === 'string' && typeof value.materialId === 'string';
    case 'setMaterialParams':
      return typeof value.id === 'string'
        && typeof value.materialId === 'string'
        && isMaterialParams(value.params);
    case 'getMateriaParams':
      return typeof value.id === 'string';
    case 'getTransform':
      return typeof value.id === 'string';
    default:
      return false;
  }
}

export function isWorkerResponse(value: unknown): value is WorkerResponse {
  if (!isRecord(value) || typeof value.type !== 'string') return false;

  switch (value.type) {
    case 'ready':
      return true;
    case 'sceneData':
      return Array.isArray(value.objects)
        && value.objects.every(isObjectData)
        && Array.isArray(value.materials)
        && value.materials.every(isMaterialData);
    case 'getMateriaParams':
      return isMaterialParams(value.params);
    case 'getTransform':
      return isTransform(value.transform);
    case 'error':
      return typeof value.error === 'string';
    default:
      return false;
  }
}
