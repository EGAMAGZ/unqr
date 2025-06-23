import { IS_BROWSER } from "$fresh/src/runtime/utils.ts";

interface ColorSelectorProps {
  color: string;
  onInput: (event: Event) => void;
  name: string;
  class?: string;
}

export function ColorSelector(props: ColorSelectorProps) {
  return (
    <label
      class={`size-16 relative bg-white border border-primary rounded inline-flex justify-center items-center ${
        props.class ?? ""
      }`}
    >
      <div
        class="size-12 bg-black rounded-sm"
        style={{ backgroundColor: props.color }}
      >
      </div>
      <input
        type="color"
        value={props.color}
        onInput={props.onInput}
        class="absolute inset-0 w-full h-full invisible"
        name={props.name}
        disabled={!IS_BROWSER}
      />
    </label>
  );
}
interface ColorInputFieldProps {
  label: string;
  name: string;
  color: string;
  errorMessage: string | null;
  onInput: (event: Event) => void;
}
export function ColorInputField(props: ColorInputFieldProps) {
  return (
    <label class="form-control w-fit inline-flex items-center">
      <div class="label">
        <span class="label-text">{props.label}</span>
      </div>
      <ColorSelector
        onInput={props.onInput}
        color={props.color}
        name={props.name}
      />
      {props.errorMessage && (
        <div class="label">
          <span class="label-text text-error">{props.errorMessage}</span>
        </div>
      )}
    </label>
  );
}
