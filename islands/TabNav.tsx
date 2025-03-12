import { useSignal } from "@preact/signals";
import { ComponentChildren } from "preact";

type Tab = {
  label: string;
  id: string;
  component: ComponentChildren;
};

interface TabNavProps {
  tabs: Tab[];
  class?: string;
}

export function TabNav(props: TabNavProps) {
  const activeTab = useSignal(props.tabs[0].label);

  return (
    <div class={`grid ${props.class ?? ""}`}>
      <div role="tablist" class="tabs tabs-boxed">
        {props.tabs.map((tab) => (
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
      {props.tabs.map((tab) =>
        tab.label === activeTab.value ? tab.component : null
      )}
    </div>
  );
}
