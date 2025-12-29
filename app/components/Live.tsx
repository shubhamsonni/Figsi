"use client"

import { useMyPresence, useOthers } from "@liveblocks/react";
import { useCallback, useRef } from "react";
import LiveCursor from "./Cursor/LiveCursor";

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  const containerRef = useRef<HTMLDivElement>(null);


const handlePointerMove = useCallback((event:React.
    PointerEvent)=>{
        event.preventDefault();

        const x =event.clientX - event.currentTarget.
        getBoundingClientRect().x;
        const y =event.clientY - event.currentTarget.
        getBoundingClientRect().y;

        updateMyPresence({cursor:{x , y}})
},[])

const handlePointerLeave = useCallback((event:React.
    PointerEvent)=>{
        event.preventDefault();

        updateMyPresence({cursor:null , message:null})
},[])

const handlePointerDown = useCallback((event:React.
    PointerEvent)=>{

        const x =event.clientX - event.currentTarget.
        getBoundingClientRect().x;
        const y =event.clientY - event.currentTarget.
        getBoundingClientRect().y;

        updateMyPresence({cursor :{x , y}})
},[])
  return (

<div
  ref={containerRef}
  onPointerMove={handlePointerMove}
  onPointerLeave={handlePointerLeave}
  onPointerDown={handlePointerDown}
  className="relative bg-[#0b1220] overflow-hidden"
  style={{
    width: 1440,
    height: 900,
    margin: "0 auto",
  }}
>

<h1 className="absolute inset-0 flex items-center justify-center text-2xl text-white">
  Liveblocks Figma Clone
</h1>

        <LiveCursor others={others}/>
    </div>
  )
}

export default Live