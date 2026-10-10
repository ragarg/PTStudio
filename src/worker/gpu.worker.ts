import { App, Object as SceneObject, type ObjectData } from "@tsraycaster/pt-engine";
import { isWorkerRequest, type WorkerRequest, type WorkerResponse } from "./protocol";

let app: App | null = null;

const scope = self;

scope.onmessage = async (e: MessageEvent<unknown>) => {
  if (!isWorkerRequest(e.data)) {
    console.error('[gpu.worker] Received a message that does not match the protocol.', e.data);
    return;
  }

  const message: WorkerRequest = e.data;

  if (message.type === 'init') {
    app = new App();
    app.onObjectLoaded = () => post({ type: 'objectLoaded' });
    await app.init(message.width, message.height, message.canvas);
    post({ type: 'ready' });
    return;
  }

  if (!app?.render || !app.actualScene) return;

  switch (message.type) {
    case 'render':
      return;
    case 'setMode':
      app.render.changeMode(message.mode);
      app.resetAccumulation();
      return;
    case 'camera': {
      const position = new Float32Array(message.camera?.position ?? [5, 0, 5]);
      const direction = new Float32Array(message.camera?.direction ?? [-1, 0, 1]);
      app.actualScene.updateCamera(position, direction);
      app.render.updateCamera();
      app.resetAccumulation();
      return;
    }
    case 'getObjects':
      post({ type: 'setObjects', objects: app.actualScene.objects.map((object: Object, index: number) => toSceneObjectData(object, index)) });
      return;
    case 'getObject': {
      const object = app.actualScene.objects[message.id];
      post({ type: 'setObject', object: object ? toSceneObjectData(object, message.id) : null });
      return;
    }
    case 'Event':
      app.eventSystem?.add(message.event);
      return;
    case 'setPosition': {
      const object = app.actualScene.objects[message.id];
      if (!object) {
        console.error(`[gpu.worker] Cannot set position: object ${message.id} does not exist.`);
        return;
      }
      object.setTranslation(message.position);
      app.render.updateScene(app.actualScene);
      app.resetAccumulation();
      return;
    }
    case 'setScale': {
      const object = app.actualScene.objects[message.id];
      if (!object) {
        console.error(`[gpu.worker] Cannot set position: object ${message.id} does not exist.`);
        return;
      }
      object.setScale(message.scale);
      app.render.updateScene(app.actualScene);
      app.resetAccumulation();
      return;
    }
    case 'setMaterial': {
      const object = app.actualScene.objects[message.id];
      if (!object) {
        console.error(`[gpu.worker] Cannot set material: object ${message.id} does not exist.`);
        return;
      }
      const material = app.actualScene.materials[message.materialIndex];
      if (!material) {
        console.error(`[gpu.worker] Cannot set material: material ${message.materialIndex} does not exist.`);
        return;
      }
      object.material = material;
      app.render.updateScene(app.actualScene);
      app.resetAccumulation();
      return;
    }
  }
};

function post(message: WorkerResponse, transfer: Transferable[] = []): void {
  scope.postMessage(message, { transfer });
}

function toSceneObjectData(object: SceneObject, index: number): ObjectData {
  return {
    id: index,
    translation: object.translation,
    scale: object.scale,
    primitiveType: object.primitiveType,
    name: object.name,
    UUID: object.UUID,
    materialName: object.material.name,
    materialUUID: object.material.UUID,
    materialIndex: app?.actualScene?.materials.findIndex((material) => material.UUID === object.material.UUID) ?? -1,
  };
}