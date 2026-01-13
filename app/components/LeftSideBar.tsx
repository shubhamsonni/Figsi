"use client";

import { useMemo } from "react";
import Image from "next/image";
import { getShapeInfo } from "@/lib/utils";

const LeftSidebar = ({ allShapes }: { allShapes: Array<any> }) => {
  const memoizedShapes = useMemo(
    () => (
      <section className="flex flex-col border-t border-gray-800 bg-black text-primary-grey-300 min-w-56.75 sticky left-0 h-full max-sm:hidden select-none overflow-y-auto pb-20">
        <h3 className="border border-gray-800 px-5 py-4 text-xs text-white uppercase">
          Layers
        </h3>

        <div className="flex flex-col">
          {allShapes?.map((shape: any) => {
            // ✅ shape IS the object
            const info = getShapeInfo(shape?.type);

            if (!shape?.objectId) return null;

            return (
              <div
                key={shape.objectId} // ✅ stable, unique key
                className="group my-1 flex items-center gap-2 px-5 py-2.5 hover:cursor-pointer hover:bg-green-800 hover:text-black"
              >
                <Image
                  src={info?.icon}
                  alt="Layer"
                  width={16}
                  height={16}
                  className="group-hover:invert"
                />
                <h3 className="text-sm group-hover:invert font-semibold capitalize text-white">
                  {info?.name}
                </h3>

              </div>
            );
          })}
        </div>
      </section>
    ),
    [allShapes]
  );

  return memoizedShapes;
};

export default LeftSidebar;
