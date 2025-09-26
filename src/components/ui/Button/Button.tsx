import styles from './Button.module.css'
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' }
export default function Button({ variant='primary', ...props }: Props){
  return <button className={`${styles.btn} ${styles[variant]}`} {...props} />
}
