# Крема: наброски предметной области

Черновик для обсуждения. Всё, что помечено «решить», это развилки, которые выбираешь ты.

## 1. Сущности и связи

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    CATEGORY ||--o{ PRODUCT : groups
    PRODUCT ||--o{ PRODUCT_OPTION_GROUP : offers
    OPTION_GROUP ||--o{ PRODUCT_OPTION_GROUP : used_in
    OPTION_GROUP ||--|{ OPTION : contains
    PRODUCT ||--o{ RECIPE_LINE : needs
    OPTION ||--o{ OPTION_USAGE : consumes
    INGREDIENT ||--o{ RECIPE_LINE : used_in
    INGREDIENT ||--o{ OPTION_USAGE : used_in
    INGREDIENT ||--o{ STOCK_MOVEMENT : changes
    ORDER ||--|{ ORDER_ITEM : contains
    ORDER ||--o{ STOCK_MOVEMENT : causes

    USER {
        int id PK
        string email UK
        string password_hash
        string name
        string role "client | barista"
        int bonus_stamps "счётчик до бесплатного напитка"
        jsonb cart "массив CartItem (value object)"
    }
    CATEGORY {
        int id PK
        string name
        int sort_order
    }
    PRODUCT {
        int id PK
        int category_id FK
        string name
        string description
        numeric base_price
        boolean is_hidden "скрыто бариста вручную"
    }
    OPTION_GROUP {
        int id PK
        string name "Размер, Молоко, Добавки"
        boolean is_required
        boolean is_multiple
    }
    OPTION {
        int id PK
        int group_id FK
        string name
        numeric price_delta
    }
    PRODUCT_OPTION_GROUP {
        int product_id FK
        int group_id FK
    }
    INGREDIENT {
        int id PK
        string name
        string unit
        numeric quantity "текущий остаток"
        numeric low_threshold
    }
    RECIPE_LINE {
        int product_id FK
        int ingredient_id FK
        numeric amount "расход на одну порцию"
    }
    OPTION_USAGE {
        int option_id FK
        int ingredient_id FK
        numeric amount "например, овсяное молоко вместо обычного"
    }
    ORDER {
        int id PK
        int user_id FK
        string status "см. раздел 3"
        timestamptz pickup_at
        numeric total "фиксируется при оформлении"
        timestamptz created_at
    }
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        string name_snapshot
        numeric unit_price_snapshot
        int qty
        jsonb options_snapshot
    }
    STOCK_MOVEMENT {
        int id PK
        int ingredient_id FK
        numeric delta "минус при списании, плюс при поставке"
        string reason "supply | order | correction"
        int order_id FK "только для reason = order"
        timestamptz created_at
    }
```

Что здесь не таблица:

- **CartItem** (продукт, выбранные опции, количество) лежит в `users.cart` как массив объектов. Цены в нём нет: она считается по текущему каталогу.
- **Доступность позиции** не хранится. Позиция недоступна, если скрыта вручную (`is_hidden`) или если для рецепта не хватает хотя бы одного ингредиента. Это считается запросом при чтении меню.

## 2. Агрегаты и их правила

| Агрегат | Состав | Правило, которое он защищает |
|---|---|---|
| **User** | поля пользователя, корзина (массив VO `CartItem`), `bonus_stamps` | позиции с одинаковым продуктом и опциями сливаются; бонусы только растут при выдаче заказа и обнуляются при использовании |
| **Order** | заказ и его `OrderItem` | статус двигается только по цепочке; итог равен сумме позиций; цены и названия фиксируются при оформлении |
| **Ingredient** | ингредиент и его остаток | остаток не уходит в минус; каждое изменение записывается в `StockMovement` |
| **Product** (каталог) | продукт, его опции и рецепт | у обязательной группы опций всегда есть значение по умолчанию |

Value objects: `CartItem`, `Options` (выбранные размер, молоко, доп. шот), деньги, интервал времени получения. Категории и группы опций это справочники, и отдельных агрегатов для них заводить не нужно.

**Один сценарий затрагивает два агрегата.** Когда бариста берёт заказ в работу, нужно сменить статус (`Order`) и списать ингредиенты (`Ingredient`). В монолите с одной БД это делает сервис приложения в одной транзакции (`pool.begin`). Агрегаты при этом друг на друга не ссылаются: сервис загружает оба и вызывает методы каждого.

## 3. Статусы заказа

```mermaid
stateDiagram-v2
    [*] --> new: клиент оформил
    new --> preparing: бариста начал готовить
    preparing --> ready: бариста закончил
    ready --> issued: бариста выдал
    new --> cancelled: клиент или бариста
    preparing --> cancelled: только бариста
    issued --> [*]
    cancelled --> [*]
```

| Переход | Кто | Побочный эффект |
|---|---|---|
| `new → preparing` | бариста | списание ингредиентов (решить: здесь или при оформлении) |
| `ready → issued` | бариста | +1 к `bonus_stamps` клиента, бесплатный напиток на каждый десятый |
| `new → cancelled` | клиент, бариста | ничего не списывалось, возвращать нечего |
| `preparing → cancelled` | только бариста | вернуть списанное через `StockMovement` (решить: возвращать или считать потерей) |

Соответствие с экранами: «Принят» у клиента это `new`, колонки очереди бариста это `new`, `preparing` и `ready`.

## 4. Решить самому

1. **Когда списывать остатки.** При оформлении (резерв, но тогда отмена должна возвращать), при начале приготовления (проще, но два клиента могут заказать последнюю порцию молока) или при выдаче (самое позднее, неудобно для стоп-листа).
2. **Бонус за отменённые заказы.** По схеме выше бонус начисляется только при выдаче, и отмена его не трогает. Бесплатный напиток помечается в заказе: нужна ли для него отдельная позиция или скидка на одну позицию.
3. **Время получения.** Что делать, если выбранное время уже прошло, а заказ в статусе `new`: напоминание бариста или автоотмена.
4. **Что считать «закончился ингредиент».** Ровно ноль или ниже порога `low_threshold`.
5. **Уведомления бариста.** Новые заказы приходят на экран очереди через `NOTIFY` и `Listener` (то, ради чего писался `Listener`) или обычным опросом раз в несколько секунд.

## 5. Минимальный набор для старта

Если нужно уложиться в срок, достаточно: `User`, `Category`, `Product`, `Option` с группами, `Order` с позициями и `Ingredient` с `StockMovement`. Рецепты и `OPTION_USAGE` (расход ингредиентов по опциям) можно добавить вторым этапом, а в первом считать, что напиток списывает фиксированный набор ингредиентов.