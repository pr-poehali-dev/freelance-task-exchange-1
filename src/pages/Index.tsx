import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const MODERATION_KEY = "admin2024";

type TaskStatus = "pending" | "approved" | "rejected";

interface Review {
  id: number;
  authorId: number;
  authorName: string;
  targetUserId: number;
  rating: number;
  text: string;
  createdAt: string;
}

interface AppUser {
  id: number;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  joinedAt: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  price: number | null;
  platform: string;
  contact: string;
  status: TaskStatus;
  authorId: number;
  authorName: string;
  createdAt: string;
  category: string;
  negotiable: boolean;
}

const CATEGORIES = ["Все", "Тексты", "Дизайн", "Таблицы", "Переводы", "Реклама", "Аудио", "Фото", "Другое"];

type Page = "home" | "create" | "profile" | "moderation";

const SEED_TASKS: Task[] = [
  { id: 1, title: "Написать текст для Instagram", description: "Нужны 5 постов для магазина одежды. Стиль — дружелюбный, молодёжный.", price: 800, platform: "Instagram", contact: "@masha_smm", status: "approved", authorId: 2, authorName: "Дарья К.", createdAt: "2 часа назад", category: "Тексты", negotiable: false },
  { id: 2, title: "Создать Excel-таблицу учёта расходов", description: "Таблица для малого бизнеса: доходы, расходы, остаток. Формулы и простой вид.", price: null, platform: "Telegram", contact: "@petrov_biz", status: "approved", authorId: 3, authorName: "Игорь С.", createdAt: "5 часов назад", category: "Таблицы", negotiable: true },
  { id: 3, title: "Перевести документ с английского", description: "2 страницы технического текста. Нужен точный перевод, не машинный.", price: 600, platform: "Email", contact: "@translate_ru", status: "approved", authorId: 2, authorName: "Дарья К.", createdAt: "Вчера", category: "Переводы", negotiable: false },
  { id: 4, title: "Настроить рекламу ВКонтакте", description: "Настройка таргета для локального кафе. Бюджет до 3000₽ в месяц.", price: 1200, platform: "ВКонтакте", contact: "@cafe_target", status: "approved", authorId: 3, authorName: "Игорь С.", createdAt: "Вчера", category: "Реклама", negotiable: false },
  { id: 5, title: "Озвучить 3-минутный ролик", description: "Корпоративный ролик для сайта. Нужен приятный мужской голос, без посторонних шумов.", price: 900, platform: "Telegram", contact: "@voice_pro", status: "approved", authorId: 2, authorName: "Дарья К.", createdAt: "2 дня назад", category: "Аудио", negotiable: false },
];

const SEED_REVIEWS: Review[] = [
  { id: 1, authorId: 3, authorName: "Игорь С.", targetUserId: 2, rating: 5, text: "Дарья написала отличные тексты, всё быстро и качественно!", createdAt: "3 дня назад" },
];

function calcRating(reviews: Review[], userId: number): number {
  const r = reviews.filter((r) => r.targetUserId === userId);
  if (r.length === 0) return 0;
  return Math.round((r.reduce((s, x) => s + x.rating, 0) / r.length) * 10) / 10;
}

