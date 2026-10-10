import type { InputEvent, ObjectData } from '@tsraycaster/pt-engine';

export type RenderMode = 0 | 1;

export type WorkerRequest =
  | { type: 'init'; width: number; height: number; canvas: OffscreenCanvas }
  | { type: 'render' }
  | { type: 'setMode'; mode: RenderMode }
  | { type: 'camera'; camera?: { position?: Float32Array; direction?: Float32Array } }
  | { type: 'getObjects' }
  | { type: 'getObject'; id: number }
  | { type: 'Event'; event: InputEvent }
  | { type: 'setPosition'; id: number; position: Float32Array }
  | { type: 'setScale'; id: number; scale: Float32Array }
  | { type: 'setMaterial'; id: number; materialIndex: number };

export type WorkerResponse =
  | { type: 'ready' }
  | { type: 'objectLoaded' }
  | { type: 'setObjects'; objects: ObjectData[] }
  | { type: 'setObject'; object: ObjectData | null };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFloat32Array(value: unknown): value is Float32Array {
  return value instanceof Float32Array;
}

export function isInputEvent(value: unknown): value is InputEvent {
  if (!isRecord(value) || typeof value.eventType !== 'string') return false;

  if (value.eventType === 'keydown' || value.eventType === 'keyup') {
    return typeof value.code === 'string' && typeof value.key === 'string';
  }

  if (value.eventType === 'resize') {
    return typeof value.width === 'number' && typeof value.height === 'number';
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
  return isRecord(value)
    && isFloat32Array(value.translation)
    && isFloat32Array(value.scale)
    && typeof value.primitiveType === 'number'
    && typeof value.id === 'number'
    && typeof value.name === 'string'
    && typeof value.UUID === 'string'
    && typeof value.materialUUID === 'string'
    && typeof value.materialName === 'string'
    && typeof value.materialIndex === 'number';
}

export function isWorkerRequest(value: unknown): value is WorkerRequest {
  if (!isRecord(value) || typeof value.type !== 'string') return false;

  switch (value.type) {
    case 'init':
      return typeof value.width === 'number'
        && typeof value.height === 'number'
        && typeof OffscreenCanvas !== 'undefined'
        && value.canvas instanceof OffscreenCanvas;
    case 'render':
    case 'getObjects':
      return true;
    case 'setMode':
      return value.mode === 0 || value.mode === 1;
    case 'camera':
      if (value.camera === undefined) return true;
      return isRecord(value.camera)
        && (value.camera.position === undefined || isFloat32Array(value.camera.position))
        && (value.camera.direction === undefined || isFloat32Array(value.camera.direction));
    case 'getObject':
      return typeof value.id === 'number';
    case 'Event':
      return isInputEvent(value.event);
    case 'setPosition':
      return typeof value.id === 'number' && isFloat32Array(value.position);
    case 'setScale':
      return typeof value.id === 'number' && isFloat32Array(value.scale);
    case 'setMaterial':
      return typeof value.id === 'number' && typeof value.materialIndex === 'number';
    default:
      return false;
  }
}

export function isWorkerResponse(value: unknown): value is WorkerResponse {
  if (!isRecord(value) || typeof value.type !== 'string') return false;

  switch (value.type) {
    case 'ready':
    case 'objectLoaded':
      return true;
    case 'setObjects':
      return Array.isArray(value.objects) && value.objects.every(isObjectData);
    case 'setObject':
      return value.object === null || isObjectData(value.object);
    default:
      return false;
  }
}
