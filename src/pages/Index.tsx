import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const MODERATION_KEY = "admin2024";
type TaskStatus = "pending" | "approved" | "rejected";
type Page = "home" | "create" | "profile" | "moderation";

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

interface Rating {
  fromId: number;
  toId: number;
  value: number;
}

const CATEGORIES = ["Все", "Тексты", "Дизайн", "Таблицы", "Переводы", "Реклама", "Аудио", "Фото", "Другое"];

const SEED_TASKS: Task[] = [
  { id: 1, title: "Написать текст для Instagram", description: "Нужны 5 постов для магазина одежды. Стиль — дружелюбный, молодёжный.", price: 800, platform: "Instagram", contact: "@masha_smm", status: "approved", authorId: 2, authorName: "Дарья К.", createdAt: "2 часа назад", category: "Тексты", negotiable: false },
  { id: 2, title: "Создать Excel-таблицу расходов", description: "Таблица для малого бизнеса: доходы, расходы, остаток. Формулы и простой вид.", price: null, platform: "Telegram", contact: "@petrov_biz", status: "approved", authorId: 3, authorName: "Игорь С.", createdAt: "5 часов назад", category: "Таблицы", negotiable: true },
  { id: 3, title: "Перевести документ с английского", description: "2 страницы технического текста. Нужен точный перевод, не машинный.", price: 600, platform: "Email", contact: "@translate_ru", status: "approved", authorId: 2, authorName: "Дарья К.", createdAt: "Вчера", category: "Переводы", negotiable: false },
  { id: 4, title: "Настроить рекламу ВКонтакте", description: "Настройка таргета для локального кафе. Бюджет до 3000₽ в месяц.", price: 1200, platform: "ВКонтакте", contact: "@cafe_target", status: "approved", authorId: 3, authorName: "Игорь С.", createdAt: "Вчера", category: "Реклама", negotiable: false },
  { id: 5, title: "Озвучить 3-минутный ролик", description: "Корпоративный ролик для сайта. Нужен приятный мужской голос, без посторонних шумов.", price: 900, platform: "Telegram", contact: "@voice_pro", status: "approved", authorId: 2, authorName: "Дарья К.", createdAt: "2 дня назад", category: "Аудио", negotiable: false },
];

// ─── Register ─────────────────────────────────────────────────────────────────

