'use client'

import React, { useEffect } from 'react'
import TabLink from '@/components/ui-layout/tap_system/TabLink'
import { sideBarItems } from '@/components/system/sidebar/sideBarItems'
import { Auth } from '@/auth/application/domain/Session'
import { useSession } from '@/auth/application/usecase/SessionUseCases'
import { useSideBar } from '@/system/application/usecase/SideBarUseCases'

export default function Sidebar (): React.ReactElement {
  const { isCollapsed, toggleSideBarCollapse }: {
    isCollapsed: boolean
    toggleSideBarCollapse: () => void
  } = useSideBar()
  const sidebarWidth = isCollapsed ? 'w-0 md:w-20' : 'w-96 md:w-72'
  const overlayStyle = isCollapsed ? 'invisible md:visible opacity-0 md:opacity-100 md:inline' : 'opacity-100'
  const { session } = useSession()

  useEffect(() => {
    if (isCollapsed) {
      document.removeEventListener('click', toggleSideBarCollapse)
    } else {
      document.addEventListener('click', toggleSideBarCollapse)
    }
    return () => {
      document.removeEventListener('click', toggleSideBarCollapse)
    }
  }, [toggleSideBarCollapse])

  return (
    <div className={`
    transform ${sidebarWidth} transition-width duration-300 ease-in-out`}
    >
      <aside className="p-4 h-full">
        <div className={'pt-2 pb-4 mb-4 border-b border-gray-300 flex justify-between items-center truncate'}>
          <div
            className={`cursor-pointer ${overlayStyle}`}
            onClick={toggleSideBarCollapse}
          >
            <span
              className={` text-3xl ${overlayStyle} transition-all duration-300:ease-in-out pb-1 pr-1 pl-1 rounded-xl border-2`}
            >
            {'>_'}
            </span>
            <span
              className={`retro-font pl-2 text-2xl ${overlayStyle} transition-all duration-300 ease-in-out`}
            >
              {'Hello_World'}
          </span>
          </div>
          {!isCollapsed && (
            <button
              className={`retro-font cursor-pointer rounded focus:outline-none focus:ring ${overlayStyle}`}
              onClick={toggleSideBarCollapse}
            >
              X
            </button>
          )}
        </div>
        <ul className={`list-none ${overlayStyle}`}>
          {sideBarItems.map(({ name, href, icon: Icon, auth }) => {
            if (auth === Auth.Guest ||
              (auth === Auth.User && session !== null) ||
              (auth === Auth.Admin && session?.roles.values().next().value === Auth.Admin)) {
              return (
                <TabLink name={name} href={href} key={name}>
                  <li
                    className="flex items-center mb-2 last:mb-0 overflow-auto truncate cursor-pointer hover:bg-gray-800 pb-2"
                  >
                    <span className="inline-block text-3xl pl-2 mr-2"><Icon/></span>
                    <span
                      className={`retro-font inline-block text-2xl transition-all duration-300 ease-in-out ${overlayStyle}`}>
                  {name}
                </span>
                  </li>
                </TabLink>
              )
            }
            return null
          })}
        </ul>
      </aside>
    </div>
  )
};
