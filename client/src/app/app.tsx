import './style.css'

export function Apps() {
    return (
        <>
            <button></button>
        </>
    )
}


import { useState } from "react"


type Screen = "login" | "menu" | "cart" | "track" | "queue" | "stock"
type Product = { id: number; name: string; note: string; price: number; cat: string; tone: string; stop?: boolean }
type Line = { name: string; opts: string; price: number; qty: number }
type Ticket = { id: number; who: string; at: string; items: string[]; stage: 0 | 1 | 2 }

const PRODUCTS: Product[] = [
  { id: 1, name: "Флэт уайт", note: "Двойной эспрессо, плотная молочная пена", price: 230, cat: "Кофе", tone: "#8A5A3C" },
  { id: 2, name: "Капучино", note: "Классика: треть эспрессо, треть молока, треть пены", price: 210, cat: "Кофе", tone: "#B88A5E" },
  { id: 3, name: "Раф ванильный", note: "Сливки, ванильный сахар, эспрессо", price: 290, cat: "Кофе", tone: "#D2B48C" },
  { id: 4, name: "Колд брю", note: "Настаивается 16 часов, подаётся со льдом", price: 260, cat: "Холодное", tone: "#4A2E22" },
  { id: 5, name: "Бамбл", note: "Эспрессо, апельсиновый сок, лёд", price: 270, cat: "Холодное", tone: "#C9964F", stop: true },
  { id: 6, name: "Круассан с миндалём", note: "Выпекается утром, остаётся до вечера", price: 190, cat: "Выпечка", tone: "#E0B87A" },
  { id: 7, name: "Чизкейк баскский", note: "Карамельная корочка, нежный центр", price: 280, cat: "Выпечка", tone: "#A06A3A" },
]
const CATS = ["Кофе", "Холодное", "Выпечка"]
const SIZES = [["S, 250 мл", 0], ["M, 350 мл", 40], ["L, 450 мл", 80]] as const
const MILK = [["Обычное", 0], ["Овсяное", 50], ["Миндальное", 50]] as const
const STEPS = ["Принят", "Готовится", "Готов", "Выдан"]
const TICKETS: Ticket[] = [
  { id: 118, who: "Анна", at: "14:30", items: ["Капучино M, овсяное", "Круассан с миндалём"], stage: 0 },
  { id: 119, who: "Игорь", at: "14:40", items: ["Колд брю L"], stage: 0 },
  { id: 117, who: "Мария", at: "14:25", items: ["Флэт уайт M", "Раф ванильный S"], stage: 1 },
  { id: 116, who: "Олег", at: "14:20", items: ["Капучино S"], stage: 2 },
]
const STOCK = [["Зерно, кг", 3.2, 10], ["Молоко, л", 14, 30], ["Овсяное молоко, л", 1.5, 10], ["Сироп ванильный, л", 0.4, 3], ["Апельсиновый сок, л", 0, 6]] as const

