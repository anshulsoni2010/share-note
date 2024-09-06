import React, { useState } from 'react'
import EditorHead from './EditorHead'
import EditorBody from './EditorBody'
import EditorFoot from './EditorFoot'

const EditorBase = () => {
  const [keyWordStatus, setKeyWordStatus] = useState(false)
  return (
    <main className='md:w-[65vw] h-screen  flex flex-col gap-2 mx-auto p-1 py-16 md:py-16 md:pb-10 '>
     <EditorHead/>
     <EditorBody/>

     {
       keyWordStatus ? <EditorFoot setKeyWordStatus={setKeyWordStatus}/> : <button className='text-sm self-start font-semibold hover:underline' onClick={()=>setKeyWordStatus(true)}>Add Keywords</button>
     }
      <span className='text-sm font-semibold select-none mx-auto opacity-70 fixed left-1/2 bottom-2 transform -translate-x-1/2 text-nowrap '>Made with ❤️ by <a href="https://x.com/anshulsoni2010" target='_blank' className='hover:underline'>Anshul Soni</a></span>

    </main>
  )
}

export default EditorBase
