"use client"
import {
  Canvas,
  Object as FabricObject,
  TEvent,
  Point,
  util,
  PencilBrush,
} from "fabric";
import { v4 as uuid4 } from "uuid";

import {
  CanvasMouseDown,
  CanvasMouseMove,
  CanvasMouseUp,
  CanvasObjectModified,
  CanvasObjectScaling,
  CanvasPathCreated,
  CanvasSelectionCreated,
  RenderCanvas,
} from "@/types/type";
import { defaultNavElement } from "@/constants";
import { createSpecificShape } from "./shapes";

// initialize fabric canvas
export const initializeFabric = ({
  fabricRef,
  canvasRef,
}: {
  fabricRef: React.MutableRefObject<Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  if (!canvasRef.current) return null;

  const canvas = new Canvas(canvasRef.current, {
    width: canvasRef.current.clientWidth,
    height: canvasRef.current.clientHeight,
  });

  fabricRef.current = canvas;
  return canvas;
};


export const handleCanvasMouseDown = ({
  options,
  canvas,
  selectedShapeRef,
  isDrawing,
  shapeRef,
}: CanvasMouseDown) => {
  const pointer = canvas.getPointer(options.e);
  const target = canvas.findTarget(options.e, false);

  canvas.isDrawingMode = false;

  if (selectedShapeRef.current === "freeform") {
    isDrawing.current = true;

    const brush = new PencilBrush(canvas);
    brush.width = 5;
    brush.color = "#aabbcc";
    (canvas as any).freeDrawingBrush = brush;
    canvas.isDrawingMode = true;

    return;
  }

  if (
    target &&
    (target.type === selectedShapeRef.current ||
      target.type === "activeSelection")
  ) {
    isDrawing.current = false;
    canvas.setActiveObject(target);
    target.setCoords();
  } else {
    isDrawing.current = true;

    shapeRef.current = createSpecificShape(
      selectedShapeRef.current,
      pointer as any
    );

    if (shapeRef.current) {
      canvas.add(shapeRef.current);
    }
  }
};


// handle mouse move event on canvas to draw shapes with different dimensions
export const handleCanvaseMouseMove = ({
  options,
  canvas,
  isDrawing,
  selectedShapeRef,
  shapeRef,
  syncShapeInStorage,
}: CanvasMouseMove) => {
  // if selected shape is freeform, return
  if (!isDrawing.current) return;
  if (selectedShapeRef.current === "freeform") return;

  canvas.isDrawingMode = false;

  // get pointer coordinates
  const pointer = canvas.getPointer(options.e);

  // depending on the selected shape, set the dimensions of the shape stored in shapeRef in previous step of handelCanvasMouseDown
  // calculate shape dimensions based on pointer coordinates
  switch (selectedShapeRef?.current) {
    case "rectangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case "circle":
      shapeRef.current.set({
        radius: Math.abs(pointer.x - (shapeRef.current?.left || 0)) / 2,
      });
      break;

    case "triangle":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });
      break;

    case "line":
      shapeRef.current?.set({
        x2: pointer.x,
        y2: pointer.y,
      });
      break;

    case "image":
      shapeRef.current?.set({
        width: pointer.x - (shapeRef.current?.left || 0),
        height: pointer.y - (shapeRef.current?.top || 0),
      });

    default:
      break;
  }

  // render objects on canvas
  // renderAll: http://fabricjs.com/docs/fabric.Canvas.html#renderAll
  canvas.renderAll();

  // sync shape in storage
  if (shapeRef.current?.objectId) {
    syncShapeInStorage(shapeRef.current);
  }
};

// handle mouse up event on canvas to stop drawing shapes
export const handleCanvasMouseUp = ({
  canvas,
  isDrawing,
  shapeRef,
  activeObjectRef,
  selectedShapeRef,
  syncShapeInStorage,
  setActiveElement,
}: CanvasMouseUp) => {
  isDrawing.current = false;
  if (selectedShapeRef.current === "freeform") return;

  // sync shape in storage as drawing is stopped
  syncShapeInStorage(shapeRef.current);

  // set everything to null
  shapeRef.current = null;
  activeObjectRef.current = null;
  selectedShapeRef.current = null;

  // if canvas is not in drawing mode, set active element to default nav element after 700ms
  if (!canvas.isDrawingMode) {
    setTimeout(() => {
      setActiveElement(defaultNavElement);
    }, 700);
  }
};

// update shape in storage when object is modified
export const handleCanvasObjectModified = ({
  options,
  syncShapeInStorage,
}: CanvasObjectModified) => {
  const target = options.target;
  if (!target) return;

  if (target?.type == "activeSelection") {
    // fix this
  } else {
    syncShapeInStorage(target);
  }
};

