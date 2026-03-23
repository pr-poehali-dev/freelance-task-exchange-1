import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const MODERATION_KEY = "admin2024";

type Platform = "telegram" | "whatsapp" | "vk" | "email" | "other";
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
  platform: Platform;
  contact: string;
  status: TaskStatus;
  authorId: number;
  authorName: string;
  createdAt: string;
  category: string;
  negotiable: boolean;
}

const PLATFORM_LABELS: Record<Platform, { label: string; icon: string; color: string }> = {
  telegram: { label: "Telegram", icon: "Send", color: "bg-blue-50 text-blue-600 border-blue-100" },
  whatsapp: { label: "WhatsApp", icon: "MessageCircle", color: "bg-green-50 text-green-600 border-green-100" },
  vk: { label: "ВКонтакте", icon: "Users", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  email: { label: "Email", icon: "Mail", color: "bg-orange-50 text-orange-600 border-orange-100" },
  other: { label: "Другое", icon: "Link", color: "bg-gray-50 text-gray-600 border-gray-100" },
};

const CATEGORIES = ["Все", "Тексты", "Дизайн", "Таблицы", "Переводы", "Реклама", "Аудио", "Фото", "Другое"];

type Page = "home" | "create" | "profile" | "moderation";

const SEED_USERS: AppUser[] = [
  { id: 2, name: "Дарья К.", username: "darya_k", bio: "SMM-специалист, пишу тексты для соцсетей", avatar: "ДК", joinedAt: "Март 2024" },
  { id: 3, name: "Игорь С.", username: "igor_s", bio: "Разработчик и дизайнер на фрилансе", avatar: "ИС", joinedAt: "Октябрь 2023" },
];

const SEED_TASKS: Task[] = [
  { id: 1, title: "Написать текст для Instagram", description: "Нужны 5 постов для магазина одежды. Стиль — дружелюбный, молодёжный. Хэштеги в комплекте.", price: 800, platform: "telegram", contact: "@masha_smm", status: "approved", authorId: 2, authorName: "Дарья К.", createdAt: "2 часа назад", category: "Тексты", negotiable: false },
  { id: 2, title: "Создать Excel-таблицу учёта расходов", description: "Таблица для малого бизнеса: доходы, расходы, остаток. Формулы и простой вид.", price: null, platform: "telegram", contact: "@petrov_biz", status: "approved", authorId: 3, authorName: "Игорь С.", createdAt: "5 часов назад", category: "Таблицы", negotiable: true },
  { id: 3, title: "Перевести документ с английского", description: "2 страницы технического текста. Нужен точный перевод, не машинный.", price: 600, platform: "email", contact: "translate@work.ru", status: "approved", authorId: 2, authorName: "Дарья К.", createdAt: "Вчера", category: "Переводы", negotiable: false },
  { id: 4, title: "Настроить рекламу ВКонтакте", description: "Настройка таргета для локального кафе. Бюджет до 3000₽ в месяц. Нужна аудитория — жители района.", price: 1200, platform: "vk", contact: "id12345678", status: "approved", authorId: 3, authorName: "Игорь С.", createdAt: "Вчера", category: "Реклама", negotiable: false },
  { id: 5, title: "Озвучить 3-минутный ролик", description: "Корпоративный ролик для сайта. Нужен приятный мужской голос, без посторонних шумов.", price: 900, platform: "telegram", contact: "@voice_pro", status: "approved", authorId: 2, authorName: "Дарья К.", createdAt: "2 дня назад", category: "Аудио", negotiable: false },
];

const SEED_REVIEWS: Review[] = [
  { id: 1, authorId: 3, authorName: "Игорь С.", targetUserId: 2, rating: 5, text: "Дарья написала отличные тексты, всё быстро и качественно!", createdAt: "3 дня назад" },
  { id: 2, authorId: 2, authorName: "Дарья К.", targetUserId: 3, rating: 4, text: "Хорошая работа, таблица получилась удобная. Небольшие задержки, но результат понравился.", createdAt: "Неделю назад" },
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
          fill="currentColor"
          viewBox="0 0 20 20"
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
    const user: AppUser = {
      id: Date.now(),
      name: form.name.trim(),
      username: form.username.trim().replace(/^@/, ""),
      bio: form.bio.trim(),
      avatar: initials,
      joinedAt: new Intl.DateTimeFormat("ru", { month: "long", year: "numeric" }).format(new Date()),
    };
    onRegister(user);
  };

  return (
    <Dialog open>
      <DialogContent className="rounded-2xl max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Добро пожаловать!</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-1">Расскажите немного о себе, чтобы начать работу</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Имя и фамилия</Label>
            <Input placeholder="Алексей Иванов" value={form.name} onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(""); }} className="rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Никнейм</Label>
            <Input placeholder="@ivan_freelancer" value={form.username} onChange={(e) => { setForm({ ...form, username: e.target.value }); setError(""); }} className="rounded-xl" />
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
  const pl = PLATFORM_LABELS[task.platform];
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
              <Icon name="Trash2" size={12} />
              Удалить
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between mt-1">
        <div className={`flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-1 ${pl.color}`}>
          <Icon name={pl.icon} size={12} /><span>{pl.label}</span>
        </div>
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
  const pl = PLATFORM_LABELS[task.platform];
  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader><DialogTitle className="text-lg font-semibold">Контакт заказчика</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-muted-foreground">{task.title}</p>
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${pl.color}`}>
            <Icon name={pl.icon} size={20} />
            <div><p className="text-xs text-muted-foreground">{pl.label}</p><p className="font-semibold text-sm">{task.contact}</p></div>
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">Лёгкие задания</h1>
        <p className="text-muted-foreground">Найди подработку или размести своё задание за минуту</p>
      </div>
      <div className="bg-white rounded-2xl border border-border p-4 mb-6 animate-fade-in flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex gap-2 flex-wrap flex-1">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all duration-150 ${activeCategory === cat ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>{cat}</button>
          ))}
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44 h-9 rounded-xl text-sm shrink-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Сначала новые</SelectItem>
            <SelectItem value="price_asc">Дешевле</SelectItem>
            <SelectItem value="price_desc">Дороже</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {sorted.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="Search" size={40} className="mx-auto mb-3 opacity-30" /><p>Заданий в этой категории пока нет</p>
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
  const [form, setForm] = useState({ title: "", description: "", price: "", negotiable: false, platform: "telegram" as Platform, contact: "", category: "Другое" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.contact) return;
    const newTask: Task = {
      id: Date.now(), title: form.title, description: form.description,
      price: form.negotiable || !form.price ? null : Number(form.price),
      platform: form.platform, contact: form.contact, status: "pending",
      authorId: currentUser.id, authorName: currentUser.name,
      createdAt: "Только что", category: form.category, negotiable: form.negotiable,
    };
    onTaskCreated(newTask);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center animate-scale-in">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="CheckCircle" size={40} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Задание отправлено!</h2>
        <p className="text-muted-foreground">Оно появится на бирже после проверки модератором. Обычно это занимает до 2 часов.</p>
      </div>
    );
  }

  const contactPlaceholder: Record<Platform, string> = {
    telegram: "@username", whatsapp: "+79001234567", vk: "id123456", email: "your@email.ru", other: "@username, телефон или ссылка",
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-2xl font-bold text-foreground mb-1">Биржа заданий</h1>
        <div className="h-px bg-border mt-3" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7 animate-fade-in">
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Платформа</Label>
          <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as Platform })}>
            <SelectTrigger className="rounded-2xl h-14 text-base border-border bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="vk">ВКонтакте</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="other">Другое</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Категория</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger className="rounded-2xl h-14 text-base border-border bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.filter((c) => c !== "Все").map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Название</Label>
          <Input placeholder="Например: Написать посты для Instagram" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-2xl h-14 text-base border-border bg-white" required />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Цена</Label>
          <Input type="number" placeholder="Пусто = договорная" min="1" value={form.negotiable ? "" : form.price} onChange={(e) => setForm({ ...form, price: e.target.value, negotiable: false })} disabled={form.negotiable} className="rounded-2xl h-14 text-base border-border bg-white disabled:opacity-50" />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Описание</Label>
          <Textarea placeholder="Опишите задачу" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-2xl text-base border-border bg-white resize-none" rows={5} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium text-foreground">Связь с вами</Label>
          <Input placeholder={contactPlaceholder[form.platform]} value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="rounded-2xl h-14 text-base border-border bg-white" required />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox id="negotiable" checked={form.negotiable} onCheckedChange={(v) => setForm({ ...form, negotiable: !!v, price: v ? "" : form.price })} className="w-5 h-5 rounded-md border-2" />
          <Label htmlFor="negotiable" className="text-sm text-muted-foreground cursor-pointer">Цена договорная</Label>
        </div>

        <Button type="submit" className="w-full rounded-2xl h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
          Опубликовать
        </Button>
      </form>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage({ currentUser, users, tasks, reviews, onAddReview, onDeleteTask }: { currentUser: AppUser; users: AppUser[]; tasks: Task[]; reviews: Review[]; onAddReview: (r: Review) => void; onDeleteTask: (id: number) => void }) {
  const [viewingId, setViewingId] = useState<number>(currentUser.id);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });

  const allUsers = [currentUser, ...users.filter((u) => u.id !== currentUser.id)];
  const viewed = allUsers.find((u) => u.id === viewingId) ?? currentUser;
  const userReviews = reviews.filter((r) => r.targetUserId === viewed.id);
  const rating = calcRating(reviews, viewed.id);
  const userTasks = tasks.filter((t) => t.authorId === viewed.id && t.status === "approved");
  const isOwnProfile = viewed.id === currentUser.id;
  const alreadyReviewed = reviews.some((r) => r.authorId === currentUser.id && r.targetUserId === viewed.id);

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.text.trim()) return;
    onAddReview({ id: Date.now(), authorId: currentUser.id, authorName: currentUser.name, targetUserId: viewed.id, rating: reviewForm.rating, text: reviewForm.text.trim(), createdAt: "Только что" });
    setShowReviewForm(false);
    setReviewForm({ rating: 5, text: "" });
  };

  const reviewWord = (n: number) => n === 1 ? "отзыв" : n < 5 ? "отзыва" : "отзывов";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground">Профиль</h1>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap animate-fade-in">
        {allUsers.map((u) => (
          <button key={u.id} onClick={() => { setViewingId(u.id); setShowReviewForm(false); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${viewingId === u.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">{u.avatar.slice(0, 1)}</span>
            {u.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 mb-5 animate-fade-in">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">{viewed.avatar}</div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{viewed.name}</h2>
            <p className="text-sm text-muted-foreground">@{viewed.username} · с {viewed.joinedAt}</p>
            {viewed.bio && <p className="text-sm mt-2 text-foreground/80">{viewed.bio}</p>}
            <div className="flex items-center gap-2 mt-3">
              <StarRating value={rating} />
              <span className="text-sm font-semibold">{rating > 0 ? rating : "—"}</span>
              <span className="text-sm text-muted-foreground">({userReviews.length} {reviewWord(userReviews.length)})</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          {[
            { label: "Заданий размещено", value: tasks.filter((t) => t.authorId === viewed.id).length, icon: "FileText" },
            { label: "Рейтинг", value: rating > 0 ? rating : "—", icon: "Star" },
            { label: "Отзывов", value: userReviews.length, icon: "MessageSquare" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-muted rounded-xl">
              <Icon name={stat.icon} size={18} className="mx-auto mb-1.5 text-primary" />
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in mb-6" style={{ animationDelay: "80ms" }}>
        <h3 className="font-semibold mb-3 text-foreground">Задания</h3>
        {userTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-white rounded-xl border border-border text-sm">Нет опубликованных заданий</div>
        ) : (
          <div className="flex flex-col gap-2">
            {userTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{task.createdAt} · {task.category}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-bold text-primary text-sm">{task.negotiable || !task.price ? "Договорная" : `${task.price.toLocaleString("ru")}₽`}</span>
                  {isOwnProfile && (
                    <button onClick={() => onDeleteTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Отзывы</h3>
          {!isOwnProfile && !alreadyReviewed && (
            <button onClick={() => setShowReviewForm((v) => !v)} className="text-sm text-primary font-medium hover:underline">
              + Оставить отзыв
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleReview} className="bg-white rounded-xl border border-border p-4 mb-4 flex flex-col gap-3 animate-scale-in">
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Оценка</Label>
              <StarRating value={reviewForm.rating} interactive onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-sm font-medium">Ваш отзыв</Label>
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
            {userReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">
                      {review.authorName.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-sm font-medium">{review.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} />
                    <span className="text-xs text-muted-foreground">{review.createdAt}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
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

  const statusBadge = (s: TaskStatus) => {
    const map = { pending: "bg-amber-50 text-amber-600 border-amber-100", approved: "bg-green-50 text-green-600 border-green-100", rejected: "bg-red-50 text-red-600 border-red-100" };
    const labels = { pending: "На проверке", approved: "Одобрено", rejected: "Отклонено" };
    return <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${map[s]}`}>{labels[s]}</span>;
  };

  if (!unlocked) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20 animate-scale-in">
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Модерация</h1>
          <p className="text-muted-foreground text-sm">Всего: {tasks.length} · На проверке: {tasks.filter((t) => t.status === "pending").length}</p>
        </div>
        <Button variant="outline" onClick={() => setUnlocked(false)} className="rounded-xl text-sm gap-2">
          <Icon name="Lock" size={14} />Выйти
        </Button>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap animate-fade-in">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => {
          const labels = { all: "Все", pending: "На проверке", approved: "Одобренные", rejected: "Отклонённые" };
          const counts = { all: tasks.length, pending: tasks.filter((t) => t.status === "pending").length, approved: tasks.filter((t) => t.status === "approved").length, rejected: tasks.filter((t) => t.status === "rejected").length };
          return <button key={f} onClick={() => setFilter(f)} className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{labels[f]} <span className="opacity-70">({counts[f]})</span></button>;
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
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-sm font-bold text-primary">{task.negotiable || !task.price ? "Договорная" : `${task.price.toLocaleString("ru")}₽`}</span>
                  <span className="text-xs text-muted-foreground">{PLATFORM_LABELS[task.platform].label} · {task.contact}</span>
                  <span className="text-xs text-muted-foreground">Автор: {task.authorName}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 flex-wrap">
                {task.status === "pending" && (
                  <>
                    <Button onClick={() => onApprove(task.id)} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-1.5"><Icon name="Check" size={14} />Одобрить</Button>
                    <Button onClick={() => onReject(task.id)} size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-red-50 rounded-xl gap-1.5"><Icon name="X" size={14} />Отклонить</Button>
                  </>
                )}
                <Button onClick={() => onDelete(task.id)} size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-red-50 rounded-xl gap-1.5">
                  <Icon name="Trash2" size={14} />Удалить
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

  const handleDeleteTask = (id: number) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const handleApprove = (id: number) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "approved" } : t)));
  const handleReject = (id: number) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "rejected" } : t)));

  const navItems: { key: Page; label: string; icon: string }[] = [
    { key: "home", label: "Биржа", icon: "LayoutGrid" },
    { key: "create", label: "Создать", icon: "Plus" },
    { key: "profile", label: "Профиль", icon: "User" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {!currentUser && <RegisterModal onRegister={setCurrentUser} />}

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => setPage("home")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-base text-foreground">ФрилансБиржа</span>
          </button>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button key={item.key} onClick={() => setPage(item.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${page === item.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                <Icon name={item.icon} size={14} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
            <button onClick={() => setPage("moderation")} className={`ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${page === "moderation" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
              <Icon name="ShieldCheck" size={14} />
              <span className="hidden sm:inline">Модерация</span>
            </button>
            {currentUser && (
              <div className="ml-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {currentUser.avatar.slice(0, 1)}
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        {page === "home" && <HomePage tasks={tasks} currentUserId={currentUser?.id ?? null} onContact={setContactTask} onDelete={handleDeleteTask} />}
        {page === "create" && currentUser && <CreateTaskPage currentUser={currentUser} onTaskCreated={(t) => { setTasks((p) => [t, ...p]); setPage("home"); }} />}
        {page === "profile" && currentUser && <ProfilePage currentUser={currentUser} users={SEED_USERS} tasks={tasks} reviews={reviews} onAddReview={(r) => setReviews((p) => [r, ...p])} onDeleteTask={handleDeleteTask} />}
        {page === "moderation" && <ModerationPage tasks={tasks} onApprove={handleApprove} onReject={handleReject} onDelete={handleDeleteTask} />}
      </main>

      <ContactModal task={contactTask} onClose={() => setContactTask(null)} />
    </div>
  );
}