function StarRating({ value, interactive = false, onChange }: { value: number; interactive?: boolean; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 transition-colors ${interactive ? "cursor-pointer" : ""} ${star <= (interactive ? (hovered || value) : Math.round(value)) ? "text-amber-400" : "text-gray-200"}`}
          fill="currentColor" viewBox="0 0 20 20"
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange && onChange(star)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// ─── Registration Modal ───────────────────────────────────────────────────────

function RegisterModal({ onRegister }: { onRegister: (user: AppUser) => void }) {
  const [form, setForm] = useState({ name: "", username: "", bio: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim()) { setError("Имя и никнейм обязательны"); return; }
    const initials = form.name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    onRegister({
      id: Date.now(), name: form.name.trim(),
      username: form.username.trim().replace(/^@/, ""),
      bio: form.bio.trim(), avatar: initials,
      joinedAt: new Intl.DateTimeFormat("ru", { month: "long", year: "numeric" }).format(new Date()),
    });
  };

  return (
    <Dialog open>
      <DialogContent className="rounded-2xl max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Добро пожаловать!</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-1">Расскажите о себе, чтобы начать работу</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Имя и фамилия</Label>
            <Input placeholder="Алексей Иванов" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(""); }} className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Telegram username</Label>
            <Input placeholder="@username" value={form.username} onChange={(e) => { setForm({ ...form, username: e.target.value }); setError(""); }} className="rounded-xl" />
            <p className="text-xs text-muted-foreground">Будет использован как контакт в заданиях</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">О себе <span className="text-muted-foreground font-normal">(необязательно)</span></Label>
            <Textarea placeholder="Чем занимаетесь, какие задания берёте..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="rounded-xl resize-none" rows={2} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 font-semibold mt-1">
            Начать работу
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({ task, currentUserId, onContact, onDelete }: { task: Task; currentUserId: number | null; onContact: (t: Task) => void; onDelete: (id: number) => void }) {
  const isOwner = currentUserId === task.authorId;
  return (
    <div className="card-stagger animate-fade-in bg-white rounded-2xl border border-border p-5 flex flex-col gap-3 hover:shadow-lg hover:shadow-green-100 hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{task.category}</span>
          <h3 className="mt-2 text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{task.title}</h3>
        </div>
        <div className="shrink-0 text-right flex flex-col items-end gap-1">
          <span className="text-lg font-bold text-primary">{task.negotiable || !task.price ? "Договорная" : `${task.price.toLocaleString("ru")}₽`}</span>
          {isOwner && (
            <button onClick={() => onDelete(task.id)} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-0.5">
              <Icon name="Trash2" size={12} />Удалить
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs font-medium text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-1">{task.platform}</span>
        <span className="text-xs text-muted-foreground">{task.createdAt}</span>
      </div>
      <Button onClick={() => onContact(task)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm h-9 mt-1">
        Откликнуться
      </Button>
    </div>
  );
}

// ─── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  if (!task) return null;
  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader><DialogTitle className="text-lg font-semibold">Контакт заказчика</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-muted-foreground">{task.title}</p>
          <div className="flex items-center gap-3 p-4 rounded-xl border bg-blue-50 text-blue-600 border-blue-100">
            <Icon name="Send" size={20} />
            <div>
              <p className="text-xs text-muted-foreground">Telegram</p>
              <p className="font-semibold text-sm">{task.contact.startsWith("@") ? task.contact : `@${task.contact}`}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Напишите заказчику напрямую, представившись исполнителем с биржи</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ tasks, currentUserId, onContact, onDelete }: { tasks: Task[]; currentUserId: number | null; onContact: (t: Task) => void; onDelete: (id: number) => void }) {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [sortBy, setSortBy] = useState<"new" | "price_asc" | "price_desc">("new");

  const approved = tasks.filter((t) => t.status === "approved");
  const filtered = activeCategory === "Все" ? approved : approved.filter((t) => t.category === activeCategory);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
    if (sortBy === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    return b.id - a.id;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-foreground mb-1">Лёгкие задания</h1>
        <p className="text-sm text-muted-foreground">Найди подработку или размести своё задание</p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-3 mb-5 animate-fade-in">
        <div className="flex gap-1.5 flex-wrap mb-3">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150 ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{cat}</button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["new", "price_asc", "price_desc"] as const).map((s) => {
            const labels = { new: "Новые", price_asc: "Дешевле", price_desc: "Дороже" };
            return <button key={s} onClick={() => setSortBy(s)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${sortBy === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{labels[s]}</button>;
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="Search" size={40} className="mx-auto mb-3 opacity-30" />
          <p>Заданий в этой категории пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((task) => <TaskCard key={task.id} task={task} currentUserId={currentUserId} onContact={onContact} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}

// ─── Create Task Page ─────────────────────────────────────────────────────────

function CreateTaskPage({ currentUser, onTaskCreated }: { currentUser: AppUser; onTaskCreated: (task: Task) => void }) {
  const [form, setForm] = useState({
    title: "", description: "", price: "", negotiable: false,
    platform: "", category: "Другое",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    const newTask: Task = {
      id: Date.now(), title: form.title, description: form.description,
      price: form.negotiable || !form.price ? null : Number(form.price),
      platform: form.platform || "Telegram",
      contact: `@${currentUser.username}`,
      status: "pending",
      authorId: currentUser.id, authorName: currentUser.name,
      createdAt: "Только что", category: form.category, negotiable: form.negotiable,
    };
    onTaskCreated(newTask);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center pb-24 animate-scale-in">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="CheckCircle" size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Задание отправлено!</h2>
        <p className="text-muted-foreground">Оно появится на бирже после проверки модератором. Обычно это занимает до 2 часов.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-24">
      <div className="mb-7 animate-slide-up">
        <h1 className="text-2xl font-bold text-foreground mb-1">Биржа заданий</h1>
        <div className="h-px bg-border mt-3" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 animate-fade-in">

        {/* Категория */}
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Категория</Label>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.filter((c) => c !== "Все").map((cat) => (
              <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })} className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all ${form.category === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Название */}
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Название</Label>
          <Input placeholder="Например: Написать посты для Instagram" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-2xl h-14 text-base border-border bg-white" required />
        </div>

        {/* Платформа */}
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Платформа</Label>
          <Input placeholder="Telegram, Instagram, ВКонтакте, Email..." value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="rounded-2xl h-14 text-base border-border bg-white" />
        </div>

        {/* Цена */}
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Цена</Label>
          <Input type="number" placeholder="Пусто = договорная" min="1" value={form.negotiable ? "" : form.price} onChange={(e) => setForm({ ...form, price: e.target.value, negotiable: false })} disabled={form.negotiable} className="rounded-2xl h-14 text-base border-border bg-white disabled:opacity-50" />
        </div>

        {/* Описание */}
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Описание</Label>
          <Textarea placeholder="Опишите задачу" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-2xl text-base border-border bg-white resize-none" rows={5} required />
        </div>

        {/* Связь */}
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Связь с вами</Label>
          <div className="h-14 rounded-2xl border border-border bg-muted flex items-center px-4 gap-2">
            <Icon name="Send" size={16} className="text-muted-foreground" />
            <span className="text-base text-foreground">@{currentUser.username}</span>
            <span className="text-xs text-muted-foreground ml-auto">Telegram</span>
          </div>
          <p className="text-xs text-muted-foreground">Контакт берётся из вашего профиля</p>
        </div>

        {/* Договорная */}
        <div className="flex items-center gap-3">
          <Checkbox id="negotiable" checked={form.negotiable} onCheckedChange={(v) => setForm({ ...form, negotiable: !!v, price: v ? "" : form.price })} className="w-5 h-5 rounded-md border-2" />
          <Label htmlFor="negotiable" className="text-sm text-muted-foreground cursor-pointer">Цена договорная</Label>
        </div>

        <Button type="submit" className="w-full rounded-2xl h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground mt-1">
          Опубликовать
        </Button>
      </form>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage({ currentUser, onUpdateUser, tasks, reviews, onAddReview, onDeleteTask }: {
  currentUser: AppUser; onUpdateUser: (u: AppUser) => void;
  tasks: Task[]; reviews: Review[];
  onAddReview: (r: Review) => void; onDeleteTask: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: currentUser.name, username: currentUser.username, bio: currentUser.bio });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });

  const userReviews = reviews.filter((r) => r.targetUserId === currentUser.id);
  const rating = calcRating(reviews, currentUser.id);
  const userTasks = tasks.filter((t) => t.authorId === currentUser.id && t.status === "approved");
  const reviewWord = (n: number) => n === 1 ? "отзыв" : n < 5 ? "отзыва" : "отзывов";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.username.trim()) return;
    onUpdateUser({ ...currentUser, name: editForm.name.trim(), username: editForm.username.trim().replace(/^@/, ""), bio: editForm.bio.trim(), avatar: editForm.name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() });
    setEditing(false);
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.text.trim()) return;
    onAddReview({ id: Date.now(), authorId: -1, authorName: "Аноним", targetUserId: currentUser.id, rating: reviewForm.rating, text: reviewForm.text.trim(), createdAt: "Только что" });
    setShowReviewForm(false);
    setReviewForm({ rating: 5, text: "" });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <h1 className="text-2xl font-bold text-foreground">Профиль</h1>
        {!editing && (
          <button onClick={() => { setEditForm({ name: currentUser.name, username: currentUser.username, bio: currentUser.bio }); setEditing(true); }} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
            <Icon name="Pencil" size={14} />Редактировать
          </button>
        )}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-5 animate-fade-in">
        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
                {editForm.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
              </div>
              <p className="text-sm text-muted-foreground">Аватар генерируется из имени</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Имя и фамилия</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Telegram username</Label>
              <Input placeholder="@username" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="rounded-xl" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">О себе</Label>
              <Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="rounded-xl resize-none" rows={2} placeholder="Чем занимаетесь..." />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground rounded-xl">Сохранить</Button>
              <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => setEditing(false)}>Отмена</Button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">{currentUser.avatar}</div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{currentUser.name}</h2>
                <p className="text-sm text-muted-foreground">@{currentUser.username} · с {currentUser.joinedAt}</p>
                {currentUser.bio && <p className="text-sm mt-2 text-foreground/80">{currentUser.bio}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <StarRating value={rating} />
                  <span className="text-sm font-semibold">{rating > 0 ? rating : "—"}</span>
                  <span className="text-sm text-muted-foreground">({userReviews.length} {reviewWord(userReviews.length)})</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border">
              {[
                { label: "Заданий", value: tasks.filter((t) => t.authorId === currentUser.id).length, icon: "FileText" },
                { label: "Рейтинг", value: rating > 0 ? rating : "—", icon: "Star" },
                { label: "Отзывов", value: userReviews.length, icon: "MessageSquare" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 bg-muted rounded-xl">
                  <Icon name={s.icon} size={16} className="mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* My tasks */}
      <div className="mb-5 animate-fade-in" style={{ animationDelay: "80ms" }}>
        <h3 className="font-semibold mb-3">Мои задания</h3>
        {userTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-white rounded-xl border border-border text-sm">Нет опубликованных заданий</div>
        ) : (
          <div className="flex flex-col gap-2">
            {userTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{task.createdAt} · {task.category}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-primary text-sm">{task.negotiable || !task.price ? "Договорная" : `${task.price.toLocaleString("ru")}₽`}</span>
                  <button onClick={() => onDeleteTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="animate-fade-in" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Отзывы обо мне</h3>
          <button onClick={() => setShowReviewForm((v) => !v)} className="text-sm text-primary font-medium hover:underline">
            + Добавить отзыв
          </button>
        </div>

        {showReviewForm && (
          <form onSubmit={handleReview} className="bg-white rounded-xl border border-border p-4 mb-3 flex flex-col gap-3 animate-scale-in">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Оценка</Label>
              <StarRating value={reviewForm.rating} interactive onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Отзыв</Label>
              <Textarea placeholder="Расскажите о совместной работе..." value={reviewForm.text} onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })} className="rounded-xl resize-none" rows={3} required />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground rounded-xl">Опубликовать</Button>
              <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => setShowReviewForm(false)}>Отмена</Button>
            </div>
          </form>
        )}

        {userReviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-white rounded-xl border border-border text-sm">Отзывов пока нет</div>
        ) : (
          <div className="flex flex-col gap-3">
            {userReviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {r.authorName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium">{r.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} />
                    <span className="text-xs text-muted-foreground">{r.createdAt}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Moderation Page ──────────────────────────────────────────────────────────

function ModerationPage({ tasks, onApprove, onReject, onDelete }: { tasks: Task[]; onApprove: (id: number) => void; onReject: (id: number) => void; onDelete: (id: number) => void }) {
  const [keyInput, setKeyInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | "all">("pending");

  const handleKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === MODERATION_KEY) { setUnlocked(true); setError(false); } else setError(true);
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  const counts = { all: tasks.length, pending: tasks.filter((t) => t.status === "pending").length, approved: tasks.filter((t) => t.status === "approved").length, rejected: tasks.filter((t) => t.status === "rejected").length };

  const statusBadge = (s: TaskStatus) => {
    const map = { pending: "bg-amber-50 text-amber-600 border-amber-100", approved: "bg-green-50 text-green-600 border-green-100", rejected: "bg-red-50 text-red-600 border-red-100" };
    const labels = { pending: "На проверке", approved: "Одобрено", rejected: "Отклонено" };
    return <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${map[s]}`}>{labels[s]}</span>;
  };

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20 pb-24 animate-scale-in">
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Icon name="Lock" size={24} className="text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold mb-1">Панель модерации</h2>
          <p className="text-sm text-muted-foreground mb-6">Введите секретный ключ для доступа</p>
          <form onSubmit={handleKey} className="flex flex-col gap-3">
            <Input type="password" placeholder="Секретный ключ" value={keyInput} onChange={(e) => { setKeyInput(e.target.value); setError(false); }} className={`rounded-xl text-center ${error ? "border-destructive" : ""}`} />
            {error && <p className="text-xs text-destructive">Неверный ключ</p>}
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">Войти</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
      <div className="flex items-center justify-between mb-5 animate-slide-up">
        <div>
          <h1 className="text-2xl font-bold mb-0.5">Модерация</h1>
          <p className="text-sm text-muted-foreground">Всего: {counts.all} · На проверке: {counts.pending}</p>
        </div>
        <Button variant="outline" onClick={() => setUnlocked(false)} className="rounded-xl text-sm gap-1.5">
          <Icon name="Lock" size={14} />Выйти
        </Button>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap animate-fade-in">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => {
          const labels = { all: "Все", pending: "На проверке", approved: "Одобренные", rejected: "Отклонённые" };
          return <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{labels[f]} ({counts[f]})</button>;
        })}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((task, i) => (
          <div key={task.id} className="animate-fade-in bg-white rounded-2xl border border-border p-5" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {statusBadge(task.status)}
                  <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                  <span className="text-xs text-muted-foreground">{task.createdAt}</span>
                </div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-muted-foreground">
                  <span className="font-bold text-primary text-sm">{task.negotiable || !task.price ? "Договорная" : `${task.price.toLocaleString("ru")}₽`}</span>
                  <span>{task.platform} · {task.contact}</span>
                  <span>Автор: {task.authorName}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                {task.status === "pending" && (
                  <>
                    <Button onClick={() => onApprove(task.id)} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-1"><Icon name="Check" size={13} />Одобрить</Button>
                    <Button onClick={() => onReject(task.id)} size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-red-50 rounded-xl gap-1"><Icon name="X" size={13} />Отклонить</Button>
                  </>
                )}
                <Button onClick={() => onDelete(task.id)} size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-red-50 rounded-xl gap-1">
                  <Icon name="Trash2" size={13} />Удалить
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="CheckCircle" size={36} className="mx-auto mb-3 opacity-30" /><p>Нет заданий в этой категории</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [page, setPage] = useState<Page>("home");
  const [tasks, setTasks] = useState<Task[]>(SEED_TASKS);
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS);
  const [contactTask, setContactTask] = useState<Task | null>(null);

  const handleDeleteTask = (id: number) => setTasks((p) => p.filter((t) => t.id !== id));
  const handleApprove = (id: number) => setTasks((p) => p.map((t) => t.id === id ? { ...t, status: "approved" } : t));
  const handleReject = (id: number) => setTasks((p) => p.map((t) => t.id === id ? { ...t, status: "rejected" } : t));

  const navItems: { key: Page; label: string; icon: string }[] = [
    { key: "home", label: "Биржа", icon: "LayoutGrid" },
    { key: "create", label: "Создать", icon: "PlusCircle" },
    { key: "profile", label: "Профиль", icon: "User" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {!currentUser && <RegisterModal onRegister={setCurrentUser} />}

      {/* Top header — only logo + moderation */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-13 flex items-center justify-between" style={{ height: "52px" }}>
          <button onClick={() => setPage("home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-base text-foreground">ФрилансБиржа</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage("moderation")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${page === "moderation" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <Icon name="ShieldCheck" size={14} />
              <span className="hidden sm:inline">Модерация</span>
            </button>
            {currentUser && (
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {currentUser.avatar.slice(0, 1)}
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {page === "home" && <HomePage tasks={tasks} currentUserId={currentUser?.id ?? null} onContact={setContactTask} onDelete={handleDeleteTask} />}
        {page === "create" && currentUser && <CreateTaskPage currentUser={currentUser} onTaskCreated={(t) => { setTasks((p) => [t, ...p]); setPage("home"); }} />}
        {page === "profile" && currentUser && <ProfilePage currentUser={currentUser} onUpdateUser={setCurrentUser} tasks={tasks} reviews={reviews} onAddReview={(r) => setReviews((p) => [r, ...p])} onDeleteTask={handleDeleteTask} />}
        {page === "moderation" && <ModerationPage tasks={tasks} onApprove={handleApprove} onReject={handleReject} onDelete={handleDeleteTask} />}
      </main>

      {/* Bottom Tab Bar */}
      {page !== "moderation" && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-border">
          <div className="max-w-lg mx-auto flex items-center">
            {navItems.map((item) => {
              const active = page === item.key;
              return (
                <button key={item.key} onClick={() => setPage(item.key)} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <div className={`transition-all ${active ? "scale-110" : ""}`}>
                    <Icon name={item.icon} size={22} />
                  </div>
                  <span className={`text-xs font-medium ${active ? "text-primary" : ""}`}>{item.label}</span>
                  {active && <div className="absolute top-0 w-6 h-0.5 bg-primary rounded-full" style={{ position: "relative", marginTop: "-2px" }} />}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <ContactModal task={contactTask} onClose={() => setContactTask(null)} />
    </div>
  );
}
