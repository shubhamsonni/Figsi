"use client"
import { useRef } from "react";
import LeftSideBar from "./components/LeftSideBar";
import Live from "./components/Live";
import Navbar from "./components/Navbar";
import RightSideBar from "./components/RightSideBar";
import { fabric } from "fabric";

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>

  return (
    <main className="h-screen overflow-hidden">
      <Navbar/>
      <section className="flex h-full flex-row">
      
      <LeftSideBar />
      <Live />
      <RightSideBar />
</section>

      </main>
  );
}