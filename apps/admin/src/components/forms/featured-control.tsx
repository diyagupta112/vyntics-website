import styles from "./featured-control.module.css";

type Props = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  resourceName: string;
  error?: string;
};

export function FeaturedControl({ id, checked, onChange, resourceName, error }: Props) {
  return (
    <div className={styles.field}>
      <span className={styles.heading}>Featured</span>
      <label className={styles.control} htmlFor={id}>
        <input
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          checked={checked}
          id={id}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span>Feature this {resourceName} on the website</span>
      </label>
      {error ? <p id={`${id}-error`} role="alert">{error}</p> : null}
    </div>
  );
}
