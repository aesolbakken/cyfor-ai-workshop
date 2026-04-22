import { type FormEvent, useState } from "react";
import {
  Category,
  getGetResourcesQueryKey,
  getGetResourcesIdReservationsQueryKey,
  useDeleteResourcesId,
  useDeleteReservationsId,
  useGetResources,
  useGetResourcesIdReservations,
  usePostResources,
  usePostResourcesIdReservations,
  usePutResourcesId,
} from "./api";
import type { Resource, Reservation } from "./api/generated/hooks";
import { useQueryClient } from "@tanstack/react-query";

const CATEGORIES = Object.values(Category);

const categoryLabel = (cat: string) =>
  cat.charAt(0).toUpperCase() + cat.slice(1);

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function ReservationPanel({
  resource,
  onClose,
}: {
  resource: Resource;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [bookedBy, setBookedBy] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reservationsQuery = useGetResourcesIdReservations(resource.id);
  const reservations = reservationsQuery.data?.reservations ?? [];

  const refreshReservations = () =>
    queryClient.invalidateQueries({
      queryKey: getGetResourcesIdReservationsQueryKey(resource.id),
    });

  const createMutation = usePostResourcesIdReservations({
    mutation: {
      onSuccess: async () => {
        setBookedBy("");
        setStartTime("");
        setEndTime("");
        setError(null);
        await refreshReservations();
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.error || err?.message || "Failed to create reservation";
        setError(msg);
      },
    },
  });

  const deleteMutation = useDeleteReservationsId({
    mutation: { onSuccess: refreshReservations },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!bookedBy.trim() || !startTime || !endTime || createMutation.isPending) return;
    createMutation.mutate({
      id: resource.id,
      data: {
        bookedBy: bookedBy.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      },
    });
  };

  const inputSmClass =
    "rounded-md border border-border px-3 py-1.5 text-sm text-text outline-none focus:border-primary-light";
  const btnPrimary =
    "rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-border";
  const btnSecondary =
    "rounded-md border border-border px-3 py-1 text-sm text-text-muted disabled:cursor-not-allowed disabled:border-border disabled:text-border";

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide">
          Reservations — {resource.title}
        </h2>
        <button type="button" onClick={onClose} className={btnSecondary}>
          Close
        </button>
      </div>

      <form className="mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
        <input
          value={bookedBy}
          onChange={(e) => setBookedBy(e.target.value)}
          placeholder="Your name"
          maxLength={120}
          className={inputSmClass}
        />
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className={`flex-1 ${inputSmClass}`}
          />
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className={`flex-1 ${inputSmClass}`}
          />
        </div>
        <button
          type="submit"
          disabled={
            !bookedBy.trim() || !startTime || !endTime || createMutation.isPending
          }
          className={btnPrimary}
        >
          {createMutation.isPending ? "Booking..." : "Book"}
        </button>
        {error && <p className="text-sm text-danger">{error}</p>}
      </form>

      {reservationsQuery.isPending && (
        <p className="mt-4 text-sm text-text-muted">Loading reservations...</p>
      )}

      {!reservationsQuery.isPending && reservations.length === 0 && (
        <p className="mt-4 text-sm text-text-muted">No reservations yet.</p>
      )}

      {reservations.length > 0 && (
        <ul className="mt-4 divide-y divide-border">
          {reservations.map((r: Reservation) => (
            <li key={r.id} className="flex items-center justify-between py-3">
              <div>
                <span className="font-medium text-text">{r.bookedBy}</span>
                <span className="ml-2 text-sm text-text-muted">
                  {formatDateTime(r.startTime)} — {formatDateTime(r.endTime)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => deleteMutation.mutate({ id: r.id })}
                disabled={deleteMutation.isPending}
                className={`${btnSecondary} hover:border-danger hover:text-danger`}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("general");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<string>("general");
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  const filterParams = {
    ...(searchText.trim() ? { search: searchText.trim() } : {}),
    ...(filterCategory
      ? { category: filterCategory as typeof Category[keyof typeof Category] }
      : {}),
  };

  const refreshResources = () =>
    queryClient.invalidateQueries({
      queryKey: getGetResourcesQueryKey(filterParams),
    });

  const resourcesQuery = useGetResources(filterParams);
  const createMutation = usePostResources({
    mutation: {
      onSuccess: async () => {
        setTitle("");
        setDescription("");
        setCategory("general");
        await refreshResources();
      },
    },
  });
  const updateMutation = usePutResourcesId({
    mutation: {
      onSuccess: async () => {
        setEditingId(null);
        await refreshResources();
      },
    },
  });
  const deleteMutation = useDeleteResourcesId({
    mutation: {
      onSuccess: refreshResources,
    },
  });

  const trimmedTitle = title.trim();
  const resources = resourcesQuery.data?.resources ?? [];
  const deletingId = deleteMutation.variables?.id;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedTitle || createMutation.isPending) return;

    createMutation.mutate({
      data: {
        title: trimmedTitle,
        description: description.trim() || undefined,
        category:
          (category as typeof Category[keyof typeof Category]) || undefined,
      },
    });
  };

  const startEdit = (resource: Resource) => {
    setEditingId(resource.id);
    setEditTitle(resource.title);
    setEditDescription(resource.description);
    setEditCategory(resource.category);
  };

  const cancelEdit = () => setEditingId(null);

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editTitle.trim() || updateMutation.isPending || editingId === null)
      return;

    updateMutation.mutate({
      id: editingId,
      data: {
        title: editTitle.trim(),
        description: editDescription.trim(),
        category: editCategory as typeof Category[keyof typeof Category],
      },
    });
  };

  const handleRemove = (id: number) => {
    if (deleteMutation.isPending) return;
    deleteMutation.mutate({ id });
  };

  const inputClass =
    "rounded-md border border-border px-3 py-2 text-sm text-text outline-none focus:border-primary-light";
  const inputSmClass =
    "rounded-md border border-border px-3 py-1.5 text-sm text-text outline-none focus:border-primary-light";
  const btnPrimary =
    "rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-border";
  const btnSecondary =
    "rounded-md border border-border px-3 py-1 text-sm text-text-muted disabled:cursor-not-allowed disabled:border-border disabled:text-border";

  return (
    <main className="min-h-screen bg-bg px-4 py-10 text-text">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            Resource Manager
          </h1>
          <p className="text-sm text-text-muted">
            Create, edit, and manage bookable resources.
          </p>
        </header>

        {/* Create form */}
        <form
          className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5"
          onSubmit={handleSubmit}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Resource title"
            maxLength={120}
            className={inputClass}
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            maxLength={500}
            className={inputClass}
          />
          <div className="flex gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`flex-1 ${inputClass}`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabel(cat)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!trimmedTitle || createMutation.isPending}
              className={btnPrimary}
            >
              {createMutation.isPending ? "Adding..." : "Add resource"}
            </button>
          </div>
        </form>

        {/* Error messages */}
        {createMutation.isError && (
          <p className="text-sm text-danger">
            Could not add the resource: {createMutation.error.message}
          </p>
        )}
        {updateMutation.isError && (
          <p className="text-sm text-danger">
            Could not update the resource: {updateMutation.error.message}
          </p>
        )}
        {deleteMutation.isError && (
          <p className="text-sm text-danger">
            Could not remove the resource: {deleteMutation.error.message}
          </p>
        )}

        {/* Resource list */}
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-sm font-medium text-text-muted uppercase tracking-wide">
            Resources
          </h2>

          <div className="mt-4 flex gap-3">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search resources..."
              className={`flex-1 ${inputSmClass}`}
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={inputSmClass}
            >
              <option value="">All categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>

          {resourcesQuery.isPending && (
            <p className="mt-4 text-sm text-text-muted">
              Loading resources...
            </p>
          )}

          {resourcesQuery.isError && (
            <p className="mt-4 text-sm text-danger">
              Could not load resources: {resourcesQuery.error.message}
            </p>
          )}

          {!resourcesQuery.isPending && !resourcesQuery.isError ? (
            resources.length > 0 ? (
              <ul className="mt-4 divide-y divide-border">
                {resources.map((resource) =>
                  editingId === resource.id ? (
                    <li key={resource.id} className="py-4">
                      <form
                        className="flex flex-col gap-2"
                        onSubmit={handleUpdate}
                      >
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          maxLength={120}
                          className={inputSmClass}
                        />
                        <input
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          maxLength={500}
                          placeholder="Description"
                          className={inputSmClass}
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className={inputSmClass}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {categoryLabel(cat)}
                            </option>
                          ))}
                        </select>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={
                              !editTitle.trim() || updateMutation.isPending
                            }
                            className={btnPrimary}
                          >
                            {updateMutation.isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className={btnSecondary}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </li>
                  ) : (
                    <li
                      key={resource.id}
                      className="flex items-start justify-between gap-3 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-text">
                            {resource.title}
                          </span>
                          <span className="rounded-full bg-badge-bg px-2 py-0.5 text-xs font-medium text-success">
                            {categoryLabel(resource.category)}
                          </span>
                        </div>
                        {resource.description && (
                          <p className="mt-1 text-sm text-text-muted">
                            {resource.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(resource)}
                          className={btnSecondary}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemove(resource.id)}
                          disabled={deleteMutation.isPending}
                          className={`${btnSecondary} hover:border-danger hover:text-danger`}
                        >
                          {deleteMutation.isPending &&
                          deletingId === resource.id
                            ? "Removing..."
                            : "Remove"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedResourceId(resource.id)}
                          className={btnSecondary}
                        >
                          Book
                        </button>
                      </div>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-text-muted">
                {searchText.trim() || filterCategory
                  ? "No resources match your filters."
                  : "No resources yet."}
              </p>
            )
          ) : null}
        </section>

        {/* Reservation panel */}
        {selectedResourceId !== null &&
          (() => {
            const selectedResource = resources.find(
              (r) => r.id === selectedResourceId,
            );
            if (!selectedResource) return null;
            return (
              <ReservationPanel
                key={selectedResourceId}
                resource={selectedResource}
                onClose={() => setSelectedResourceId(null)}
              />
            );
          })()}
      </div>
    </main>
  );
}
