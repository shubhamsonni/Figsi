import {
  Canvas,
  Object as FabricObject,
  util,
} from "fabric";
import { v4 as uuidv4 } from "uuid";

import { CustomFabricObject } from "@/types/type";

export const handleCopy = (canvas: Canvas) => {
  const activeObjects = canvas.getActiveObjects();

  if (activeObjects.length > 0) {
    const serializedObjects = activeObjects.map((obj) => obj.toObject());
    localStorage.setItem("clipboard", JSON.stringify(serializedObjects));
  }

  return activeObjects;
};

export const handlePaste = (
  canvas: Canvas,
  syncShapeInStorage: (shape: FabricObject) => void
) => {
  if (!canvas || !(canvas instanceof Canvas)) {
    console.error("Invalid canvas object. Aborting paste operation.");
    return;
  }

  const clipboardData = localStorage.getItem("clipboard");
  if (!clipboardData) return;

  try {
    const parsedObjects = JSON.parse(clipboardData);

    parsedObjects.forEach((objData: any) => {
      util.enlivenObjects([objData]).then((enlivenedObjects) => {
        enlivenedObjects.forEach((obj) => {
          const fabricObj = obj as FabricObject & CustomFabricObject<any>;

          fabricObj.set({
            left: (fabricObj.left ?? 0) + 20,
            top: (fabricObj.top ?? 0) + 20,
            objectId: uuidv4(),
            fill: "#aabbcc",
          });

          canvas.add(fabricObj);
          syncShapeInStorage(fabricObj);
        });

        canvas.renderAll();
      });
    });
  } catch (error) {
    console.error("Error parsing clipboard data:", error);
  }
};

export const handleDelete = (
  canvas: Canvas,
  deleteShapeFromStorage: (id: string) => void
) => {
  const activeObjects = canvas.getActiveObjects();
  if (!activeObjects || activeObjects.length === 0) return;

  activeObjects.forEach((obj) => {
    const fabricObj = obj as CustomFabricObject<any>;
    if (!fabricObj.objectId) return;

    canvas.remove(fabricObj as unknown as FabricObject);
    deleteShapeFromStorage(fabricObj.objectId);
  });

  canvas.discardActiveObject();
  canvas.requestRenderAll();
};

export const handleKeyDown = ({
  e,
  canvas,
  undo,
  redo,
  syncShapeInStorage,
  deleteShapeFromStorage,
}: {
  e: KeyboardEvent;
  canvas: Canvas;
  undo: () => void;
  redo: () => void;
  syncShapeInStorage: (shape: FabricObject) => void;
  deleteShapeFromStorage: (id: string) => void;
}) => {
  // COPY (Ctrl/Cmd + C)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 67) {
    handleCopy(canvas);
  }

  // PASTE (Ctrl/Cmd + V)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 86) {
    handlePaste(canvas, syncShapeInStorage);
  }

  // CUT (Ctrl/Cmd + X)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 88) {
    handleCopy(canvas);
    handleDelete(canvas, deleteShapeFromStorage);
  }

  // UNDO (Ctrl/Cmd + Z)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 90) {
    undo();
  }

  // REDO (Ctrl/Cmd + Y)
  if ((e.ctrlKey || e.metaKey) && e.keyCode === 89) {
    redo();
  }

  // Prevent "/" default
  if (e.keyCode === 191 && !e.shiftKey) {
    e.preventDefault();
  }
};
