import styles from '@/styles/components/textarea.module.css'
import { HTMLProps } from 'react'

export  function Textarea({...rest}: HTMLProps<HTMLTextAreaElement>) {
  return (
    <>
      <textarea className={styles.textarea}{...rest}></textarea>
      </>
  )
}
