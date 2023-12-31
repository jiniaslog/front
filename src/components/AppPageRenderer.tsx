import MemoFolderContainer from '@/components/memo/MemoFolderContainer'
import React from 'react'
import { AuthSessionContext } from '@/components/auth/AuthSessionProvider'
import SignInAndOutContainer from '@/components/auth/SignInAndOutContainer'
import { type Session } from '@/api/session'
import AdminAccessDenied from '@/components/auth/AccessDenied'

export function RenderPage ({ tabs, path, page }: {
  tabs: any
  path: string
  page: React.ReactNode
}): React.ReactElement | null {
  const { session }: { session: Session } = React.useContext(AuthSessionContext)

  function renderMemoContainer (): React.ReactElement {
    if (session == null) {
      return (
        <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
          <SignInAndOutContainer/>
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
    if (tabs.length > 0 && (path !== '/empty')) {
      return (
        <div className="bg-gray-700 p-4 rounded-b-lg overflow-auto">
          {page}
        </div>
      )
    } else {
      return null
    }
  }

  if (tabs.length > 0 && (path !== '/empty') && path.startsWith('/memo')) {
    return renderMemoContainer()
  } else if (tabs.length > 0 && (path !== '/empty')) {
    return renderOthers()
  } else {
    return null
  }
}
