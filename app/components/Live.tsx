"use client"

import { useMyPresence, useOthers } from "@liveblocks/react";
import { useCallback, useEffect, useRef, useState } from "react";
import LiveCursor from "./Cursor/LiveCursor";
import CursorChat from "./Cursor/CursorChat";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import ReactionSelector from "./reaction/ReactionButton";
import FlyingReaction from "./reaction/FlyingReaction";
import useInterval from "@/hooks/useInterval";

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;

    const[cursorState , setCursorState] = useState<CursorState>({
        mode: CursorMode .Hidden
    })
    const [reaction, setReaction]= useState<Reaction[]>
    ([])

    useInterval(()=>{
        if(cursorState.mode===CursorMode.Reaction &&
            cursorState.isPressed && cursor){
                setReaction((reactions) => reactions.concat([
                    {
                        point:{x:cursor.x,y:cursor.y},
                        value: cursorState.reaction,
                        timestamp:Date.now()
                    }
                ]))
            }
    },100)

  const containerRef = useRef<HTMLDivElement>(null);


const handlePointerMove = useCallback((event:React.
    PointerEvent)=>{
        event.preventDefault();

        if(cursor == null || cursorState.mode!==CursorMode.
            ReactionSelector){
                const x =event.clientX - event.currentTarget.
                getBoundingClientRect().x;
                const y =event.clientY - event.currentTarget.
                getBoundingClientRect().y;
        
                updateMyPresence({cursor:{x , y}})
            }
},[])

const handlePointerLeave = useCallback((event:React.
    PointerEvent)=>{
       setCursorState({ mode: CursorMode.Hidden})

        updateMyPresence({cursor:null , message:null})
},[])

const handlePointerDown = useCallback((event: React.PointerEvent) => {
  const x =
    event.clientX -
    event.currentTarget.getBoundingClientRect().x;

  const y =
    event.clientY -
    event.currentTarget.getBoundingClientRect().y;

  updateMyPresence({ cursor: { x, y } });

  setCursorState((state: CursorState) =>
    cursorState.mode === CursorMode.Reaction
      ? { ...state, isPressed: true }
      : state
  );
}, [cursorState.mode, setCursorState]);


const handlePointerUp = useCallback(
  (event: React.PointerEvent) => {
    setCursorState((state: CursorState) =>
      cursorState.mode === CursorMode.Reaction
        ? { ...state, isPressed: true }
        : state
    );
  },[cursorState.mode, setCursorState]);



useEffect(()=>{
    const onKeyUp = (e:KeyboardEvent)=>{
        if (e.key==='/'){
            setCursorState({
                mode:CursorMode.Chat,
                previousMessage :null,
                messge:''
            })
        } else if(e.key==='Escape'){
            updateMyPresence({message:''})
            setCursorState({mode: CursorMode.Hidden})
        } else if(e.key === 'e'){
            setCursorState({
                mode: CursorMode.ReactionSelector
            })
        }
    }

    const onKeyDown = (e:KeyboardEvent)=>{
        if(e.key==='/'){
            e.preventDefault()
        }
    }
    window.addEventListener('keyup',onKeyUp);
    window.addEventListener('keydown',onKeyDown)

    return()=>{
        window.removeEventListener('keyup',onKeyUp);
        window.removeEventListener('keydown',onKeyDown)
    }
},[updateMyPresence])

const setReactions= useCallback((reaction:string)=>
{
    setCursorState({mode: CursorMode.Reaction,
        reaction, isPressed:false
    })
},[])

  return (

<div
  ref={containerRef}
  onPointerMove={handlePointerMove}
  onPointerLeave={handlePointerLeave}
  onPointerDown={handlePointerDown}
  onPointerUp={handlePointerUp}
  className="relative bg-[#0b1220] overflow-hidden"
  style={{
    width: 1280,
    height: 665,
    margin: "0 auto",
  }}
>

<h1 className="absolute inset-0 flex items-center justify-center text-2xl text-white">
  Liveblocks Figma Clone
</h1>

{reaction.map((r)=>(
    <FlyingReaction
    key={r.timestamp.toString()}
    x={r.point.x}
    y={r.point.y}
    timestamp={r.timestamp}
    value={r.value}
    />
))}

{cursor &&(
    <CursorChat
    cursor={cursor}
    cursorState={cursorState}
    setCursorState={setCursorState}
    updateMyPresence={updateMyPresence}
    />
)}

    {cursorState.mode ===  CursorMode.ReactionSelector
    && (
        <ReactionSelector 
        setReaction={setReactions}
        />
    )}

        <LiveCursor others={others}/>
    </div>
  )
}

export default Live