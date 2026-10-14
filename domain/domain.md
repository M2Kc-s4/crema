# Домен «Крема» — инварианты и юзкейсы

## 1. Инварианты

Формат: **ID — константа — текст ошибки — где проверять**.
Текст ошибки — готовый для `new DomainError("...")`.

### 1.1. Общие value objects (`shared.ts`)

- **И-1** — `ErrEmptyName` — «Название не может быть пустым» — `Name()`
- **И-2** — `ErrNegativeAmount` — «Цена не может быть отрицательной» — `Price()`
- **И-3** — `ErrInvalidQty` — «Количество должно быть целым и больше нуля» — `Quantity()`

### 1.2. Продукт / Опция / Вариант

- **И-4** — `ErrUnknownCategory` — «Такой категории не существует» — `Category()`
- **И-5** — `ErrEmptyOption` — «У опции должен остаться хотя бы один вариант» — `Option()`, удаление варианта
- **И-6** — `ErrNegativePriceDelta` — «Наценка варианта не может быть отрицательной» — `Variant()`
- **И-7** — `ErrUnknownOption` — «Опция не найдена в продукте» — `getOption()`
- **И-8** — `ErrUnknownVariant` — «Вариант не найден в опции» — `getVariant()`

### 1.3. Ингредиент

- **И-9** — `ErrOutOfStock` — «Недостаточно ингридиента» — `IngredientStock()`, `consume()`
- **И-10** — `ErrUnknownIngredient` — «Ингредиент не найден» — сервис склада, `uses` вариантов

### 1.4. Корзина / CartItem

- **И-11** — `ErrInvalidQty` — «Количество должно быть целым и больше нуля» — `CartItem()`
- **И-12** — `ErrUnknownOption` — «Опция не найдена в продукте» — при валидации корзины
- **И-13** — `ErrUnknownVariant` — «Вариант не найден в опции» — при валидации корзины

### 1.5. Заказ

- **И-14** — `ErrEmptyOrder` — «Заказ не может быть пустым» — `Order()`
- **И-15** — `ErrProductMismatch` — «Позиция корзины относится к другому продукту» — `OrderItem()`
- **И-16** — `ErrPickupInPast` — «Время получения уже прошло» — `Order()` (когда добавим `pickupAt`)
- **И-17** — `ErrAlreadyIssued` — «Заказ уже выдан» — `issue()`, любая мутация после выдачи
- **И-18** — `ErrForbidden` — «У вас нет прав на это действие» — операции баристы/клиента
- **И-19** — `ErrInvalidCreatedAt` — «Время создания заказа не может быть в будущем» — `Order()`
- **И-20** — `ErrPriceChanged` — «Цена позиции изменилась с момента оформления» — внутренняя, не для вызывающего

### 1.6. Пользователь / сессия

- **И-21** — `ErrInvalidEmail` — «Невалидный формат почты» — `Email()`
- **И-22** — `ErrPasswordLength` — «Неверная длина пароля» — `PlainPassword()`
- **И-23** — `ErrUnknownRole` — «Такой роли не существует» — фабрики `Customer`/`Barman`
- **И-24** — `ErrBarmanCart` — «У баристы не может быть корзины» — `Barman()`
- **И-25** — `ErrInvalidRefreshToken` — «Недействительный refresh-токен» — `updateSessionToken()`
- **И-26** — `ErrStaleRefreshToken` — «Refresh-токен устарел» — `updateSessionToken()`

---

## 2. Юзкейсы

Формат каждого:
- **Актор**
- **Вход** (DTO)
- **Выход**
- **Шаги**
- **Инварианты** (ID из раздела 1)
- **Ошибки**
- **Побочные эффекты**

---

### UC-1. `AddToCart`

- **Актор:** customer
- **Вход:** `{ userId, productId, qty, options }`
- **Выход:** обновлённая корзина
- **Шаги:**
  1. Загрузить пользователя, проверить роль.
  2. Загрузить продукт.
  3. Провалидировать `options` через `resolveSelection(product, options)`.
  4. Собрать `CartItem(productId, Quantity(qty), options)`.
  5. `addToCart(user, cartItem)`.
  6. Сохранить пользователя.
- **Инварианты:** И-3, И-7, И-8, И-11, И-18
- **Ошибки:** `ErrForbidden`, `ErrUnknownOption`, `ErrUnknownVariant`, `ErrInvalidQty`
- **Побочные эффекты:** мутация `user.cart`

---

### UC-4. `ClearCart`

- **Актор:** customer
- **Вход:** `{ userId }`
- **Выход:** пустая корзина
- **Шаги:**
  1. Загрузить пользователя, проверить роль.
  2. `user.cart = []`.
  3. Сохранить.
- **Инварианты:** И-18
- **Ошибки:** `ErrForbidden`
- **Побочные эффекты:** мутация `user.cart`

---

### UC-5. `PlaceOrder`

- **Актор:** customer
- **Вход:** `{ userId, pickupAt }`
- **Выход:** созданный `Order`
- **Шаги:**
  1. Загрузить пользователя, проверить роль.
  2. Проверить, что корзина не пуста.
  3. Проверить, что `pickupAt` в будущем (когда добавим поле).
  4. Для каждой позиции корзины загрузить продукт, собрать `OrderItem(product, cartItem)`.
  5. `Order(userId, items)`.
  6. Очистить корзину.
  7. Сохранить заказ и пользователя.
