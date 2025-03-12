import { useSignal } from "@preact/signals";
import { ComponentChildren } from "preact";

type Tab = {
  label: string;
  id: string;
  component: ComponentChildren;
};

interface TabNavProps {
  tabs: Tab[];
}

export function TabNav({ tabs }: TabNavProps) {
  const activeTab = useSignal(tabs[0].label);
  return (
    <div class="grid">
      <div role="tablist" class="tabs tabs-boxed w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            class={`tab ${tab.label === activeTab.value ? "tab-active" : ""}`}
            onClick={() => (activeTab.value = tab.label)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => tab.label === activeTab.value ? tab.component : null)}
    </div>
  );
}
