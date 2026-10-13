import { FormField } from "./form-field";
import { Select } from "@/components/ui/select";
import { relatedServiceOptions, type RelatedService } from "@/lib/content/related-services";

export function RelatedServiceControl({ id, value, onChange, error }: {
  id: string;
  value: RelatedService | "";
  onChange: (value: RelatedService | "") => void;
  error?: string;
}) {
  return <FormField htmlFor={id} label="Related Service" error={error}>
    <Select id={id} value={value} aria-invalid={Boolean(error)} onChange={(event) => onChange(event.target.value as RelatedService | "")}>
      <option value="">No Related Service</option>
      {relatedServiceOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </Select>
  </FormField>;
}
