import type { InputEvent, ResizeEvent } from '@tsraycaster/pt-engine';
import type { MaterialParams, NodeId, RenderMode, WorkerRequest, WorkerResponse } from './protocol';
import { isWorkerResponse } from './protocol';

export type RenderBridgeEvent =
  | WorkerResponse
  | { type: 'error'; error: Error };

export type { RenderMode } from './protocol';

export default class RenderBridge {
  private readonly worker: Worker;
  private readonly listeners = new Set<(event: RenderBridgeEvent) => void>();

  public constructor() {
    this.worker = new Worker(
      new URL('./gpu.worker.ts', import.meta.url),
      { type: 'module' },
    );
    this.worker.addEventListener('message', this.handleMessage);
    this.worker.addEventListener('error', this.handleError);
    this.worker.addEventListener('messageerror', this.handleMessageError);
  }

  public subscribe(listener: (event: RenderBridgeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public initialize(canvas: OffscreenCanvas, width: number, height: number): void {
    this.send({ type: 'init', width, height, canvas }, [canvas]);
  }

  public setMode(mode: RenderMode): void {
    this.send({ type: 'setMode', mode });
  }

  public sendInput(event: InputEvent): void {
    this.send({ type: 'Event', event });
  }

  public sendResize(event: ResizeEvent): void {
    this.send({ type: 'Event', event });
  }

  public setPosition(id: NodeId, position: Float32Array): void {
    this.send({ type: 'setPosition', id, position });
  }

  public setScale(id: NodeId, scale: Float32Array): void {
    this.send({ type: 'setScale', id, scale });
  }

  public setMaterial(id: NodeId, materialId: NodeId): void {
    this.send({ type: 'setMaterial', id, materialId });
  }

  public setMaterialParams(id: NodeId, materialId: NodeId, params: MaterialParams): void {
    this.send({ type: 'setMaterialParams', id, materialId, params });
  }

  public getMateriaParams(id: NodeId): void {
    this.send({ type: 'getMateriaParams', id });
  }

  public getTransform(id: NodeId): void {
    this.send({ type: 'getTransform', id });
  }

  public terminate(): void {
    this.worker.removeEventListener('message', this.handleMessage);
    this.worker.removeEventListener('error', this.handleError);
    this.worker.removeEventListener('messageerror', this.handleMessageError);
    this.worker.terminate();
    this.listeners.clear();
  }

  private send(message: WorkerRequest, transfer: Transferable[] = []): void {
    this.worker.postMessage(message, transfer);
  }

  private handleMessage = (event: MessageEvent<unknown>): void => {
    if (!isWorkerResponse(event.data)) {
      this.emit({
        type: 'error',
        error: new TypeError('Worker returned a message that does not match the protocol.'),
      });
      return;
    }

    this.emit(event.data);
  };

  private handleError = (event: ErrorEvent): void => {
    this.emit({ type: 'error', error: new Error(event.message || 'Worker failed.') });
  };

  private handleMessageError = (): void => {
    this.emit({ type: 'error', error: new Error('Could not deserialize a message from the worker.') });
  };

  private emit(event: RenderBridgeEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }
}
