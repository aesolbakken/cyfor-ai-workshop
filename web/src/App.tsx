import { type FormEvent, useState } from "react";
import {
  type Resource,
  type Reservation,
  getGetResourcesQueryKey,
  getGetResourcesIdReservationsQueryKey,
  useDeleteResourcesId,
  useDeleteResourcesIdReservationsReservationId,
  useGetResources,
  useGetResourcesIdReservations,
  usePostResources,
  usePostResourcesIdReservations,
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
        className="border border-fv-green bg-white px-3 py-2.5 text-base text-fv-black outline-none placeholder:text-fv-green focus:outline-2 focus:outline-offset-2 focus:outline-fv-focus"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        maxLength={500}
        rows={2}
        className="border border-fv-green bg-white px-3 py-2.5 text-base text-fv-black outline-none placeholder:text-fv-green focus:outline-2 focus:outline-offset-2 focus:outline-fv-focus"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border border-fv-green bg-white px-3 py-2.5 text-base text-fv-black outline-none focus:outline-2 focus:outline-offset-2 focus:outline-fv-focus"
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
          className="bg-fv-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? pendingLabel : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border-2 border-fv-black px-5 py-2.5 text-sm font-medium text-fv-black"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function ReservationForm({
  resourceId,
  onCreated,
}: {
  resourceId: number;
  onCreated: () => void;
}) {
  const [reservedBy, setReservedBy] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const createMutation = usePostResourcesIdReservations({
    mutation: {
      onSuccess: () => {
        setReservedBy("");
        setDate("");
        setStartTime("");
        setEndTime("");
        onCreated();
      },
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = reservedBy.trim();
    if (!trimmedName || !date || !startTime || !endTime) return;
    createMutation.mutate({
      id: resourceId,
      data: { reservedBy: trimmedName, date, startTime, endTime },
    });
  };

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <input
        value={reservedBy}
        onChange={(e) => setReservedBy(e.target.value)}
        placeholder="Your name"
        maxLength={120}
        className="border border-fv-green bg-white px-3 py-2 text-sm text-fv-black outline-none placeholder:text-fv-green focus:outline-2 focus:outline-offset-2 focus:outline-fv-focus"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border border-fv-green bg-white px-3 py-2 text-sm text-fv-black outline-none focus:outline-2 focus:outline-offset-2 focus:outline-fv-focus"
      />
      <div className="flex gap-2">
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="flex-1 border border-fv-green bg-white px-3 py-2 text-sm text-fv-black outline-none focus:outline-2 focus:outline-offset-2 focus:outline-fv-focus"
        />
        <span className="self-center text-sm text-fv-green">–</span>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="flex-1 border border-fv-green bg-white px-3 py-2 text-sm text-fv-black outline-none focus:outline-2 focus:outline-offset-2 focus:outline-fv-focus"
        />
      </div>
      <button
        type="submit"
        disabled={
          !reservedBy.trim() ||
          !date ||
          !startTime ||
          !endTime ||
          createMutation.isPending
        }
        className="bg-fv-black px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {createMutation.isPending ? "Reserving..." : "Reserve"}
      </button>
      {createMutation.isError && (
        <p className="text-sm text-fv-danger">
          {createMutation.error.message}
        </p>
      )}
    </form>
  );
}

function ReservationItem({
  reservation,
  onDeleted,
}: {
  reservation: Reservation;
  onDeleted: () => void;
}) {
  const deleteMutation = useDeleteResourcesIdReservationsReservationId({
    mutation: { onSuccess: onDeleted },
  });

  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 flex-1 text-sm">
        <span className="font-medium text-fv-black">
          {reservation.date}
        </span>{" "}
        <span className="text-fv-green">
          {reservation.startTime}–{reservation.endTime}
        </span>{" "}
        <span className="text-fv-black">— {reservation.reservedBy}</span>
      </div>
      <button
        type="button"
        onClick={() =>
          deleteMutation.mutate({
            id: reservation.resourceId,
            reservationId: reservation.id,
          })
        }
        disabled={deleteMutation.isPending}
        className="shrink-0 border border-fv-green px-2 py-1 text-xs text-fv-black hover:border-fv-danger hover:text-fv-danger disabled:cursor-not-allowed disabled:opacity-40"
      >
        {deleteMutation.isPending ? "..." : "Cancel"}
      </button>
    </li>
  );
}

function ReservationPanel({ resourceId }: { resourceId: number }) {
  const queryClient = useQueryClient();
  const reservationsQuery = useGetResourcesIdReservations(resourceId);
  const reservations = reservationsQuery.data?.reservations ?? [];
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: getGetResourcesIdReservationsQueryKey(resourceId),
    });

  return (
    <div className="mt-3 border-t border-fv-green-light pt-3">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-fv-black">
        Reservations
      </h3>
      {reservationsQuery.isPending && (
        <p className="text-sm text-fv-green">Loading…</p>
      )}
      {reservations.length > 0 ? (
        <ul className="divide-y divide-fv-green-light">
          {reservations.map((r) => (
            <ReservationItem
              key={r.id}
              reservation={r}
              onDeleted={refresh}
            />
          ))}
        </ul>
      ) : (
        !reservationsQuery.isPending && (
          <p className="mb-3 text-sm text-fv-green">No reservations yet.</p>
        )
      )}
      <div className="mt-3">
        <ReservationForm resourceId={resourceId} onCreated={refresh} />
      </div>
    </div>
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
  const [showReservations, setShowReservations] = useState(false);
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
          <p className="mt-1 text-sm text-fv-danger">
            Could not update: {updateMutation.error.message}
          </p>
        )}
      </li>
    );
  }

  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-fv-black">{resource.title}</span>
            <span className="bg-fv-green-light px-2 py-0.5 text-xs font-medium text-fv-black">
              {resource.category}
            </span>
          </div>
          {resource.description && (
            <p className="mt-0.5 text-sm text-fv-green">
              {resource.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setShowReservations(!showReservations)}
            className="border border-fv-green px-3 py-1 text-sm text-fv-black hover:border-fv-black"
          >
            {showReservations ? "Hide" : "Reservations"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="border border-fv-green px-3 py-1 text-sm text-fv-black hover:border-fv-black"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="border border-fv-green px-3 py-1 text-sm text-fv-black hover:border-fv-danger hover:text-fv-danger disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isDeleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
      {showReservations && <ReservationPanel resourceId={resource.id} />}
    </li>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const searchParams = search ? { search } : undefined;
  const refreshResources = () =>
    queryClient.invalidateQueries({ queryKey: getGetResourcesQueryKey(searchParams) });
  const resourcesQuery = useGetResources(searchParams);
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
    <main className="min-h-screen bg-fv-grey px-4 py-10 text-fv-black">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-fv-black">Resources</h1>
          <p className="text-sm text-fv-green">
            Manage your bookable resources — rooms, equipment, vehicles, and
            more.
          </p>
        </header>

        <section className="border border-fv-green bg-white p-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-fv-black">
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
          <p className="text-sm text-fv-danger">
            Could not add the resource: {createMutation.error.message}
          </p>
        )}

        {deleteMutation.isError && (
          <p className="text-sm text-fv-danger">
            Could not remove the resource: {deleteMutation.error.message}
          </p>
        )}

        <section className="border border-fv-green bg-white p-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-fv-black">
            Resources
          </h2>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources…"
            className="mt-4 w-full border border-fv-green bg-white px-3 py-2.5 text-base text-fv-black outline-none placeholder:text-fv-green focus:outline-2 focus:outline-offset-2 focus:outline-fv-focus"
          />

          {resourcesQuery.isPending && (
            <p className="mt-3 text-sm text-fv-green">
              Loading resources...
            </p>
          )}

          {resourcesQuery.isError && (
            <p className="mt-3 text-sm text-fv-danger">
              Could not load resources: {resourcesQuery.error.message}
            </p>
          )}

          {!resourcesQuery.isPending && !resourcesQuery.isError ? (
            resources.length > 0 ? (
              <ul className="mt-4 divide-y divide-fv-green-light">
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
              <p className="mt-3 text-sm text-fv-green">
                No resources yet.
              </p>
            )
          ) : null}
        </section>
      </div>
    </main>
  );
}
