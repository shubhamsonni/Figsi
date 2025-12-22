"use client"

import { useMyPresence, useOthers } from "@liveblocks/react";
import { useCallback } from "react";
import LiveCursor from "./Cursor/LiveCursor";

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;


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
    onPointerMove={handlePointerMove}
    onPointerLeave={handlePointerLeave}
    onPointerDown={handlePointerDown}
    className="border-5  border-green-500 
    h-screen w-full flex justify-center 
    items-center text-center"
    >
    <h1 className=" text-2xl text-white"> Liveblocks Figma Clone</h1>

        <LiveCursor others={others}/>
    </div>
  )
}

export default Live