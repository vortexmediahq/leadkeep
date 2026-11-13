import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PoweredBy } from "@/components/powered-by";
import { Capture } from "@/components/lead-form";
import { fetchPublicForm, type PublicForm } from "@/lib/data";

export const Route = createFileRoute("/l/$linkId")({
  head: () => ({ meta: [{ title: "Get in touch · LeadKeep" }] }),
  validateSearch: (search: Record<string, unknown>): { preview?: string } =>
    search.preview === "1" ? { preview: "1" } : {},
  component: PublicPage,
});

const SLUG = /^[a-z0-9]{6,32}$/;

function FormSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-8" aria-busy="true">
      <div className="mb-6 flex items-center gap-3">
        <span className="size-10 animate-pulse rounded-xl bg-line" />
        <div className="flex flex-col gap-2">
          <span className="h-4 w-40 animate-pulse rounded bg-line" />
          <span className="h-3 w-28 animate-pulse rounded bg-line" />
        </div>
      </div>
      <div className="h-96 animate-pulse rounded-3xl border border-line bg-paper" />
      <p className="sr-only">Loading the form</p>
    </main>
  );
}

function FormMessage({ title, body }: { title: string; body: string }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-3xl border border-line bg-paper p-6 shadow-panel">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-base text-ink-soft">{body}</p>
      </div>
      <PoweredBy className="mt-6" />
    </main>
  );
}

type Loaded = { state: "loading" } | { state: "missing" } | { state: "failed" } | { state: "ready"; form: PublicForm };

function PublicPage() {
  const { linkId } = Route.useParams();
  const { preview } = Route.useSearch();
  const slug = linkId.toLowerCase();
  const valid = SLUG.test(slug);
  const [loaded, setLoaded] = useState<Loaded>({ state: "loading" });
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!valid) return;
    let live = true;
    setLoaded({ state: "loading" });
    fetchPublicForm(slug)
      .then((form) => live && setLoaded(form ? { state: "ready", form } : { state: "missing" }))
      .catch(() => live && setLoaded({ state: "failed" }));
    return () => {
      live = false;
    };
  }, [slug, valid]);

  if (!valid || loaded.state === "missing") {
    return <FormMessage title="This link isn't active" body="Ask the business for a fresh link to get in touch." />;
  }
  if (loaded.state === "failed") {
    return <FormMessage title="The form couldn't load" body="Check your connection and refresh the page to try again." />;
  }
  if (loaded.state === "loading") return <FormSkeleton />;
  return (
    <Capture
      key={round}
      slug={slug}
      form={loaded.form}
      onAnother={() => setRound((value) => value + 1)}
      preview={preview ? { onBack: () => (window.history.length > 1 ? window.history.back() : window.close()) } : undefined}
    />
  );
}