// update shape in storage when path is created when in freeform mode
export const handlePathCreated = ({
  options,
  syncShapeInStorage,
}: CanvasPathCreated) => {
  // get path object
  const path = options.path;
  if (!path) return;

  // set unique id to path object
  path.set({
    objectId: uuid4(),
  });

  // sync shape in storage
  syncShapeInStorage(path);
};

// check how object is moving on canvas and restrict it to canvas boundaries
export const handleCanvasObjectMoving = ({
  options,
}: {
  options: TEvent;
}) => {
  if (!("target" in options)) return;

  const target = options.target as FabricObject | undefined;
  if (!target || !target.canvas) return;

  const canvas = target.canvas as Canvas;

  target.setCoords();

  if (target.left !== undefined) {
    target.left = Math.max(
      0,
      Math.min(target.left, canvas.width! - target.getScaledWidth())
    );
  }

  if (target.top !== undefined) {
    target.top = Math.max(
      0,
      Math.min(target.top, canvas.height! - target.getScaledHeight())
    );
  }
};




// set element attributes when element is selected
export const handleCanvasSelectionCreated = ({
  options,
  isEditingRef,
  setElementAttributes,
}: CanvasSelectionCreated) => {
  if (isEditingRef.current) return;
  if (!options?.selected) return;

  const selectedElement = options.selected[0] as FabricObject;

  if (selectedElement && options.selected.length === 1) {
    const scaledWidth =
      (selectedElement.width || 0) * (selectedElement.scaleX || 1);

    const scaledHeight =
      (selectedElement.height || 0) * (selectedElement.scaleY || 1);

    setElementAttributes({
      width: scaledWidth.toFixed(0),
      height: scaledHeight.toFixed(0),
  fill:
    typeof selectedElement.fill === "string"
      ? selectedElement.fill
      : "",  stroke:
    typeof selectedElement.stroke === "string"
      ? selectedElement.stroke
      : "",      // @ts-ignore
      fontSize: selectedElement.fontSize || "",
      // @ts-ignore
      fontFamily: selectedElement.fontFamily || "",
      // @ts-ignore
      fontWeight: selectedElement.fontWeight || "",
    });
  }
};

// update element attributes when element is scaled
export const handleCanvasObjectScaling = ({
  options,
  setElementAttributes,
}: CanvasObjectScaling) => {
  const selectedElement = options.target;

  // calculate scaled dimensions of the object
  const scaledWidth = selectedElement?.scaleX
    ? selectedElement?.width! * selectedElement?.scaleX
    : selectedElement?.width;

  const scaledHeight = selectedElement?.scaleY
    ? selectedElement?.height! * selectedElement?.scaleY
    : selectedElement?.height;

  setElementAttributes((prev) => ({
    ...prev,
    width: scaledWidth?.toFixed(0).toString() || "",
    height: scaledHeight?.toFixed(0).toString() || "",
  }));
};

// render canvas objects coming from storage on canvas
export const renderCanvas = ({
  fabricRef,
  canvasObjects,
  activeObjectRef,
}: RenderCanvas) => {
  const canvas = fabricRef.current;
  if (!canvas || !canvasObjects) return;

  canvas.clear();

  for (const [objectId, objectData] of canvasObjects.entries()) {
    util.enlivenObjects([objectData]).then((enlivenedObjects) => {
      enlivenedObjects.forEach((obj) => {
        if (activeObjectRef.current?.objectId === objectId) {
          canvas.setActiveObject(obj);
        }
        canvas.add(obj);
      });

      canvas.renderAll();
    });
  }
};



// resize canvas dimensions on window resize
export const handleResize = ({ canvas }: { canvas: Canvas | null }) => {
  if (!canvas) return;

  const parent = canvas.getElement().parentElement;
  if (!parent) return;

  canvas.setDimensions({
    width: parent.clientWidth,
    height: parent.clientHeight,
  });
  canvas.renderAll();
};

// zoom canvas on mouse scroll
export const handleCanvasZoom = ({
  options,
  canvas,
}: {
  options: TEvent & { e: WheelEvent };
  canvas: Canvas;
}) => {
  if (!options.e) return;

  const delta = options.e.deltaY;
  let zoom = canvas.getZoom();

  const minZoom = 0.2;
  const maxZoom = 1;
  const zoomStep = 0.001;

  zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep), maxZoom);

  const point = new Point(
    options.e.offsetX,
    options.e.offsetY
  );

  canvas.zoomToPoint(point, zoom);

  options.e.preventDefault();
  options.e.stopPropagation();
};
