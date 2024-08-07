import NewFolder from './new-folder'
import { MemoSearch } from './memo-search'
import React, { useState } from 'react'
import ReferenceSystem from './reference-system'
import { usePathname } from 'next/navigation'
import NewMemo from './new-memo'
import { useMemoSystem } from '../../../(usecase)/memo-system-usecases'

export default function NavigatorHeader (): React.ReactElement {
  const [isSearchInputVisible, setSearchInputVisible] = useState(false)
  const { navigatorContext } = useMemoSystem()
  const pathname = usePathname()
  const isNotGraphPage = pathname.startsWith('/memo/')

  return (
    <div className={'flex p-2 flex-row-reverse border-t-2 border-l-2 border-r-2 bg-gray-900 '}>
      {!isSearchInputVisible && !navigatorContext.isReferenceMode && (
        <>
          <NewMemo/>
          <NewFolder/>
        </>
      )}
      {!isSearchInputVisible && isNotGraphPage && (
        <ReferenceSystem/>
      )}
      {
        !navigatorContext.isReferenceMode && <MemoSearch
          isInputVisible={isSearchInputVisible}
          setInputVisible={setSearchInputVisible}
        />
      }
    </div>
  )
}
