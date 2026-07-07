// src/components/admin/AdminBlogTab.tsx
// Full CRUD for GitHub-backed blog posts (src/content/blogs/*.md).
// Every save/delete goes through the `blog-admin` edge function, which
// verifies admin status server-side and commits directly to GitHub.

import { useState, useEffect, useMemo } from "react";
import { marked } from "marked";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, RefreshCw, Loader2, ExternalLink, Eye, Code2 } from "lucide-react";
import {
  listAdminPosts, getAdminPost, saveAdminPost, deleteAdminPost,
  type AdminBlogListItem, type BlogPostInput,
} from "@/lib/blog-admin-client";
import { SLUG_REGEX } from "@/lib/blog-frontmatter";

const EMPTY_FORM: BlogPostInput = {
  originalSlug: null,
  title: "",
  slug: "",
  excerpt: "",
  cover_image_url: "",
  category: "",
  tags: [],
  body: "",
  status: "draft",
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminBlogTab() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<AdminBlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<BlogPostInput>(EMPTY_FORM);
  const [tagsInput, setTagsInput] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [preview, setPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!form.originalSlug;

  const load = async () => {
    setRefreshing(true);
    try {
      const data = await listAdminPosts();
      setPosts(data);
    } catch (err) {
      toast({
        title: "Failed to load posts",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setTagsInput("");
    setSlugEdited(false);
    setPreview(false);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = async (item: AdminBlogListItem) => {
    setLoadingPost(true);
    setDialogOpen(true);
    setPreview(false);
    setErrors({});
    try {
      const post = await getAdminPost(item.slug);
      setForm({
        originalSlug: post.slug,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? "",
        cover_image_url: post.cover_image_url ?? "",
        category: post.category ?? "",
        tags: post.tags,
        body: post.body,
        status: post.status,
      });
      setTagsInput(post.tags.join(", "));
      setSlugEdited(true);
    } catch (err) {
      toast({
        title: "Failed to load post",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
      setDialogOpen(false);
    } finally {
      setLoadingPost(false);
    }
  };

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugEdited ? f.slug : slugify(title) }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.title.trim().length < 2) errs.title = "Title must be at least 2 characters.";
    if (form.title.length > 200) errs.title = "Title must be under 200 characters.";
    if (!SLUG_REGEX.test(form.slug)) errs.slug = "Lowercase letters, numbers, and hyphens only (e.g. my-post-title).";
    if (form.excerpt && form.excerpt.length > 400) errs.excerpt = "Excerpt must be under 400 characters.";
    if (form.cover_image_url) {
      try { new URL(form.cover_image_url); } catch { errs.cover_image_url = "Must be a valid URL."; }
    }
    if (form.category && form.category.length > 80) errs.category = "Category must be under 80 characters.";
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length > 15) errs.tags = "Maximum 15 tags.";
    if (tags.some((t) => t.length > 40)) errs.tags = "Each tag must be under 40 characters.";
    if (form.body.length > 60000) errs.body = "Body must be under 60,000 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      await saveAdminPost({
        ...form,
        excerpt: form.excerpt.trim() || null,
        cover_image_url: form.cover_image_url.trim() || null,
        category: form.category.trim() || null,
        tags,
      });
      toast({ title: isEditing ? "Post updated" : "Post created", description: `Commit pushed to GitHub. It'll appear on the live site after the next deploy.` });
      setDialogOpen(false);
      load();
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminPost(deleteTarget.slug);
      toast({ title: "Post deleted" });
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const previewHtml = useMemo(() => (preview ? (marked.parse(form.body, { async: false }) as string) : ""), [preview, form.body]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-white font-semibold text-sm">Blog Posts</h3>
          <p className="text-white/40 text-xs mt-0.5">
            Stored as Markdown files in GitHub (src/content/blogs). Publishing triggers a new commit and — if your host
            auto-deploys from this branch — a rebuild within a couple minutes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={refreshing} className="border-white/10 text-white/70 hover:text-white">
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={openNew} className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#fbbf24]/90 font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Post
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-white/40">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading posts…
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-white/40 text-sm">No posts yet. Click "New Post" to write your first one.</div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/50">Title</TableHead>
                <TableHead className="text-white/50">Status</TableHead>
                <TableHead className="text-white/50">Category</TableHead>
                <TableHead className="text-white/50">Date</TableHead>
                <TableHead className="text-white/50 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((p) => (
                <TableRow key={p.slug} className="border-white/5 hover:bg-white/[0.03]">
                  <TableCell className="text-white/90 font-medium max-w-xs truncate">{p.title}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "published" ? "default" : "secondary"} className={p.status === "published" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-white/10 text-white/60"}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/60">{p.category ?? "—"}</TableCell>
                  <TableCell className="text-white/60">{p.date ? new Date(p.date).toLocaleDateString() : "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {p.status === "published" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white" asChild>
                          <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-white" onClick={() => openEdit(p)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/40 hover:text-red-400" onClick={() => setDeleteTarget(p)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ── CREATE / EDIT DIALOG ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0f1f38] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>

          {loadingPost ? (
            <div className="flex items-center justify-center py-16 text-white/40">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="bg-white/5 border-white/10" />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: e.target.value })); }}
                  className="bg-white/5 border-white/10 font-mono text-sm"
                />
                {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="bg-white/5 border-white/10" />
                  {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: "draft" | "published") => setForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Cover Image URL</Label>
                <Input value={form.cover_image_url} onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))} placeholder="https://..." className="bg-white/5 border-white/10" />
                {errors.cover_image_url && <p className="text-red-400 text-xs mt-1">{errors.cover_image_url}</p>}
              </div>

              <div>
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} className="bg-white/5 border-white/10" />
                {errors.excerpt && <p className="text-red-400 text-xs mt-1">{errors.excerpt}</p>}
                <p className="text-white/30 text-xs mt-1">{form.excerpt.length}/400</p>
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="visa, europe, jobs" className="bg-white/5 border-white/10" />
                {errors.tags && <p className="text-red-400 text-xs mt-1">{errors.tags}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Body (Markdown)</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPreview((p) => !p)} className="h-7 text-white/50 hover:text-white text-xs">
                    {preview ? <><Code2 className="w-3.5 h-3.5 mr-1" /> Edit</> : <><Eye className="w-3.5 h-3.5 mr-1" /> Preview</>}
                  </Button>
                </div>
                {preview ? (
                  <div
                    className="min-h-[300px] max-h-[400px] overflow-y-auto rounded-md border border-white/10 bg-white/5 p-4 prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <Textarea
                    value={form.body}
                    onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                    rows={14}
                    className="bg-white/5 border-white/10 font-mono text-sm"
                    placeholder="Write your post in Markdown…"
                  />
                )}
                {errors.body && <p className="text-red-400 text-xs mt-1">{errors.body}</p>}
                <p className="text-white/30 text-xs mt-1">{form.body.length}/60000</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-white/10 text-white/70">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || loadingPost} className="bg-[#fbbf24] text-[#0a192f] hover:bg-[#fbbf24]/90 font-semibold">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {isEditing ? "Save Changes" : "Create Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM DIALOG ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-[#0f1f38] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Delete post?</DialogTitle>
          </DialogHeader>
          <p className="text-white/60 text-sm">
            This permanently deletes <span className="text-white font-medium">"{deleteTarget?.title}"</span> from the repo. This can't be undone from here (though it remains in Git history).
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-white/10 text-white/70">Cancel</Button>
            <Button onClick={handleDelete} disabled={deleting} variant="destructive">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
