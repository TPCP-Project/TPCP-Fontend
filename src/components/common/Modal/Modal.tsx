import { useEffect } from 'react'
import styles from './Modal.module.css'

type Props = { open: boolean; onClose: () => void; children: React.ReactNode }
export default function Modal({ open, onClose, children }: Props){
  useEffect(()=>{
    if(!open) return
    const onKey=(e:KeyboardEvent)=> e.key==='Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  },[open,onClose])
  if(!open) return null
  return <div className={styles.backdrop} onClick={onClose}>
    <div className={styles.modal} onClick={e=>e.stopPropagation()}>{children}</div>
  </div>
}
