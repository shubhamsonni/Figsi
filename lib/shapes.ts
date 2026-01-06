"use client";

import {
  Canvas,
  Rect,
  Triangle,
  Circle,
  Line,
  IText,
  Image as FabricImage,
} from "fabric";
import { v4 as uuidv4 } from "uuid";

import {
  CustomFabricObject,
  ElementDirection,
  ImageUpload,
  ModifyShape,
} from "@/types/type";

/* -------------------------------------------------------------------------- */
/*                               CREATE SHAPES                                */
/* -------------------------------------------------------------------------- */

export const createRectangle = (pointer: PointerEvent) => {
  return new Rect({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: "#aabbcc",
    objectId: uuidv4(),
  } as CustomFabricObject<Rect>);
};

export const createTriangle = (pointer: PointerEvent) => {
  return new Triangle({
    left: pointer.x,
    top: pointer.y,
    width: 100,
    height: 100,
    fill: "#aabbcc",
    objectId: uuidv4(),
  } as CustomFabricObject<Triangle>);
};

export const createCircle = (pointer: PointerEvent) => {
  return new Circle({
    left: pointer.x,
    top: pointer.y,
    radius: 100,
    fill: "#aabbcc",
    objectId: uuidv4(),
  } as CustomFabricObject<Circle>);
};

export const createLine = (pointer: PointerEvent) => {
  return new Line(
    [pointer.x, pointer.y, pointer.x + 100, pointer.y + 100],
    {
      stroke: "#aabbcc",
      strokeWidth: 2,
      objectId: uuidv4(),
    } as CustomFabricObject<Line>
  );
};

export const createText = (pointer: PointerEvent, text: string) => {
  return new IText(text, {
    left: pointer.x,
    top: pointer.y,
    fill: "#aabbcc",
    fontFamily: "Helvetica",
    fontSize: 36,
    fontWeight: "400",
    objectId: uuidv4(),
  });
};

/* -------------------------------------------------------------------------- */
/*                           SHAPE FACTORY                                    */
/* -------------------------------------------------------------------------- */

export const createSpecificShape = (
  shapeType: string,
  pointer: PointerEvent
) => {
  switch (shapeType) {
    case "rectangle":
      return createRectangle(pointer);

    case "triangle":
      return createTriangle(pointer);

    case "circle":
      return createCircle(pointer);

    case "line":
      return createLine(pointer);

    case "text":
      return createText(pointer, "Tap to Type");

    default:
      return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                           IMAGE UPLOAD (v6)                                */
/* -------------------------------------------------------------------------- */

export const handleImageUpload = async ({
  file,
  canvas,
  shapeRef,
  syncShapeInStorage,
}: ImageUpload) => {
  const reader = new FileReader();

  reader.onload = async () => {
    const img = await FabricImage.fromURL(
      reader.result as string
    );

    img.scaleToWidth(200);
    img.scaleToHeight(200);

    (img as any).objectId = uuidv4();

    canvas.current.add(img);
    shapeRef.current = img;

    syncShapeInStorage(img);
    canvas.current.requestRenderAll();
  };

  reader.readAsDataURL(file);
};

/* -------------------------------------------------------------------------- */
/*                           CREATE SHAPE                                     */
/* -------------------------------------------------------------------------- */

export const createShape = (
  canvas: Canvas,
  pointer: PointerEvent,
  shapeType: string
) => {
  if (shapeType === "freeform") {
    canvas.isDrawingMode = true;
    return null;
  }

  return createSpecificShape(shapeType, pointer);
};

/* -------------------------------------------------------------------------- */
/*                           MODIFY SHAPE                                     */
/* -------------------------------------------------------------------------- */

export const modifyShape = ({
  canvas,
  property,
  value,
  activeObjectRef,
  syncShapeInStorage,
}: ModifyShape) => {
  const selectedElement = canvas.getActiveObject();

  if (!selectedElement || selectedElement.type === "activeSelection") return;

  if (property === "width") {
    selectedElement.set({
      scaleX: 1,
      width: value,
    });
  } else if (property === "height") {
    selectedElement.set({
      scaleY: 1,
      height: value,
    });
  } else {
    const key = property as keyof typeof selectedElement;
    if ((selectedElement as any)[key] === value) return;
    selectedElement.set(key, value);
  }

  activeObjectRef.current = selectedElement;
  syncShapeInStorage(selectedElement);
};

/* -------------------------------------------------------------------------- */
/*                         BRING TO FRONT / BACK                               */
/* -------------------------------------------------------------------------- */

export const bringElement = ({
  canvas,
  direction,
  syncShapeInStorage,
}: ElementDirection) => {
  if (!canvas) return;

  const selectedElement = canvas.getActiveObject();
  if (!selectedElement || selectedElement.type === "activeSelection") return;

  if (direction === "front") {
    canvas.bringToFront(selectedElement);
  } else if (direction === "back") {
    canvas.sendToBack(selectedElement);
  }

  syncShapeInStorage(selectedElement);
};
