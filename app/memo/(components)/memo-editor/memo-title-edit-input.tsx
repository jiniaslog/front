import React from 'react'
import { useMemoSystem } from '../../(usecase)/memo-system-usecases'

export const MemoTitleInput: React.FC = () => {
  const { memoEditorSharedContext, setMemoTitle } = useMemoSystem()
  return (
    <div className="">
      <input
        className="border-2 bg-gray-900 text-green-400 p-2 mb-2 w-full outline-none caret-green-400 focus:outline-none"
        type="text"
        placeholder="untitled"
        value={memoEditorSharedContext.title}
        onChange={(e) => {
          setMemoTitle(e.target.value)
        }}
      />
    </div>
  )
}
