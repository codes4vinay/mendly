import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenText, FilePlus2, Loader2, Save, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/shared/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/utils/axios";

const CATEGORIES = ["account", "orders", "repairs", "payments", "returns_refunds", "support", "safety", "general"];
const EMPTY_FORM = {
  slug: "",
  title: "",
  summary: "",
  content: "",
  category: "general",
  intents: "",
  keywords: "",
  audience: "all",
  status: "draft",
};

const slugify = (value) => String(value || "")
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 80);

const arrayToText = (items) => (items || []).join(", ");
const textToArray = (value) => [...new Set(String(value || "")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean))];

const articleToForm = (article) => ({
  slug: article.slug,
  title: article.title,
  summary: article.summary,
  content: article.content,
  category: article.category,
  intents: arrayToText(article.intents),
  keywords: arrayToText(article.keywords),
  audience: article.audience,
  status: article.status,
});

const KnowledgeBase = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/support-articles/admin");
      setArticles(response.data.data.articles);
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load the knowledge base");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const visibleArticles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return articles;
    return articles.filter((article) => [article.title, article.slug, article.category, article.summary]
      .some((value) => String(value).toLowerCase().includes(normalized)));
  }, [articles, query]);

  const selectedArticle = articles.find((article) => article._id === selectedId);

  const selectArticle = (article) => {
    setSelectedId(article._id);
    setForm(articleToForm(article));
  };

  const startNew = () => {
    setSelectedId(null);
    setForm(EMPTY_FORM);
  };

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "title" && !selectedId ? { slug: slugify(value) } : {}),
    }));
  };

  const saveArticle = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      slug: slugify(form.slug),
      intents: textToArray(form.intents),
      keywords: textToArray(form.keywords),
    };
    try {
      const response = selectedId
        ? await api.put(`/support-articles/admin/${selectedId}`, payload)
        : await api.post("/support-articles/admin", payload);
      const saved = response.data.data.article;
      toast.success(selectedId ? `Article updated to version ${saved.version}` : "Knowledge article created");
      await fetchArticles();
      setSelectedId(saved._id);
      setForm(articleToForm(saved));
    } catch (error) {
      toast.error(error.response?.data?.message || "Article could not be saved");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Support Knowledge Base</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">Published articles are the bot’s only source for Mendly policies and help content. Drafts never appear in customer answers.</p>
          </div>
          <Button onClick={startNew} className="bg-indigo-600 hover:bg-indigo-700 text-white"><FilePlus2 className="h-4 w-4 mr-2" />New article</Button>
        </div>

        <div className="grid xl:grid-cols-[360px_minmax(0,1fr)] gap-5 items-start">
          <Card className="xl:sticky xl:top-20">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="w-full rounded-xl border bg-background py-2.5 pl-9 pr-3 text-sm" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search articles…" />
              </div>
              {loading ? (
                <div className="py-16 flex justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : visibleArticles.length === 0 ? (
                <div className="py-14 text-center text-sm text-muted-foreground"><BookOpenText className="h-10 w-10 mx-auto mb-3 opacity-30" />No articles found</div>
              ) : (
                <div className="space-y-2 max-h-[68vh] overflow-auto pr-1">
                  {visibleArticles.map((article) => (
                    <button
                      key={article._id}
                      onClick={() => selectArticle(article)}
                      className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedId === article._id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "hover:bg-muted"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant={article.status === "published" ? "default" : "secondary"}>{article.status}</Badge>
                        <span className="text-[10px] text-muted-foreground">v{article.version}</span>
                      </div>
                      <strong className="block text-sm mt-2">{article.title}</strong>
                      <span className="block text-xs text-muted-foreground mt-1 line-clamp-2">{article.summary}</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5 pb-5 border-b">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 grid place-items-center"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-semibold">{selectedArticle ? "Edit approved knowledge" : "Create knowledge article"}</h2>
                  <p className="text-xs text-muted-foreground">Content changes automatically create a new version.</p>
                </div>
              </div>

              <form onSubmit={saveArticle} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <Field label="Title"><input value={form.title} onChange={(e) => updateField("title", e.target.value)} minLength={4} maxLength={120} required /></Field>
                  <Field label="Slug"><input value={form.slug} onChange={(e) => updateField("slug", slugify(e.target.value))} minLength={3} maxLength={80} required /></Field>
                </div>
                <Field label="Summary"><textarea value={form.summary} onChange={(e) => updateField("summary", e.target.value)} minLength={10} maxLength={240} rows={2} required /></Field>
                <Field label="Approved answer content" help="Write only verified Mendly behavior. The assistant cannot add facts outside this content."><textarea value={form.content} onChange={(e) => updateField("content", e.target.value)} minLength={30} maxLength={5000} rows={12} required /></Field>
                <div className="grid sm:grid-cols-3 gap-4">
                  <Field label="Category"><select value={form.category} onChange={(e) => updateField("category", e.target.value)}>{CATEGORIES.map((category) => <option key={category} value={category}>{category.replaceAll("_", " ")}</option>)}</select></Field>
                  <Field label="Audience"><select value={form.audience} onChange={(e) => updateField("audience", e.target.value)}><option value="all">All users</option><option value="customer">Customers</option><option value="provider">Providers</option></select></Field>
                  <Field label="Publication status"><select value={form.status} onChange={(e) => updateField("status", e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></Field>
                </div>
                <Field label="Matched intents" help="Comma-separated controlled intents, for example: payment, refund"><input value={form.intents} onChange={(e) => updateField("intents", e.target.value)} placeholder="payment, refund" /></Field>
                <Field label="Search keywords" help="Comma-separated customer phrases used for deterministic matching"><input value={form.keywords} onChange={(e) => updateField("keywords", e.target.value)} placeholder="failed payment, charged twice, razorpay" /></Field>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <p className="text-xs text-muted-foreground">{selectedArticle ? `Current version: ${selectedArticle.version} · ${selectedArticle.status}` : "New articles start at version 1."}</p>
                  <Button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-36">{saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}{saving ? "Saving…" : "Save article"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const Field = ({ label, help, children }) => (
  <label className="block space-y-1.5 text-sm font-medium">
    <span>{label}</span>
    {help && <small className="block font-normal text-muted-foreground">{help}</small>}
    <div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:bg-background [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-sm [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:bg-background [&_textarea]:px-3 [&_textarea]:py-2.5 [&_textarea]:text-sm [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:bg-background [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-sm">{children}</div>
  </label>
);

export default KnowledgeBase;
