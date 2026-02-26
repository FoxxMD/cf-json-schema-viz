'use client';
import * as React from 'react';
import { Combobox } from '@base-ui/react/combobox';
import { Check, X, CaretDown, Sun, Moon } from '@phosphor-icons/react';
import { JsonSchemaViewer } from 'cf-json-schema-viz';

interface ModelInfo {
  id: string;
  name: string;
  description: string;
  label: string;
  value: string;
}

interface ModelGroup {
  value: string;
  items: ModelInfo[];
}

interface SchemaData {
  input: object;
  output: object;
}

interface ModelsResponse {
  models: Record<string, Array<{ id: string; name: string; description: string }>>;
  total: number;
  error?: string;
}

interface SchemaResponse {
  input?: object;
  output?: object;
  error?: string;
}

export function App() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [modelGroups, setModelGroups] = React.useState<ModelGroup[]>([]);
  const [selectedModel, setSelectedModel] = React.useState<ModelInfo | null>(null);
  const [schema, setSchema] = React.useState<SchemaData | null>(null);
  const [schemaType, setSchemaType] = React.useState<'input' | 'output'>('input');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch models on mount
  React.useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json() as Promise<ModelsResponse>)
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          // Transform to grouped format for Combobox
          const groups: ModelGroup[] = Object.entries(data.models).map(([task, models]) => ({
            value: task,
            items: models.map((m) => ({
              ...m,
              label: m.name,
              value: m.id,
            })),
          }));
          setModelGroups(groups);

          // Select first Text Generation model by default
          const textGenGroup = groups.find((g) => g.value === 'Text Generation');
          if (textGenGroup?.items.length) {
            setSelectedModel(textGenGroup.items[0]);
          }
        }
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  // Fetch schema when model changes
  React.useEffect(() => {
    if (!selectedModel) return;

    setSchema(null);
    fetch(`/api/schema/${encodeURIComponent(selectedModel.id)}`)
      .then((res) => res.json() as Promise<SchemaResponse>)
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSchema(data as SchemaData);
          setError(null);
        }
      })
      .catch((err) => setError(String(err)));
  }, [selectedModel]);

  const currentSchema = schema?.[schemaType];

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">
              Workers AI Schema Viewer
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Explore input/output schemas for all Workers AI models
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 
                       bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Model Selector & Toggle */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {/* Combobox */}
          <div className="flex-1 min-w-[300px]">
            <Combobox.Root
              value={selectedModel}
              onValueChange={setSelectedModel}
              items={modelGroups}
              disabled={loading}
            >
              <div className="relative">
                <Combobox.Input
                  placeholder={loading ? 'Loading models...' : 'Search models...'}
                  className="w-full px-4 py-3 pr-20 rounded-lg border border-gray-200 dark:border-gray-700
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5">
                  <Combobox.Clear
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 
                               text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Clear"
                  >
                    <X size={16} />
                  </Combobox.Clear>
                  <Combobox.Trigger
                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700
                               text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Open"
                  >
                    <CaretDown size={16} />
                  </Combobox.Trigger>
                </div>
              </div>

              <Combobox.Portal>
                <Combobox.Positioner className="z-50" sideOffset={4}>
                  <Combobox.Popup
                    className="w-[var(--anchor-width)] max-h-80 overflow-auto rounded-lg border 
                               border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 
                               shadow-lg"
                  >
                    <Combobox.Empty className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                      No models found.
                    </Combobox.Empty>
                    <Combobox.List className="p-1">
                      {(group: ModelGroup) => (
                        <Combobox.Group key={group.value}>
                          <Combobox.GroupLabel
                            className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 
                                       uppercase tracking-wider"
                          >
                            {group.value}
                          </Combobox.GroupLabel>
                          {group.items.map((model) => (
                            <Combobox.Item
                              key={model.id}
                              value={model}
                              className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer
                                         text-gray-900 dark:text-gray-100
                                         data-[highlighted]:bg-blue-50 dark:data-[highlighted]:bg-blue-900/30
                                         data-[selected]:font-medium"
                            >
                              <Combobox.ItemIndicator className="w-4 h-4 text-blue-600 dark:text-blue-400">
                                <Check size={16} weight="bold" />
                              </Combobox.ItemIndicator>
                              <span className="flex-1 truncate">{model.name}</span>
                            </Combobox.Item>
                          ))}
                        </Combobox.Group>
                      )}
                    </Combobox.List>
                  </Combobox.Popup>
                </Combobox.Positioner>
              </Combobox.Portal>
            </Combobox.Root>
          </div>

          {/* Input/Output Toggle */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {(['input', 'output'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSchemaType(type)}
                className={`px-5 py-3 font-medium capitalize transition-colors
                  ${
                    schemaType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Model Info */}
        {selectedModel && (
          <div className="mb-4 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <code className="text-sm text-gray-600 dark:text-gray-400">{selectedModel.id}</code>
            {selectedModel.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {selectedModel.description}
              </p>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Schema Viewer */}
        <div 
          className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800"
          data-theme={darkMode ? 'dark' : 'light'}
        >
          {!currentSchema ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              {loading ? 'Loading...' : 'Select a model to view its schema'}
            </div>
          ) : (
            <JsonSchemaViewer
              schema={currentSchema as any}
              defaultExpandedDepth={2}
            />
          )}
        </div>
      </div>
    </div>
  );
}
