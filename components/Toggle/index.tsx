import { SyntheticEvent } from 'react'
import cx from 'classnames'
import styles from './Toggle.module.scss'
type Option = {
  id: string,
  label: string,
  value: string,
  checked: boolean,

}
type Props = {
  legend: string,
  onChange: (e: SyntheticEvent<HTMLInputElement | HTMLLabelElement | HTMLButtonElement>) => void,
  optionLeft: Option,
  optionRight: Option,
  className?: string,
}


export default function Toggle({
  legend,
  optionLeft,
  optionRight,
  className,
  onChange,
  ...otherProps
}: Props) {
  return (
    <fieldset
      {...otherProps}
      className={cx(styles['toggle-fieldset'], className)}
    >
      <legend className="visually-hidden">{legend}</legend>
      <div className={styles.toggle}>
        <input
          type="radio"
          id={optionLeft.id}
          value={optionLeft.value}
          key={optionLeft.id}
          onChange={onChange}
          className={styles.input}
          checked={optionLeft.checked}
        />
        <label
          htmlFor={optionLeft.id}
          className={styles.label}
          onClick={optionRight.checked ? onChange : undefined}
        >
          {optionLeft.label}
        </label>
        <input
          type="radio"
          id={optionRight.id}
          value={optionRight.value}
          key={optionRight.id}
          checked={optionRight.checked}
          onChange={onChange}
          className={styles.input}
        />
        <label
          htmlFor={optionRight.id}
          className={styles.label}
          onClick={optionRight.checked ? onChange : undefined}
        >
          {optionRight.label}
        </label>
        {/* I wouldn't usually advocate using tabIndex at all, but we don't want this to be keyboard focusable */}
        <button
          tabIndex={-1}
          type="button"
          className={styles.switch}
          onClick={onChange}
          aria-hidden={true}
        >
          {optionLeft.checked ? optionLeft.label : optionRight.label}
        </button>
      </div>
    </fieldset>
  )
}
