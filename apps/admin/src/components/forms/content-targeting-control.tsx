import { relatedServiceOptions, serviceLabel, type RelatedService } from "@/lib/content/related-services";
import { subServiceLabel, subServiceOptions } from "@/lib/content/sub-services";
import styles from "./content-targeting-control.module.css";

type Props = {
  idPrefix: string;
  services: RelatedService[];
  subServices: string[];
  onServicesChange: (value: RelatedService[]) => void;
  onSubServicesChange: (value: string[]) => void;
  servicesError?: string;
  subServicesError?: string;
};

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function Chips({ label, values, format, onRemove }: { label: string; values: string[]; format: (value: string) => string; onRemove: (value: string) => void }) {
  if (!values.length) return null;
  return <ul aria-label={label} className={styles.chips}>{values.map((value) => <li className={styles.chip} key={value}>
    <span>{format(value)}</span>
    <button aria-label={`Remove ${format(value)}`} className={styles.remove} onClick={() => onRemove(value)} type="button">×</button>
  </li>)}</ul>;
}

export function ContentTargetingControl({ idPrefix, services, subServices, onServicesChange, onSubServicesChange, servicesError, subServicesError }: Props) {
  // Offer sub-services for the selected services (all of them when none is selected), and always
  // keep currently selected known sub-services visible so they never disappear unexpectedly.
  const visible = subServiceOptions.filter((option) => !services.length || services.includes(option.service) || subServices.includes(option.value));
  return <div className={styles.root}>
    <fieldset className={styles.group}>
      <legend>Related Services</legend>
      <div className={styles.options}>{relatedServiceOptions.map((option) => <label className={styles.option} htmlFor={`${idPrefix}-service-${option.value}`} key={option.value}>
        <input checked={services.includes(option.value)} id={`${idPrefix}-service-${option.value}`} onChange={() => onServicesChange(toggle(services, option.value))} type="checkbox" />{option.label}
      </label>)}</div>
      <Chips format={serviceLabel} label="Selected services" onRemove={(value) => onServicesChange(services.filter((item) => item !== value))} values={services} />
      {!services.length ? <p className={styles.muted}>No services selected. This item is not targeted to any service.</p> : null}
      {servicesError ? <p className={styles.error} role="alert">{servicesError}</p> : null}
    </fieldset>
    <fieldset className={styles.group}>
      <legend>Related Sub-services</legend>
      <div className={styles.options}>{visible.map((option) => <label className={styles.option} htmlFor={`${idPrefix}-sub-${option.value}`} key={option.value}>
        <input checked={subServices.includes(option.value)} id={`${idPrefix}-sub-${option.value}`} onChange={() => onSubServicesChange(toggle(subServices, option.value))} type="checkbox" />{option.label}
      </label>)}</div>
      <Chips format={subServiceLabel} label="Selected sub-services" onRemove={(value) => onSubServicesChange(subServices.filter((item) => item !== value))} values={subServices} />
      {!subServices.length ? <p className={styles.muted}>No sub-services selected.</p> : null}
      {subServicesError ? <p className={styles.error} role="alert">{subServicesError}</p> : null}
    </fieldset>
  </div>;
}
