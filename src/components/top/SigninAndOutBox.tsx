import React, { useContext, useState } from 'react'
import { AuthSessionContext } from '@/components/auth/AuthSessionProvider'
import SignInModal from '@/components/auth/SignInModal'
import Image from 'next/image'
import signIn from '../../../public/signin.png'
import logout from '../../../public/logout.png'

export default function SignInAndOutBox (): React.ReactElement {
  const { session, setSession } = useContext(AuthSessionContext)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const handleLogout = async (): Promise<void> => {
    try {
      setSession(null)
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  const toggleLoginModal = (): void => {
    setShowLoginModal(!showLoginModal)
  }

  return (
    session != null
      ? (
        <div className="retro-container rounded-lg inline-flex items-center pr-4">
          <Image
            src={session.picUrl}
            alt={'프로필 사진'}
            width={32} // 실제 픽셀 크기
            height={32} // 실제 픽셀 크기
            className="w-8 h-8 mr-2 rounded-full"
          />
          <span className="text-gray-300 mr-4 dos-font">
        {session.nickName} 님
      </span>
          <Image
            src={logout}
            alt={'로그아웃'}
            onClick={() => {
              handleLogout().catch((err) => {
                console.error('Error:', err)
              })
            }}
            className="hover:bg-gray-600 h-8 w-8 font-bold rounded-full"
          >
          </Image>
        </div>
        )
      : (<>
          <button
            onClick={toggleLoginModal}
            className="retro-font bg-gray-500 inline-flex items-center hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-5">
            <Image src={signIn} alt={'로그인'} className="w-5 h-5 mr-2"/>
            LOGIN
          </button>
          {showLoginModal && <SignInModal onClose={() => {
            setShowLoginModal(false)
          }}/>}
        </>
        )
  )
}
