"use client";

import { useEffect, useRef } from "react";
import LeftSideBar from "./components/LeftSideBar";
import Live from "./components/Live";
import Navbar from "./components/Navbar";
import RightSideBar from "./components/RightSideBar";

import { Canvas, Object as FabricObject } from "fabric";
import {
  handleCanvasMouseDown,
  handleResize,
  initializeFabric,
} from "@/lib/canvas";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<Canvas | null>(null);

  const isDrawing = useRef(false);
  const shapeRef = useRef<FabricObject | null>(null);
  const selectedShapeRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = initializeFabric({ canvasRef, fabricRef });
    if (!canvas) return;

    const mouseDownHandler = (options: any) => {
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
      <Navbar />
      <section className="flex h-[calc(100vh-64px)] flex-row">
        <LeftSideBar />
        <Live />
        <RightSideBar />
      </section>
    </main>
  );
}