export function App() {
  const [screen, setScreen] = useState<Screen>("menu")
  const [cat, setCat] = useState("Кофе")
  const [pick, setPick] = useState<Product | null>(null)
  const [lead, setLead] = useState(20)
  const [cart] = useState<Line[]>([
    { name: "Капучино", opts: "M, овсяное молоко", price: 260, qty: 1 },
    { name: "Круассан с миндалём", opts: "", price: 190, qty: 2 },
  ])
  const [tickets, setTickets] = useState(TICKETS)

  const barista = screen === "queue" || screen === "stock"
  const sum = cart.reduce((s, l) => s + l.price * l.qty, 0)
  const advance = (id: number) => setTickets(t => t.map(x => x.id === id ? { ...x, stage: Math.min(2, x.stage + 1) as Ticket["stage"] } : x))

  return (
    <div className="cr">
      {/* переключатель экранов только для просмотра макета */}
      <div className="demo">
        {(["login", "menu", "cart", "track", "queue", "stock"] as Screen[]).map(s =>
          <button key={s} className={s === screen ? "on" : ""} onClick={() => setScreen(s)}>{s}</button>)}
      </div>

      {screen !== "login" && (
        <header className="top">
          <b>Крема</b>
          {barista ? <>
            <a onClick={() => setScreen("queue")}>Очередь</a>
            <a onClick={() => setScreen("stock")}>Меню и остатки</a>
          </> : <>
            <a onClick={() => setScreen("menu")}>Меню</a>
            <a onClick={() => setScreen("track")}>Мой заказ</a>
            <a onClick={() => setScreen("cart")}>Корзина (3)</a>
          </>}
          <a onClick={() => setScreen("login")}>Выйти</a>
        </header>
      )}

      {/* ВХОД */}
      {screen === "login" && (
        <div className="login">
          <h1>Войти в Крему</h1>
          <p className="muted">Заказывайте заранее и забирайте без очереди.</p>
          <input placeholder="Электронная почта" />
          <input placeholder="Пароль" type="password" />
          <span className="err">Неверная почта или пароль. Проверьте данные и попробуйте снова.</span>
          <button className="btn" onClick={() => setScreen("menu")}>Войти</button>
          <button className="btn ghost">Создать аккаунт</button>
        </div>
      )}

      {/* МЕНЮ КЛИЕНТА */}
      {screen === "menu" && <>
        <section className="hero"><div>
          <h1>Заберите кофе в 14:30, пока он ещё горячий</h1>
          <p>Выберите, через сколько зайдёте. Бариста начнёт готовить к этому времени.</p>
          <div className="chips">
            {[10, 20, 30, 45].map(m =>
              <button key={m} className={"chip" + (m === lead ? " on" : "")} onClick={() => setLead(m)}>Через {m} мин</button>)}
          </div>
        </div></section>
        <main className="wrap">
          <nav className="tabs">
            {CATS.map(c => <button key={c} className={c === cat ? "on" : ""} onClick={() => setCat(c)}>{c}</button>)}
          </nav>
          <div className="grid">
            {PRODUCTS.filter(p => p.cat === cat).map(p => (
              <button key={p.id} className={"card" + (p.stop ? " stop" : "")} disabled={p.stop} onClick={() => setPick(p)}>
                <div className="disc" style={{ background: `radial-gradient(circle at 35% 30%, #F3E9DC 0 12%, ${p.tone} 55%)` }} />
                <h3>{p.name}</h3>
                <span className="muted">{p.note}</span>
                <span className="price">{p.stop ? "Закончилось на сегодня" : `от ${p.price} ₽`}</span>
              </button>
            ))}
          </div>
        </main>

        {pick && (
          <div className="veil" onClick={() => setPick(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>{pick.name}</h2>
              <b>Размер</b>
              {SIZES.map(([n, d], i) => <button key={n} className={"opt" + (i === 1 ? " on" : "")}><span>{n}</span><span>{d ? `+${d} ₽` : "включено"}</span></button>)}
              <b>Молоко</b>
              {MILK.map(([n, d], i) => <button key={n} className={"opt" + (i === 0 ? " on" : "")}><span>{n}</span><span>{d ? `+${d} ₽` : "включено"}</span></button>)}
              <button className="opt"><span>Дополнительный шот</span><span>+60 ₽</span></button>
              <button className="btn gold" onClick={() => setPick(null)}>Добавить в корзину за {pick.price + 40} ₽</button>
            </div>
          </div>
        )}
      </>}

      {/* КОРЗИНА */}
      {screen === "cart" && (
        <main className="wrap">
          <h1>Ваш заказ</h1>
          <div className="panel" style={{ marginTop: 20 }}>
            {cart.map(l => (
              <div className="row" key={l.name}>
                <div><b>{l.name}</b><div className="muted">{l.opts || "Без добавок"}</div></div>
                <span>{l.qty} × {l.price} ₽</span>
                <button className="btn ghost sm">Убрать</button>
              </div>
            ))}
            <div className="row">
              <span>Заберу</span>
              <div className="chips">
                {[10, 20, 30].map(m => <button key={m} className={"chip" + (m === lead ? " on" : "")} style={{ color: "inherit", borderColor: "var(--mocha)" }} onClick={() => setLead(m)}>Через {m} мин</button>)}
              </div>
            </div>
            <div className="row" style={{ border: 0 }}>
              <span className="total">Итого {sum} ₽</span>
              <button className="btn gold" onClick={() => setScreen("track")}>Оформить заказ</button>
            </div>
            <p className="muted">Каждый десятый напиток бесплатно. До бонуса осталось 4 напитка.</p>
          </div>
        </main>
      )}

      {/* СТАТУС ЗАКАЗА */}
      {screen === "track" && (
        <main className="wrap">
          <h1>Заказ № 118 будет готов к 14:30</h1>
          <div className="steps">
            {STEPS.map((s, i) => <div key={s} className={"step" + (i < 1 ? " done" : i === 1 ? " now" : "")}><i />{s}</div>)}
          </div>
          <div className="panel">
            <div className="row"><span>Капучино M, овсяное молоко</span><span>260 ₽</span></div>
            <div className="row"><span>Круассан с миндалём × 2</span><span>380 ₽</span></div>
            <div className="row" style={{ border: 0 }}><button className="btn ghost">Отменить заказ</button><span className="muted">Отмена доступна, пока заказ не готовится</span></div>
          </div>
        </main>
      )}

      {/* ОЧЕРЕДЬ БАРИСТА */}
      {screen === "queue" && (
        <main className="wrap">
          <h1>Очередь на сейчас</h1>
          <div className="cols" style={{ marginTop: 20 }}>
            {["Новые", "Готовятся", "Готовы к выдаче"].map((title, stage) => (
              <section className="col" key={title}>
                <h3>{title}</h3>
                {tickets.filter(t => t.stage === stage).sort((a, b) => a.at.localeCompare(b.at)).map(t => (
                  <article key={t.id} className={"tk" + (t.at < "14:25" ? " late" : "")}>
                    <div className="row" style={{ padding: 0, border: 0 }}><b>№ {t.id}, {t.who}</b><span>к {t.at}</span></div>
                    {t.items.map(i => <span key={i} className="muted">{i}</span>)}
                    <button className="btn sm" onClick={() => advance(t.id)}>{["Начать готовить", "Готово", "Выдать"][stage]}</button>
                  </article>
                ))}
              </section>
            ))}
          </div>
        </main>
      )}

      {/* МЕНЮ И ОСТАТКИ */}
      {screen === "stock" && (
        <main className="wrap">
          <h1>Меню и остатки</h1>
          <div className="cols" style={{ marginTop: 20 }}>
            <section className="panel">
              <h3>Остатки</h3>
              {STOCK.map(([n, have, full]) => (
                <div className="row" key={n}>
                  <span>{n}</span>
                  <div className={"meter" + (have / full < 0.2 ? " low" : "")}><span style={{ width: `${(have / full) * 100}%` }} /></div>
                  <b>{have}</b>
                </div>
              ))}
              <button className="btn gold" style={{ marginTop: 16 }}>Записать поставку</button>
            </section>
            <section className="panel">
              <h3>Позиции</h3>
              {PRODUCTS.map(p => (
                <div className="row" key={p.id}>
                  <span>{p.name}<div className="muted">{p.price} ₽</div></span>
                  <button className={"btn sm" + (p.stop ? "" : " ghost")}>{p.stop ? "Вернуть в меню" : "Убрать из меню"}</button>
                </div>
              ))}
              <button className="btn ghost" style={{ marginTop: 16 }}>Новая позиция</button>
            </section>
          </div>
        </main>
      )}
    </div>
  )
}