- **Инварианты:** И-11, И-12, И-13, И-14, И-15, И-16, И-18
- **Ошибки:** `ErrForbidden`, `ErrEmptyOrder`, `ErrPickupInPast`, `ErrProductMismatch`, `ErrInvalidQty`, `ErrUnknownOption`, `ErrUnknownVariant`
- **Побочные эффекты:** создание `Order`, очистка корзины

---

### UC-7. `IssueOrder`

- **Актор:** barman
- **Вход:** `{ barmanId, orderId }`
- **Выход:** выданный заказ
- **Шаги:**
  1. Загрузить баристу, проверить роль.
  2. Загрузить заказ.
  3. `issue(order)`.
  4. Сохранить.
- **Инварианты:** И-17, И-18
- **Ошибки:** `ErrForbidden`, `ErrAlreadyIssued`
- **Побочные эффекты:** `order.status = "issued"`

---

### UC-8. `RestockIngredient`

- **Актор:** barman
- **Вход:** `{ barmanId, ingredientId, amount }`
- **Выход:** обновлённый ингредиент
- **Шаги:**
  1. Загрузить баристу, проверить роль.
  2. Загрузить ингредиент.
  3. `restock(ingredient, IngredientStock(amount))`.
  4. Сохранить.
- **Инварианты:** И-9, И-18
- **Ошибки:** `ErrForbidden`, `ErrOutOfStock`
- **Побочные эффекты:** мутация `ingredient.stock`

---

### UC-9. `ToggleProductAvailability`

- **Актор:** barman
- **Вход:** `{ barmanId, productId }`
- **Выход:** обновлённый продукт
- **Шаги:**
  1. Загрузить баристу, проверить роль.
  2. Загрузить продукт.
  3. Переключить флаг `stop`.
  4. Сохранить.
- **Инварианты:** И-18
- **Ошибки:** `ErrForbidden`
- **Побочные эффекты:** флаг `stop` продукта

---

### UC-10. `CreateProduct`

- **Актор:** barman
- **Вход:** `{ barmanId, name, price, category, options }`
- **Выход:** созданный `Product`
- **Шаги:**
  1. Загрузить баристу, проверить роль.
  2. `Name(name)`, `Price(price)`, `Category(category)`.
  3. Провалидировать опции (каждая — `Option` с непустым списком вариантов).
  4. `Product(...)`.
  5. Сохранить.
- **Инварианты:** И-1, И-2, И-4, И-5, И-6, И-18
- **Ошибки:** `ErrForbidden`, `ErrEmptyName`, `ErrNegativeAmount`, `ErrUnknownCategory`, `ErrEmptyOption`, `ErrNegativePriceDelta`
- **Побочные эффекты:** создание продукта

---

### UC-11. `Register`

- **Актор:** анонимный
- **Вход:** `{ email, password, role }`
- **Выход:** созданный `User`
- **Шаги:**
  1. `Email(email)`, `PlainPassword(password)`.
  2. Захешировать пароль → `HashedPassword`.
  3. В зависимости от `role` — `Customer(...)` или `Barman(...)`.
  4. Сохранить.
- **Инварианты:** И-21, И-22, И-23, И-24
- **Ошибки:** `ErrInvalidEmail`, `ErrPasswordLength`, `ErrUnknownRole`, `ErrBarmanCart`
- **Побочные эффекты:** создание пользователя

---

### UC-12. `Login`

- **Актор:** анонимный
- **Вход:** `{ email, password }`
- **Выход:** `{ accessToken, refreshToken }`
- **Шаги:**
  1. `Email(email)`, `PlainPassword(password)`.
  2. Найти пользователя, сверить хеш.
  3. `Session(userId)`.
  4. Сгенерировать токены, `updateSessionToken(session, refreshToken)`.
  5. Сохранить сессию.
- **Инварианты:** И-21, И-22, И-25
- **Ошибки:** `ErrInvalidEmail`, `ErrPasswordLength`, `ErrInvalidRefreshToken`
- **Побочные эффекты:** создание сессии

---

### UC-13. `RefreshSession`

- **Актор:** customer / barman
- **Вход:** `{ refreshToken }`
- **Выход:** новые `accessToken` / `refreshToken`
- **Шаги:**
  1. Найти сессию по `refreshToken`.
  2. Проверить, что токен актуален.
  3. Сгенерировать новый refresh, `updateSessionToken(session, newToken)`.
  4. Сохранить.
- **Инварианты:** И-25, И-26
- **Ошибки:** `ErrInvalidRefreshToken`, `ErrStaleRefreshToken`
- **Побочные эффекты:** ротация refresh-токена

---

### UC-14. `Logout`

- **Актор:** customer / barman
- **Вход:** `{ sessionId }`
- **Выход:** —
- **Шаги:**
  1. Загрузить сессию.
  2. `updateSessionToken(session, null)`.
  3. Сохранить.
- **Инварианты:** И-25
- **Ошибки:** `ErrInvalidRefreshToken`
- **Побочные эффекты:** сессия без refresh

---

