"use client";

import { useEffect, useRef, useState } from "react";
import Live from "./components/Live";
import RightSideBar from "./components/RightSideBar";

import { Canvas, Object as FabricObject } from "fabric";
import {
  handleCanvaseMouseMove,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "@/lib/canvas";
import { ActiveElement } from "@/types/type";
import LeftSidebar from "./components/LeftSidebar";
import Navbar from "./components/Navbar";
import { useMutation, useStorage } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const isDrawing = useRef(false);
  const shapeRef = useRef<FabricObject | null>(null);
  const selectedShapeRef = useRef<string | null>("rectangle");

  const activeObjectRef = useRef<FabricObject | null>(null);

  const canvasObjects = useStorage((root)=> root.canvasObjects)

const syncShapeInStorage = useMutation(
  ({ storage }, object) => {
    if (!object) return;

    const { objectId } = object;

    const shapeData = object.toJSON();
    shapeData.objectId = objectId;

    const canvasObjects = storage.get("canvasObjects");

    if (!(canvasObjects instanceof LiveMap)) return;

    canvasObjects.set(objectId, shapeData);
  },
  []
);
  const [activeElement, setActiveElement] = useState<ActiveElement>({
    name:'',
    value:'',
    icon:'',
  })

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    selectedShapeRef.current = elem?.value as string;
  }

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });
    if (!canvas) return;

    const mouseDownHandler = (options ) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });
    };
    canvas.on("mouse:down", mouseDownHandler);

    const mouseMoveHandler = (options ) => {
      handleCanvaseMouseMove({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage
      });
    };
    canvas.on("mouse:move", mouseMoveHandler);

    const mouseUpHandler = (options ) => {
      handleCanvasMouseUp({
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
        syncShapeInStorage,
        setActiveElement,
        activeObjectRef
      });
    };
    canvas.on("mouse:up", mouseUpHandler);
    
    
    const objectModifiedHandler = (options ) => {
          handleCanvasObjectModified({
            options,
            syncShapeInStorage,
          });
    };
    canvas.on("object:modified", objectModifiedHandler);


    const resizeHandler = () => handleResize({ canvas });
    window.addEventListener("resize", resizeHandler);

    return () => {
      canvas.off("mouse:down", mouseDownHandler);
      canvas.off("mouse:move", mouseMoveHandler);
      canvas.off("mouse:up", mouseUpHandler);
      canvas.off("object:modified", objectModifiedHandler);
      window.removeEventListener("resize", resizeHandler);
      canvas.dispose();
    };
  }, []);

  useEffect(()=>{
    renderCanvas({
      fabricRef,
      canvasObjects,
      activeObjectRef
    })
  },[canvasObjects])

  return (
    <main className="h-screen overflow-hidden">
      <Navbar
        activeElement={activeElement}
        handleActiveElement={handleActiveElement}
      />
      <section className="flex h-[calc(100vh-64px)] flex-row">
        <LeftSidebar />
        <Live canvasRef={canvasRef} />
        <RightSideBar />
      </section>
    </main>
  );
}