function RegisterModal({ onRegister }: { onRegister: (u: AppUser) => void }) {
  const [form, setForm] = useState({ name: "", username: "", bio: "" });
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.username.trim()) { setError("Заполните имя и никнейм"); return; }
    const avatar = form.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    onRegister({ id: Date.now(), name: form.name.trim(), username: form.username.trim().replace(/^@/, ""), bio: form.bio.trim(), avatar, joinedAt: new Intl.DateTimeFormat("ru", { month: "long", year: "numeric" }).format(new Date()) });
  };

  return (
    <Dialog open>
      <DialogContent className="rounded-2xl max-w-sm" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader><DialogTitle className="text-xl font-bold">Добро пожаловать!</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground -mt-1">Создайте профиль, чтобы начать</p>
        <form onSubmit={submit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Имя и фамилия</Label>
            <Input placeholder="Алексей Иванов" value={form.name} onChange={e => { setForm({ ...form, name: e.target.value }); setError(""); }} className="rounded-xl h-12" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Telegram username</Label>
            <Input placeholder="@username" value={form.username} onChange={e => { setForm({ ...form, username: e.target.value }); setError(""); }} className="rounded-xl h-12" />
            <p className="text-xs text-muted-foreground">Будет показан исполнителям для связи</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">О себе <span className="font-normal text-muted-foreground">(необязательно)</span></Label>
            <Textarea placeholder="Чем занимаетесь..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="rounded-xl resize-none" rows={2} />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 font-semibold">Начать</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Contact Modal ────────────────────────────────────────────────────────────

function ContactModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  if (!task) return null;
  const handle = task.contact.startsWith("@") ? task.contact : `@${task.contact}`;
  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader><DialogTitle className="text-lg font-semibold">Связаться с заказчиком</DialogTitle></DialogHeader>
        <div className="flex flex-col gap-4 pt-1">
          <p className="text-sm text-muted-foreground leading-relaxed">{task.title}</p>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <Icon name="Send" size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-400 mb-0.5">Telegram</p>
              <p className="font-bold text-blue-700">{handle}</p>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground">Напишите заказчику и представьтесь</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ tasks, currentUserId, onContact, onDelete }: { tasks: Task[]; currentUserId: number | null; onContact: (t: Task) => void; onDelete: (id: number) => void }) {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("Все платформы");

  const approved = tasks.filter(t => t.status === "approved");
  const platforms = ["Все платформы", ...Array.from(new Set(approved.map(t => t.platform).filter(Boolean)))];

  const filtered = approved.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchPlatform = platformFilter === "Все платформы" || t.platform === platformFilter;
    return matchSearch && matchPlatform;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 pt-5 pb-28">
      <h1 className="text-2xl font-bold text-foreground mb-4">Биржа заданий</h1>

      {/* Search */}
      <div className="relative mb-3">
        <Icon name="Search" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Введите ключевое слово"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-12 rounded-2xl border border-border bg-white pl-10 pr-4 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {/* Platform filter */}
      <div className="relative mb-4">
        <select
          value={platformFilter}
          onChange={e => setPlatformFilter(e.target.value)}
          className="w-full h-12 rounded-2xl border border-border bg-white px-4 text-base outline-none appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
        >
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <Icon name="ChevronsUpDown" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name="Search" size={36} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm">Ничего не найдено</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((task, i) => {
            const isOwner = currentUserId === task.authorId;
            const priceStr = task.negotiable || !task.price ? "Договорная" : `${task.price.toLocaleString("ru")} ₽`;
            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-border px-4 py-3.5 flex flex-col gap-1.5 animate-fade-in card-stagger"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-bold text-base text-foreground leading-snug">{task.platform || "—"}</span>
                  <span className="font-bold text-base text-primary shrink-0">{priceStr}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <button onClick={() => onContact(task)} className="text-sm text-primary font-medium hover:underline">
                    Откликнуться →
                  </button>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{task.createdAt}</span>
                    {isOwner && (
                      <button onClick={() => onDelete(task.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Icon name="Trash2" size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Create Page ──────────────────────────────────────────────────────────────

function CreatePage({ currentUser, onTaskCreated }: { currentUser: AppUser; onTaskCreated: (t: Task) => void }) {
  const [form, setForm] = useState({ title: "", description: "", price: "", negotiable: false, platform: "", category: "Другое" });
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) return;
    onTaskCreated({ id: Date.now(), title: form.title, description: form.description, price: form.negotiable || !form.price ? null : Number(form.price), platform: form.platform || "Telegram", contact: `@${currentUser.username}`, status: "pending", authorId: currentUser.id, authorName: currentUser.name, createdAt: "Только что", category: form.category, negotiable: form.negotiable });
    setDone(true);
  };

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-20 pb-28 text-center animate-scale-in">
      <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-5">
        <Icon name="CheckCircle" size={32} className="text-primary" />
      </div>
      <h2 className="text-xl font-bold mb-2">Задание отправлено!</h2>
      <p className="text-sm text-muted-foreground">Появится на бирже после проверки модератором</p>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-28">
      <h1 className="text-2xl font-bold mb-1">Биржа заданий</h1>
      <div className="h-px bg-border mb-6" />

      <form onSubmit={submit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium">Платформа</Label>
          <input placeholder="Telegram, Instagram, Avito..." value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} className="w-full h-14 rounded-2xl border border-border bg-white px-4 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium">Цена</Label>
          <input type="number" placeholder="Пусто = договорная" min="1" value={form.negotiable ? "" : form.price} onChange={e => setForm({ ...form, price: e.target.value, negotiable: false })} disabled={form.negotiable} className="w-full h-14 rounded-2xl border border-border bg-white px-4 text-base outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium">Описание</Label>
          <Textarea placeholder="Опишите задачу" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="rounded-2xl text-base border-border bg-white resize-none min-h-[120px]" rows={5} required />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-base font-medium">Связь с вами</Label>
          <div className="h-14 rounded-2xl border border-border bg-muted flex items-center px-4 gap-2">
            <Icon name="Send" size={16} className="text-muted-foreground" />
            <span className="text-base">@{currentUser.username}</span>
            <span className="text-xs text-muted-foreground ml-auto">Telegram</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox id="neg" checked={form.negotiable} onCheckedChange={v => setForm({ ...form, negotiable: !!v, price: v ? "" : form.price })} className="w-5 h-5 rounded-md" />
          <Label htmlFor="neg" className="text-sm text-muted-foreground cursor-pointer">Цена договорная</Label>
        </div>

        <button type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-base font-bold hover:bg-primary/90 transition-colors mt-1">
          Опубликовать
        </button>
      </form>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage({ currentUser, onUpdateUser, tasks, ratings, onRate, onDeleteTask }: {
  currentUser: AppUser;
  onUpdateUser: (u: AppUser) => void;
  tasks: Task[];
  ratings: Rating[];
  onRate: (r: Rating) => void;
  onDeleteTask: (id: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: currentUser.name, username: currentUser.username, bio: currentUser.bio });

  const userRatings = ratings.filter(r => r.toId === currentUser.id);
  const avgRating = userRatings.length > 0 ? Math.round(userRatings.reduce((s, r) => s + r.value, 0) / userRatings.length * 10) / 10 : null;
  const userTasks = tasks.filter(t => t.authorId === currentUser.id && t.status === "approved");

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.username.trim()) return;
    onUpdateUser({ ...currentUser, name: editForm.name.trim(), username: editForm.username.trim().replace(/^@/, ""), bio: editForm.bio.trim(), avatar: editForm.name.trim().split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() });
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Профиль</h1>
        {!editing && (
          <button onClick={() => { setEditForm({ name: currentUser.name, username: currentUser.username, bio: currentUser.bio }); setEditing(true); }} className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
            <Icon name="Pencil" size={14} />Изменить
          </button>
        )}
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-border p-5 mb-4 animate-fade-in">
        {editing ? (
          <form onSubmit={saveEdit} className="flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
                {editForm.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
              </div>
              <p className="text-xs text-muted-foreground">Аватар из инициалов</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Имя и фамилия</Label>
              <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="rounded-xl h-11" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">Telegram username</Label>
              <Input placeholder="@username" value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} className="rounded-xl h-11" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">О себе</Label>
              <Textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="rounded-xl resize-none" rows={2} placeholder="Чем занимаетесь..." />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">Сохранить</button>
              <button type="button" className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors" onClick={() => setEditing(false)}>Отмена</button>
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">{currentUser.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg leading-tight">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
              {currentUser.bio && <p className="text-sm mt-1.5 text-foreground/80 leading-relaxed">{currentUser.bio}</p>}
              <p className="text-xs text-muted-foreground mt-1.5">На бирже с {currentUser.joinedAt}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {!editing && (
        <div className="grid grid-cols-3 gap-2.5 mb-5 animate-fade-in" style={{ animationDelay: "60ms" }}>
          <div className="bg-white rounded-2xl border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{tasks.filter(t => t.authorId === currentUser.id).length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Заданий</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-3 text-center">
            <p className="text-2xl font-bold text-primary">{avgRating ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Рейтинг</p>
          </div>
          <div className="bg-white rounded-2xl border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{userRatings.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Оценок</p>
          </div>
        </div>
      )}

      {/* My tasks */}
      {!editing && (
        <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <p className="font-semibold mb-3">Мои задания</p>
          {userTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-6 text-center text-sm text-muted-foreground">Нет опубликованных заданий</div>
          ) : (
            <div className="flex flex-col gap-2">
              {userTasks.map(task => (
                <div key={task.id} className="bg-white rounded-2xl border border-border px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.platform} · {task.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-bold text-primary text-sm">{task.negotiable || !task.price ? "Договорная" : `${task.price.toLocaleString("ru")} ₽`}</span>
                    <button onClick={() => onDeleteTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Moderation Page ──────────────────────────────────────────────────────────

function ModerationPage({ tasks, onApprove, onReject, onDelete }: { tasks: Task[]; onApprove: (id: number) => void; onReject: (id: number) => void; onDelete: (id: number) => void }) {
  const [keyInput, setKeyInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [keyError, setKeyError] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | "all">("pending");

  const handleKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === MODERATION_KEY) { setUnlocked(true); setKeyError(false); } else setKeyError(true);
  };

  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);
  const counts = { all: tasks.length, pending: tasks.filter(t => t.status === "pending").length, approved: tasks.filter(t => t.status === "approved").length, rejected: tasks.filter(t => t.status === "rejected").length };

  if (!unlocked) return (
    <div className="max-w-sm mx-auto px-4 py-20 pb-28">
      <div className="bg-white rounded-2xl border border-border p-7 text-center">
        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="Lock" size={22} className="text-muted-foreground" />
        </div>
        <h2 className="text-lg font-bold mb-1">Панель модерации</h2>
        <p className="text-sm text-muted-foreground mb-5">Введите ключ доступа</p>
        <form onSubmit={handleKey} className="flex flex-col gap-3">
          <input type="password" placeholder="Секретный ключ" value={keyInput} onChange={e => { setKeyInput(e.target.value); setKeyError(false); }} className={`w-full h-12 rounded-xl border px-4 text-center text-base outline-none focus:ring-2 focus:ring-primary/20 transition-all ${keyError ? "border-destructive" : "border-border"}`} />
          {keyError && <p className="text-xs text-destructive">Неверный ключ</p>}
          <button type="submit" className="h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">Войти</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold">Модерация</h1>
          <p className="text-sm text-muted-foreground">На проверке: {counts.pending}</p>
        </div>
        <button onClick={() => setUnlocked(false)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium border border-border rounded-xl px-3 py-1.5 hover:bg-muted transition-all">
          <Icon name="Lock" size={13} />Выйти
        </button>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map(f => {
          const labels = { all: "Все", pending: "На проверке", approved: "Одобренные", rejected: "Отклонённые" };
          return <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-white border border-border text-muted-foreground hover:bg-muted"}`}>{labels[f]} ({counts[f]})</button>;
        })}
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map((task, i) => {
          const statusColor = { pending: "text-amber-600 bg-amber-50 border-amber-100", approved: "text-green-600 bg-green-50 border-green-100", rejected: "text-red-600 bg-red-50 border-red-100" }[task.status];
          const statusLabel = { pending: "На проверке", approved: "Одобрено", rejected: "Отклонено" }[task.status];
          return (
            <div key={task.id} className="bg-white rounded-2xl border border-border px-4 py-4 animate-fade-in" style={{ animationDelay: `${i * 35}ms` }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium border rounded-full px-2.5 py-0.5 ${statusColor}`}>{statusLabel}</span>
                  <span className="text-xs text-muted-foreground">{task.platform} · {task.authorName}</span>
                </div>
                <span className="font-bold text-primary shrink-0">{task.negotiable || !task.price ? "Договорная" : `${task.price.toLocaleString("ru")} ₽`}</span>
              </div>
              <p className="font-semibold text-sm mb-1">{task.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
              <div className="flex gap-2 flex-wrap">
                {task.status === "pending" && (
                  <>
                    <button onClick={() => onApprove(task.id)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                      <Icon name="Check" size={12} />Одобрить
                    </button>
                    <button onClick={() => onReject(task.id)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-destructive/30 text-destructive hover:bg-red-50 transition-colors">
                      <Icon name="X" size={12} />Отклонить
                    </button>
                  </>
                )}
                <button onClick={() => onDelete(task.id)} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-destructive/30 text-destructive hover:bg-red-50 transition-colors">
                  <Icon name="Trash2" size={12} />Удалить
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-14 text-muted-foreground">
            <Icon name="CheckCircle" size={32} className="mx-auto mb-2 opacity-25" />
            <p className="text-sm">Заданий нет</p>
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
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [contactTask, setContactTask] = useState<Task | null>(null);

  const handleDeleteTask = (id: number) => setTasks(p => p.filter(t => t.id !== id));
  const handleApprove = (id: number) => setTasks(p => p.map(t => t.id === id ? { ...t, status: "approved" } : t));
  const handleReject = (id: number) => setTasks(p => p.map(t => t.id === id ? { ...t, status: "rejected" } : t));

  const navItems = [
    { key: "home" as Page, label: "Поиск", icon: "Search" },
    { key: "create" as Page, label: "Создать", icon: "Plus" },
    { key: "profile" as Page, label: "Профиль", icon: "User" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {!currentUser && <RegisterModal onRegister={setCurrentUser} />}

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-border">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between" style={{ height: 52 }}>
          <button onClick={() => setPage("home")} className="flex items-center gap-2 hover:opacity-75 transition-opacity">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-base">ФрилансБиржа</span>
          </button>
          <button onClick={() => setPage("moderation")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${page === "moderation" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>
            <Icon name="ShieldCheck" size={13} />Модерация
          </button>
        </div>
      </header>

      {/* Pages */}
      <main>
        {page === "home" && <HomePage tasks={tasks} currentUserId={currentUser?.id ?? null} onContact={setContactTask} onDelete={handleDeleteTask} />}
        {page === "create" && currentUser && <CreatePage currentUser={currentUser} onTaskCreated={t => { setTasks(p => [t, ...p]); setPage("home"); }} />}
        {page === "profile" && currentUser && <ProfilePage currentUser={currentUser} onUpdateUser={setCurrentUser} tasks={tasks} ratings={ratings} onRate={r => setRatings(p => [...p, r])} onDeleteTask={handleDeleteTask} />}
        {page === "moderation" && <ModerationPage tasks={tasks} onApprove={handleApprove} onReject={handleReject} onDelete={handleDeleteTask} />}
      </main>

      {/* Bottom tab bar */}
      {page !== "moderation" && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border">
          <div className="max-w-lg mx-auto flex">
            {navItems.map(item => {
              const active = page === item.key;
              return (
                <button key={item.key} onClick={() => setPage(item.key)} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all ${active ? "text-primary" : "text-muted-foreground"}`}>
                  <Icon name={item.icon} size={active ? 23 : 21} />
                  <span className={`text-xs font-medium ${active ? "text-primary" : ""}`}>{item.label}</span>
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
