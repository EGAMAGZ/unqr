import { Signal } from "@preact/signals";

interface ColorSelectorProps {
  color: Signal<string>;
  onInput: (color: string) => void;
  class?: string;
}

export function ColorSelector(props: ColorSelectorProps) {
  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    props.color.value = target.value;
    props.onInput(target.value);
  };

  return (
    <label
      class={`size-16 relative bg-white border border-primary rounded inline-flex justify-center items-center ${
        props.class ?? ""
      }`}
    >
      <div
        class="size-12 bg-black rounded-sm"
        style={{ backgroundColor: props.color.value }}
      >
      </div>
      <input
        type="color"
        value={props.color.value}
        onInput={handleInput}
        class="absolute inset-0 w-full h-full invisible"
      />
    </label>
  );
}
