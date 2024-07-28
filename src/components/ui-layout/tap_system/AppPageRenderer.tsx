import React from 'react'
import SignInPage from '@/auth/components/SignInPage'
import AdminAccessDenied from '@/auth/components/AccessDeniedPage'
import MemoFolderContainer from '@/components/memo/MemoFolderContainer'
import { useSession } from '@/auth/application/usecase/SessionUseCases'

export function RenderPage ({ tabs, path, page }: {
  tabs: any
  path: string
  page: React.ReactNode
}): React.ReactElement | null {
  const { session } = useSession()

  function renderMemoContainer (): React.ReactElement {
    if (session == null) {
      return (
        <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
          <SignInPage/>
        </div>
      )
    } else if (session?.roles.values().next().value !== 'ADMIN') {
      return (
        <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
          <AdminAccessDenied/>
        </div>
      )
    } else {
      return (
        <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
          <MemoFolderContainer>
            {page}
          </MemoFolderContainer>
        </div>
      )
    }
  }

  function renderOthers (): React.ReactElement | null {
    return (
      <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
        {page}
      </div>
    )
  }

  if (tabs.length > 0 && (path !== '/empty') && path.startsWith('/memo')) {
    return renderMemoContainer()
  } else if (tabs.length > 0 && (path !== '/empty')) {
    return renderOthers()
  } else {
    return null
  }
}
