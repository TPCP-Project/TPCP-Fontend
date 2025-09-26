import styles from './Card.module.css'
export default function Card({ title, subtitle, children }:{ title?:string; subtitle?:string; children?:React.ReactNode }){
  return <div className={styles.card}>
    {title && <h3>{title}</h3>}
    {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    <div>{children}</div>
  </div>
}
