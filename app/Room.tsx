"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { LiveMap } from "@liveblocks/client";
import Loader from "./components/Loader";

export function Room({ children }: { children: ReactNode }) {
  return (
    <LiveblocksProvider publicApiKey={"pk_dev_zbrhuT_X6diiFuFw5zl079JheU6HsdyqYpCdLMhAcfo3pRQV0Mcmm2bdkkkUyrF0"}>
      <RoomProvider id="my-room" 
      initialPresence={{
        cursor:null, cursorColor:null,editingText:null
      }}
      initialStorage={{
        canvasObjects:new LiveMap()
      }}
      >
        <ClientSideSuspense fallback={<Loader />}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}