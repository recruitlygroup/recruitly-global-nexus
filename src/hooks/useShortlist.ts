import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
const db = supabase as unknown as SupabaseClient;

export type ShortlistKind = "university" | "program";
export interface ShortlistRow { kind: ShortlistKind; item_id: string }

// One cached request for the whole session; every Save button reads from the same cache.
export function useShortlist() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["shortlist"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<{ userId: string | null; rows: ShortlistRow[] }> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return { userId: null, rows: [] };
      const { data, error } = await db.from("student_shortlist").select("kind,item_id").eq("user_id", session.user.id);
      if (error) throw error;
      return { userId: session.user.id, rows: (data ?? []) as ShortlistRow[] };
    },
  });
  const toggle = useMutation({
    mutationFn: async (r: ShortlistRow & { saved: boolean }) => {
      if (r.saved) {
        const { error } = await db.from("student_shortlist").delete().eq("kind", r.kind).eq("item_id", r.item_id);
        if (error) throw error;
      } else {
        const { error } = await db.from("student_shortlist").insert({ kind: r.kind, item_id: r.item_id });
        if (error) throw error;
      }
    },
    onMutate: async (r) => {
      await qc.cancelQueries({ queryKey: ["shortlist"] });
      const prev = qc.getQueryData<{ userId: string | null; rows: ShortlistRow[] }>(["shortlist"]);
      if (prev) qc.setQueryData(["shortlist"], { ...prev, rows: r.saved
        ? prev.rows.filter((x) => !(x.kind === r.kind && x.item_id === r.item_id))
        : [...prev.rows, { kind: r.kind, item_id: r.item_id }] });
      return { prev };
    },
    onError: (_e, _r, ctx) => ctx?.prev && qc.setQueryData(["shortlist"], ctx.prev),
  });
  const rows = q.data?.rows ?? [];
  return {
    loggedIn: !!q.data?.userId, rows,
    isSaved: (kind: ShortlistKind, id: string) => rows.some((r) => r.kind === kind && r.item_id === id),
    toggle: (kind: ShortlistKind, id: string) => toggle.mutate({ kind, item_id: id, saved: rows.some((r) => r.kind === kind && r.item_id === id) }),
  };
}
