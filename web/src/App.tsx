import { type FormEvent, useState } from "react";
import {
  type Resource,
  getGetResourcesQueryKey,
  useDeleteResourcesId,
  useGetResources,
  usePostResources,
  usePutResourcesId,
} from "./api";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = ["Equipment", "Room", "Vehicle", "Personnel", "Other"];

function ResourceForm({
  onSubmit,
  isPending,
  submitLabel,
  pendingLabel,
  initial,
  onCancel,
}: {
  onSubmit: (data: {
    title: string;
    description?: string;
    category: string;
  }) => void;
  isPending: boolean;
  submitLabel: string;
  pendingLabel: string;
  initial?: { title: string; description: string | null; category: string };
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(
    initial?.description ?? "",
  );
  const [category, setCategory] = useState(
    initial?.category ?? CATEGORIES[0],
  );

  const trimmedTitle = title.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedTitle || isPending) return;
    onSubmit({
      title: trimmedTitle,
      description: description.trim() || undefined,
      category,
    });
    if (!initial) {
      setTitle("");
      setDescription("");
      setCategory(CATEGORIES[0]);
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Resource title"
        maxLength={120}
        className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-400"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        maxLength={500}
        rows={2}
        className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-400"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-base outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-400"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!trimmedTitle || isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-slate-100 dark:text-slate-900 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function ResourceRow({
  resource,
  onDelete,
  isDeleting,
  onUpdated,
}: {
  resource: Resource;
  onDelete: () => void;
  isDeleting: boolean;
  onUpdated: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const updateMutation = usePutResourcesId({
    mutation: {
      onSuccess: () => {
        setEditing(false);
        onUpdated();
      },
    },
  });

  if (editing) {
    return (
      <li className="py-3">
        <ResourceForm
          initial={{
            title: resource.title,
            description: resource.description,
            category: resource.category,
          }}
          onSubmit={(data) =>
            updateMutation.mutate({ id: resource.id, data })
          }
          isPending={updateMutation.isPending}
          submitLabel="Save"
          pendingLabel="Saving..."
          onCancel={() => setEditing(false)}
        />
        {updateMutation.isError && (
          <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
            Could not update: {updateMutation.error.message}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{resource.title}</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {resource.category}
          </span>
        </div>
        {resource.description && (
          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
            {resource.description}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm text-slate-700 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:disabled:border-slate-800 dark:disabled:text-slate-600"
        >
          {isDeleting ? "Removing..." : "Remove"}
        </button>
      </div>
    </li>
  );
}

export default function App() {
  const queryClient = useQueryClient();
  const refreshResources = () =>
    queryClient.invalidateQueries({ queryKey: getGetResourcesQueryKey() });
  const resourcesQuery = useGetResources();
  const createMutation = usePostResources({
    mutation: {
      onSuccess: refreshResources,
    },
  });
  const deleteMutation = useDeleteResourcesId({
    mutation: {
      onSuccess: refreshResources,
    },
  });

  const resources = resourcesQuery.data?.resources ?? [];
  const deletingId = deleteMutation.variables?.id;

  const handleRemove = (id: number) => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate({ id });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Resources</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage your bookable resources — rooms, equipment, vehicles, and
            more.
          </p>
        </header>

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <h2 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            Add resource
          </h2>
          <ResourceForm
            onSubmit={(data) => createMutation.mutate({ data })}
            isPending={createMutation.isPending}
            submitLabel="Add resource"
            pendingLabel="Adding..."
          />
        </section>

        {createMutation.isError && (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            Could not add the resource: {createMutation.error.message}
          </p>
        )}

        {deleteMutation.isError && (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            Could not remove the resource: {deleteMutation.error.message}
          </p>
        )}

        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <h2 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Resources
          </h2>

          {resourcesQuery.isPending && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
              Loading resources...
            </p>
          )}

          {resourcesQuery.isError && (
            <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">
              Could not load resources: {resourcesQuery.error.message}
            </p>
          )}

          {!resourcesQuery.isPending && !resourcesQuery.isError ? (
            resources.length > 0 ? (
              <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
                {resources.map((resource) => (
                  <ResourceRow
                    key={resource.id}
                    resource={resource}
                    onDelete={() => handleRemove(resource.id)}
                    isDeleting={
                      deleteMutation.isPending && deletingId === resource.id
                    }
                    onUpdated={refreshResources}
                  />
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                No resources yet.
              </p>
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
