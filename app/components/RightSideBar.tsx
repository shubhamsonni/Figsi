import React from 'react'
import Dimensions from './settings/Dimensions'
import Text from './settings/Text'
import Color from './settings/Color'
import Export from './settings/Export'

const RightSideBar = () => {
  return (
  <section className="flex flex-col border-t
    border-gray-800 bg-black text-gray-300 
    min-2-[227px] sticky right-0 h-full max-sm:hidden select-none ">
        <h3 className="px-5 pt-4 text-xs uppercase">Design</h3>
        <span className="text-xs text-gray-300 mt-3 
        px-5 border-b border-gray-800 pb-4">Make changes</span>

        <Dimensions />
        <Text />
        <Color />
        <Color />
        <Export />
        
    </section>
  )
}

export default RightSideBar