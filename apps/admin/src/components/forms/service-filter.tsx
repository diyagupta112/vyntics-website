import { FormField } from "./form-field";
import { Select } from "@/components/ui/select";
import styles from "./service-filter.module.css";

type Option = { label: string; value: string };

type Props = {
  idPrefix: string;
  parentLabel: string;
  childLabel: string;
  allParents: string;
  allChildren: string;
  parents: readonly Option[];
  childOptions: (parent: string) => readonly Option[];
  parent: string;
  child: string;
  onChange: (parent: string, child: string) => void;
};

/** Dependent parent / child filter. The child is only meaningful with a parent, and is cleared when the parent changes. */
export function ServiceFilter({ idPrefix, parentLabel, childLabel, allParents, allChildren, parents, childOptions, parent, child, onChange }: Props) {
  const visibleChildren = parent ? childOptions(parent) : [];
  return <div className={styles.filters}>
    <FormField htmlFor={`${idPrefix}-parent-filter`} label={parentLabel}>
      <Select id={`${idPrefix}-parent-filter`} value={parent} onChange={(event) => {
        const next = event.target.value;
        if (next === parent) return;
        onChange(next, next && childOptions(next).some((option) => option.value === child) ? child : "");
      }}>
        <option value="">{allParents}</option>
        {parents.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select>
    </FormField>
    <FormField htmlFor={`${idPrefix}-child-filter`} label={childLabel}>
      <Select id={`${idPrefix}-child-filter`} value={child} disabled={!parent} onChange={(event) => onChange(parent, event.target.value)}>
        <option value="">{allChildren}</option>
        {visibleChildren.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Select>
    </FormField>
  </div>;
}
