import { AiOutlineFileText } from 'react-icons/ai'
import { BsPeople } from 'react-icons/bs'
import { Auth } from '@/auth/application/domain/session'

export const sideBarItems = [
  {
    name: 'About',
    href: '/about',
    icon: BsPeople,
    auth: Auth.Guest
  },
  {
    name: 'Memo',
    href: '/memo',
    icon: AiOutlineFileText,
    auth: Auth.Admin
  }
]
