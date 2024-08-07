import React from 'react'
import googleLogo from '../../../public/retro-google.png'
import Image from 'next/image'
import CommonModal from '../../(layout)/(components)/(common)/common-modal'
import { LoginButton } from './login-button'
import { OauthProvider } from '../(domain)/oauth-provider'
import { useSession } from '../(usecase)/session-usecases'

export default function SignInModal ({ onClose }: { onClose: () => void }): React.ReactElement | null {
  const { session } = useSession()
  if (session !== null) {
    return null
  }
  return (
    <CommonModal onClose={onClose}>
      <h2 className="retro-font text-xl font-bold mb-4 text-gray-300">SOCIAL LOGIN</h2>
      <LoginButton
        className={'retro-font bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold py-2 px-4 rounded-lg border-2 border-gray-700 inline-flex items-center justify-center w-full'}
        provider={OauthProvider.GOOGLE}
        logo={<Image src={googleLogo} alt={'google'} className="w-5 h-5 mr-2"/>}
        title={'Google Login'}
      />
    </CommonModal>
  )
}
