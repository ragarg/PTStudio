import { App, Material, Scene, Object as SceneObject, DEFAUT_MATERIAL } from '@tsraycaster/pt-engine';
import { isWorkerRequest, type MaterialData, type MaterialParams, type ObjectData, type WorkerRequest, type WorkerResponse } from './protocol';

let app: App | null = null;
const scope = self;

scope.onmessage = async (event: MessageEvent<unknown>) => {
  if (!isWorkerRequest(event.data)) {
    post({ type: 'error', error: 'Worker received a message that does not match the protocol.' });
    return;
  }

  const message: WorkerRequest = event.data;
  try {
    if (message.type === 'init') {
      if (app) throw new Error('The rendering engine has already been initialized.');

      app = new App();
      app.onObjectLoaded = () => {
        const scene = app?.actualScene;
        if (!scene) {
          post({ type: 'error', error: 'Cannot publish scene data before the scene is initialized.' });
          return;
        }
        postSceneData(scene);
      };
      await app.init(message.width, message.height, message.canvas);
      if (!app.actualScene) throw new Error('The rendering engine initialized without a scene.');

      postSceneData(app.actualScene);
      post({ type: 'ready' });
      return;
    }

    if (!app?.render || !app.actualScene) {
      throw new Error('The rendering engine has not been initialized.');
    }

    const scene = app.actualScene;
    switch (message.type) {
      case 'setMode':
        app.render.changeMode(message.mode);
        app.resetAccumulation();
        return;
      case 'Event':
        app.eventSystem.add(message.event);
        return;
      case 'setPosition': {
        const object = scene.getObjectByUUID(message.id);
        if (!object) throw new Error(`Cannot set position: object ${message.id} does not exist.`);
        object.setTranslation(message.position);
        app.render.updateScene(scene);
        app.resetAccumulation();
        postSceneData(scene);
        return;
      }
      case 'setScale': {
        const object = scene.getObjectByUUID(message.id);
        if (!object) throw new Error(`Cannot set scale: object ${message.id} does not exist.`);
        object.setScale(message.scale);
        app.render.updateScene(scene);
        app.resetAccumulation();
        postSceneData(scene);
        return;
      }
      case 'setMaterial': {
        const object = scene.getObjectByUUID(message.id);
        if (!object) throw new Error(`Cannot set material: object ${message.id} does not exist.`);
        const material = scene.getMaterialByUUID(message.materialId);
        if (!material) throw new Error(`Cannot set material: material ${message.materialId} does not exist.`);
        object.material = material;
        app.render.updateScene(scene);
        app.resetAccumulation();
        postSceneData(scene);
        return;
      }
      case 'setMaterialParams': {
        const material = scene.getMaterialByUUID(message.materialId);
        if (!material) throw new Error(`Cannot set material parameters: material ${message.materialId} does not exist.`);

        material.albedo.set(message.params.albedo);
        material.emission.set(message.params.emission);
        material.roughnessX = message.params.roughnessX;
        material.roughnessY = message.params.roughnessY;
        material.metallic = message.params.metallic;
        material.ior = message.params.ior;
        material.transmission = message.params.transmission;
        app.render.updateScene(scene);
        app.resetAccumulation();
        post({ type: 'getMateriaParams', params: extractMaterialParams(material) });
        return;
      }
      case 'getMateriaParams': {
        const material = scene.getMaterialByUUID(message.id);
        post({ type: 'getMateriaParams', params: extractMaterialParams(material ?? DEFAUT_MATERIAL) });
        return;
      }
      case 'getTransform': {
        const object = scene.getObjectByUUID(message.id);
        post({ type: 'getTransform', transform: {
            translation: new Float32Array(object?.translation ?? [0, 0, 0]),
            scale: new Float32Array(object?.scale ?? [1, 1]),
          } });
        return;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[gpu.worker]', error);
    post({ type: 'error', error: message });
  }
};

function post(message: WorkerResponse): void {
  scope.postMessage(message);
}

function postSceneData(scene: Scene): void {
  const objects = scene.objects.map((object: SceneObject): ObjectData => ({
    name: object.name,
    UUID: object.UUID,
    primitiveType: object.primitiveType,
    materialUUID: object.material.UUID,
    transform: {
      translation: new Float32Array(object.translation),
      scale: new Float32Array(object.scale),
    },
  }));
  const materials = scene.materials.map((material: Material): MaterialData => ({
    name: material.name,
    UUID: material.UUID,
  }));
  post({ type: 'sceneData', objects, materials });
}

function extractMaterialParams(material: Material): MaterialParams {
  return {
    albedo: new Float32Array(material.albedo),
    emission: new Float32Array(material.emission),
    roughnessX: material.roughnessX,
    roughnessY: material.roughnessY,
    metallic: material.metallic,
    ior: material.ior,
    transmission: material.transmission,
  }
}
