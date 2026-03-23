import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const MODERATION_KEY = "admin2024";

type Platform = "telegram" | "whatsapp" | "vk" | "email";
type TaskStatus = "pending" | "approved" | "rejected";

interface Task {
  id: number;
  title: string;
  description: string;
  price: number;
  platform: Platform;
  contact: string;
  status: TaskStatus;
  authorId: number;
  createdAt: string;
  category: string;
}

interface User {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  tasksPosted: number;
  tasksCompleted: number;
  joinedAt: string;
}

const MOCK_USERS: User[] = [
  { id: 1, name: "Алексей М.", avatar: "АМ", rating: 4.8, reviewsCount: 24, tasksPosted: 12, tasksCompleted: 31, joinedAt: "Январь 2024" },
  { id: 2, name: "Дарья К.", avatar: "ДК", rating: 4.5, reviewsCount: 18, tasksPosted: 8, tasksCompleted: 22, joinedAt: "Март 2024" },
  { id: 3, name: "Игорь С.", avatar: "ИС", rating: 4.9, reviewsCount: 41, tasksPosted: 20, tasksCompleted: 55, joinedAt: "Октябрь 2023" },
];

const MOCK_TASKS: Task[] = [
  { id: 1, title: "Написать текст для Instagram", description: "Нужны 5 постов для магазина одежды. Стиль — дружелюбный, молодёжный. Хэштеги в комплекте.", price: 800, platform: "telegram", contact: "@masha_smm", status: "approved", authorId: 2, createdAt: "2 часа назад", category: "Тексты" },
  { id: 2, title: "Создать Excel-таблицу учёта расходов", description: "Таблица для малого бизнеса: доходы, расходы, остаток. Формулы и простой вид.", price: 500, platform: "telegram", contact: "@petrov_biz", status: "approved", authorId: 1, createdAt: "5 часов назад", category: "Таблицы" },
  { id: 3, title: "Перевести документ с английского", description: "2 страницы технического текста. Нужен точный перевод, не машинный.", price: 600, platform: "email", contact: "translate@work.ru", status: "approved", authorId: 3, createdAt: "Вчера", category: "Переводы" },
  { id: 4, title: "Настроить рекламу ВКонтакте", description: "Настройка таргета для локального кафе. Бюджет до 3000₽ в месяц. Нужна аудитория — жители района.", price: 1200, platform: "vk", contact: "id12345678", status: "approved", authorId: 2, createdAt: "Вчера", category: "Реклама" },
  { id: 5, title: "Озвучить 3-минутный ролик", description: "Корпоративный ролик для сайта. Нужен приятный мужской голос, без посторонних шумов.", price: 900, platform: "telegram", contact: "@voice_pro", status: "approved", authorId: 1, createdAt: "2 дня назад", category: "Аудио" },
  { id: 6, title: "Сделать логотип для кофейни", description: "Минималистичный логотип. Цвета: коричневый + бежевый. Форматы PNG и SVG.", price: 1500, platform: "telegram", contact: "@design_kate", status: "pending", authorId: 3, createdAt: "1 час назад", category: "Дизайн" },
  { id: 7, title: "Обработать 20 фотографий", description: "Ретушь портретных фото для интернет-магазина. Единый стиль, белый фон.", price: 700, platform: "whatsapp", contact: "+79001234567", status: "pending", authorId: 2, createdAt: "3 часа назад", category: "Фото" },
];

