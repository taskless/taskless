import React from "react";

interface TabsProps {
  labels: string[];
}

export const TabContext = React.createContext("");

function classNames(...classes: (string | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export const Tabs: React.FC<TabsProps> = ({ labels, children }) => {
  const [currentTab, setCurrentTab] = React.useState(labels[0]);

  return (
    <TabContext.Provider value={currentTab}>
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-t-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
            defaultValue={labels[0]}
          >
            {labels.map((tab) => (
              <option key={tab}>{tab}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            {labels.map((tab) => (
              <button
                key={tab}
                className={classNames(
                  tab === currentTab
                    ? "bg-gray-100 text-gray-700"
                    : "text-gray-500 hover:text-gray-700",
                  "px-3 py-2 font-medium text-sm rounded-t-md"
                )}
                aria-current={tab ? "page" : undefined}
                onClick={() => setCurrentTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="rounded-b-md rounded-tr-md bg-gray-100 px-4 pt-2 pb-4">
        {children}
      </div>
    </TabContext.Provider>
  );
};

interface TabProps {
  label: string;
}

export const Tab: React.FC<TabProps> = ({ label, children }) => {
  const currentTab = React.useContext(TabContext);

  if (label !== currentTab) {
    return null;
  }

  return <>{children}</>;
};
