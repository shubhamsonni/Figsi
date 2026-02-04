"use client";

import { useEffect, useRef, useState } from "react";
import Live from "./components/Live";
import RightSideBar from "./components/RightSideBar";
import { Canvas, FabricObject } from "fabric";
import {
  handleCanvaseMouseMove,
  handleCanvasMouseDown,
  handleCanvasMouseUp,
  handleCanvasObjectModified,
  handleCanvasSelectionCreated,
  handleResize,
  initializeFabric,
  renderCanvas,
} from "@/lib/canvas";
import { ActiveElement, Attributes } from "@/types/type";
import LeftSidebar from "./components/LeftSidebar";
import Navbar from "./components/Navbar";
import { useMutation, useRedo, useStorage, useUndo } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";
import { defaultNavElement } from "@/constants";
import { handleDelete, handleKeyDown } from "@/lib/key-events";
import { handleImageUpload } from "@/lib/shapes";

export default function Page() {
  const undo = useUndo();
  const redo = useRedo();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const isDrawing = useRef(false);
  const shapeRef = useRef<FabricObject | null>(null);
  const selectedShapeRef = useRef<string | null>(null);

  const activeObjectRef = useRef<FabricObject | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isEditingRef = useRef(false);

  const canvasObjects = useStorage((root)=> root.canvasObjects)

  const [elementAttributes, setElementAttributes] = useState<Attributes>({
    width:'',
    height:'',
    fill:'#aabbcc',
    stroke:'#aabbcc',
    fontSize:'',
    fontFamily:'',
    fontWeight:''
  });

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

const deleteAllShapes = useMutation(
  ({ storage }) => {
    const canvasObjects = storage.get("canvasObjects");

    if (!(canvasObjects instanceof LiveMap) || canvasObjects.size === 0) 
      return true;
    

    for (const [key,value] of canvasObjects.entries()) {
      canvasObjects.delete(key);
    }

    return canvasObjects.size === 0;
  },[]);


const deleteShapeFromStorage = useMutation(
  ({ storage }, objectId) => {
    const canvasObjects = storage.get("canvasObjects");

    if (!(canvasObjects instanceof LiveMap)) return;

    canvasObjects.delete(objectId);
  },
  []
);

  const handleActiveElement = (elem: ActiveElement) => {
    setActiveElement(elem);

    switch (elem?.value) {
      case 'reset':
        deleteAllShapes()
        fabricRef.current?.clear();
        setActiveElement(defaultNavElement)
        break;
      case 'delete':
        handleDelete(fabricRef.current as any,
          deleteShapeFromStorage)
        setActiveElement(defaultNavElement)
        break;
      case 'image':
        imageInputRef.current?.click();
        isDrawing.current = false;
        if(fabricRef.current){
          fabricRef.current.isDrawingMode = false;
        }
        break;

      default:
        break;
    }

    selectedShapeRef.current = elem?.value as string;
  }

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });
    if (!canvas) return;

    const mouseDownHandler = (options: any ) => {
      handleCanvasMouseDown({
        options,
        canvas,
        isDrawing,
        shapeRef,
        selectedShapeRef,
      });
    };
    canvas.on("mouse:down", mouseDownHandler);

    const mouseMoveHandler = (options: any ) => {
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

    const mouseUpHandler = () => {
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
    
    
    const objectModifiedHandler = (options: any ) => {
          handleCanvasObjectModified({
            options,
            syncShapeInStorage,
          });
    };
    canvas.on("object:modified", objectModifiedHandler);

    canvas.on("selection:created", (options:any) => {
    handleCanvasSelectionCreated({
      options,
      isEditingRef,
      setElementAttributes
    });
  })
 
    const resizeHandler = () => handleResize({ canvas });
    window.addEventListener("resize", resizeHandler);

    window.addEventListener("keydown", (e: any) =>{
      handleKeyDown({
        canvas: fabricRef.current as any,
        e,
        undo,
        redo,
        deleteShapeFromStorage,
        syncShapeInStorage
      })
    })

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
        imageInputRef={imageInputRef}
        handleImageUpload={(e:any)=>{
          e.stopPropagation();

          handleImageUpload({
            file: e.target.files[0],
            canvas: fabricRef as any,
            syncShapeInStorage,
            shapeRef
          })
        }}
      />  
      <section className="flex h-[calc(100vh-64px)] flex-row">
<LeftSidebar
  allShapes={canvasObjects ? Array.from(canvasObjects.values()) : []}
/>
        <Live canvasRef={canvasRef} />
        <RightSideBar 
          elementAttributes={elementAttributes}
          setElementAttributes={setElementAttributes} 
          fabricRef={fabricRef}
          isEditingRef={isEditingRef}
          activeObjectRef={activeObjectRef}
          syncShapeInStorage={syncShapeInStorage}
        />
      </section>
    </main>
  );
}
