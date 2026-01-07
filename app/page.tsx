"use client";

import { useEffect, useRef, useState } from "react";
import Live from "./components/Live";
import RightSideBar from "./components/RightSideBar";

import { Canvas, Object as FabricObject } from "fabric";
import {
  handleCanvasMouseDown,
  handleResize,
  initializeFabric,
} from "@/lib/canvas";
import { ActiveElement } from "@/types/type";
import LeftSidebar from "./components/LeftSidebar";
import Navbar from "./components/Navbar";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const isDrawing = useRef(false);
  const shapeRef = useRef<FabricObject | null>(null);
  const selectedShapeRef = useRef<string | null>("rectangle");

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

    const resizeHandler = () => handleResize({ canvas });
    window.addEventListener("resize", resizeHandler);

    return () => {
      canvas.off("mouse:down", mouseDownHandler);
      window.removeEventListener("resize", resizeHandler);
      canvas.dispose();
    };
  }, []);

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