const PLATFORM_LABELS: Record<Platform, { label: string; icon: string; color: string }> = {
  telegram: { label: "Telegram", icon: "Send", color: "bg-blue-50 text-blue-600 border-blue-100" },
  whatsapp: { label: "WhatsApp", icon: "MessageCircle", color: "bg-green-50 text-green-600 border-green-100" },
  vk: { label: "ВКонтакте", icon: "Users", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  email: { label: "Email", icon: "Mail", color: "bg-orange-50 text-orange-600 border-orange-100" },
};

const CATEGORIES = ["Все", "Тексты", "Дизайн", "Таблицы", "Переводы", "Реклама", "Аудио", "Фото"];

type Page = "home" | "create" | "profile" | "moderation";

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(value) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TaskCard({ task, onContact }: { task: Task; onContact: (task: Task) => void }) {
  const pl = PLATFORM_LABELS[task.platform];
  return (
    <div className="card-stagger animate-fade-in bg-white rounded-2xl border border-border p-5 flex flex-col gap-3 hover:shadow-lg hover:shadow-green-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{task.category}</span>
          <h3 className="mt-2 text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{task.title}</h3>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-lg font-bold text-primary">{task.price.toLocaleString("ru")}₽</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{task.description}</p>

      <div className="flex items-center justify-between mt-1">
        <div className={`flex items-center gap-1.5 text-xs font-medium border rounded-full px-2.5 py-1 ${pl.color}`}>
          <Icon name={pl.icon} size={12} />
          <span>{pl.label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{task.createdAt}</span>
      </div>

      <Button
        onClick={() => onContact(task)}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium text-sm h-9 mt-1"
      >
        Откликнуться
      </Button>
    </div>
  );
}

function ContactModal({ task, onClose }: { task: Task | null; onClose: () => void }) {
  if (!task) return null;
  const pl = PLATFORM_LABELS[task.platform];
  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Контакт заказчика</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <p className="text-sm text-muted-foreground">{task.title}</p>
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${pl.color}`}>
            <Icon name={pl.icon} size={20} />
            <div>
              <p className="text-xs text-muted-foreground">{pl.label}</p>
              <p className="font-semibold text-sm">{task.contact}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">Напишите заказчику напрямую, представившись исполнителем с биржи</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HomePage({ tasks, onContact }: { tasks: Task[]; onContact: (t: Task) => void }) {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [sortBy, setSortBy] = useState<"new" | "price_asc" | "price_desc">("new");

  const approved = tasks.filter((t) => t.status === "approved");
  const filtered = activeCategory === "Все" ? approved : approved.filter((t) => t.category === activeCategory);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
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
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44 h-9 rounded-xl text-sm shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Сначала новые</SelectItem>
            <SelectItem value="price_asc">Дешевле</SelectItem>
            <SelectItem value="price_desc">Дороже</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Icon name="Search" size={40} className="mx-auto mb-3 opacity-30" />
          <p>Заданий в этой категории пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((task) => (
            <TaskCard key={task.id} task={task} onContact={onContact} />
          ))}
        </div>
      )}
    </div>
  );
}

function CreateTaskPage({ onTaskCreated }: { onTaskCreated: (task: Task) => void }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    platform: "" as Platform | "",
    contact: "",
    category: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.price || !form.platform || !form.contact || !form.category) return;
    const newTask: Task = {
      id: Date.now(),
      title: form.title,
      description: form.description,
      price: Number(form.price),
      platform: form.platform as Platform,
      contact: form.contact,
      status: "pending",
      authorId: 1,
      createdAt: "Только что",
      category: form.category,
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">Новое задание</h1>
        <p className="text-muted-foreground">Заполните форму — исполнители напишут вам напрямую</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-5 animate-fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Название задания</Label>
            <Input
              placeholder="Например: Написать 5 постов для Instagram"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Описание</Label>
            <Textarea
              placeholder="Опишите подробно что нужно сделать, в каком формате, какие требования..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-xl resize-none"
              rows={4}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Категория</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.filter((c) => c !== "Все").map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Оплата, ₽</Label>
            <Input
              type="number"
              placeholder="500"
              min="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">Платформа для связи</Label>
            <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v as Platform })}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Выберите платформу" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="vk">ВКонтакте</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">
              {form.platform === "telegram" ? "Username (@username)" : form.platform === "whatsapp" ? "Номер телефона" : form.platform === "vk" ? "Ссылка или ID" : form.platform === "email" ? "Email адрес" : "Контакт"}
            </Label>
            <Input
              placeholder={form.platform === "telegram" ? "@username" : form.platform === "whatsapp" ? "+79001234567" : form.platform === "vk" ? "id123456" : "your@email.ru"}
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="rounded-xl"
              required
            />
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">Задание будет опубликовано после проверки модератором</p>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 font-semibold text-sm">
            Отправить на модерацию
          </Button>
        </div>
      </form>
    </div>
  );
}

function ProfilePage() {
  const user = MOCK_USERS[0];
  const userTasks = MOCK_TASKS.filter((t) => t.authorId === user.id && t.status === "approved");

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6 animate-slide-up">
        <h1 className="text-3xl font-bold text-foreground mb-2">Профиль</h1>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 mb-6 animate-fade-in">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground mb-3">На бирже с {user.joinedAt}</p>
            <div className="flex items-center gap-2">
              <StarRating value={user.rating} />
              <span className="text-sm font-semibold">{user.rating}</span>
              <span className="text-sm text-muted-foreground">({user.reviewsCount} отзывов)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
          {[
            { label: "Заданий размещено", value: user.tasksPosted, icon: "FileText" },
            { label: "Заданий выполнено", value: user.tasksCompleted, icon: "CheckCircle" },
            { label: "Рейтинг", value: user.rating, icon: "Star" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 bg-muted rounded-xl">
              <Icon name={stat.icon} size={20} className="mx-auto mb-1.5 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
        <h3 className="font-semibold mb-4 text-foreground">Мои задания</h3>
        {userTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-border">
            <Icon name="FileText" size={32} className="mx-auto mb-2 opacity-30" />
            <p>Нет опубликованных заданий</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {userTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{task.createdAt} · {task.category}</p>
                </div>
                <span className="font-bold text-primary shrink-0">{task.price.toLocaleString("ru")}₽</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ModerationPage({ tasks, onApprove, onReject }: { tasks: Task[]; onApprove: (id: number) => void; onReject: (id: number) => void }) {
  const [keyInput, setKeyInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | "all">("pending");

  const handleKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput === MODERATION_KEY) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const statusBadge = (s: TaskStatus) => {
    const map = {
      pending: "bg-amber-50 text-amber-600 border-amber-100",
      approved: "bg-green-50 text-green-600 border-green-100",
      rejected: "bg-red-50 text-red-600 border-red-100",
    };
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
            <Input
              type="password"
              placeholder="Секретный ключ"
              value={keyInput}
              onChange={(e) => { setKeyInput(e.target.value); setError(false); }}
              className={`rounded-xl text-center ${error ? "border-destructive" : ""}`}
            />
            {error && <p className="text-xs text-destructive">Неверный ключ</p>}
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
              Войти
            </Button>
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
          <p className="text-muted-foreground text-sm">Всего заданий: {tasks.length} · На проверке: {tasks.filter((t) => t.status === "pending").length}</p>
        </div>
        <Button variant="outline" onClick={() => setUnlocked(false)} className="rounded-xl text-sm gap-2">
          <Icon name="Lock" size={14} />
          Выйти
        </Button>
      </div>

      <div className="flex gap-2 mb-5 animate-fade-in flex-wrap">
        {(["all", "pending", "approved", "rejected"] as const).map((f) => {
          const labels = { all: "Все", pending: "На проверке", approved: "Одобренные", rejected: "Отклонённые" };
          const counts = {
            all: tasks.length,
            pending: tasks.filter((t) => t.status === "pending").length,
            approved: tasks.filter((t) => t.status === "approved").length,
            rejected: tasks.filter((t) => t.status === "rejected").length,
          };
          return (
            <button key={f} onClick={() => setFilter(f)} className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>
              {labels[f]} <span className="opacity-70">({counts[f]})</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((task, i) => (
          <div key={task.id} className="animate-fade-in bg-white rounded-2xl border border-border p-5" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {statusBadge(task.status)}
                  <span className="text-xs text-muted-foreground">{task.createdAt}</span>
                </div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-sm font-bold text-primary">{task.price.toLocaleString("ru")}₽</span>
                  <span className="text-xs text-muted-foreground">{PLATFORM_LABELS[task.platform].label} · {task.contact}</span>
                  <Badge variant="secondary" className="text-xs">{task.category}</Badge>
                </div>
              </div>
              {task.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <Button onClick={() => onApprove(task.id)} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-1.5">
                    <Icon name="Check" size={14} />
                    Одобрить
                  </Button>
                  <Button onClick={() => onReject(task.id)} size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-red-50 rounded-xl gap-1.5">
                    <Icon name="X" size={14} />
                    Отклонить
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="CheckCircle" size={36} className="mx-auto mb-3 opacity-30" />
            <p>Нет заданий в этой категории</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Index() {
  const [page, setPage] = useState<Page>("home");
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [contactTask, setContactTask] = useState<Task | null>(null);

  const handleTaskCreated = (task: Task) => {
    setTasks((prev) => [task, ...prev]);
  };

  const handleApprove = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "approved" } : t)));
  };

  const handleReject = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: "rejected" } : t)));
  };

  const navItems: { key: Page; label: string; icon: string }[] = [
    { key: "home", label: "Биржа", icon: "LayoutGrid" },
    { key: "create", label: "Создать", icon: "Plus" },
    { key: "profile", label: "Профиль", icon: "User" },
  ];

  return (
    <div className="min-h-screen bg-background">
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
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  page === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon name={item.icon} size={14} />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => setPage("moderation")}
              className={`ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                page === "moderation"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon name="ShieldCheck" size={14} />
              <span className="hidden sm:inline">Модерация</span>
            </button>
          </nav>
        </div>
      </header>

      <main>
        {page === "home" && <HomePage tasks={tasks} onContact={setContactTask} />}
        {page === "create" && <CreateTaskPage onTaskCreated={(t) => { handleTaskCreated(t); setPage("home"); }} />}
        {page === "profile" && <ProfilePage />}
        {page === "moderation" && <ModerationPage tasks={tasks} onApprove={handleApprove} onReject={handleReject} />}
      </main>

      <ContactModal task={contactTask} onClose={() => setContactTask(null)} />
    </div>
  );
}
