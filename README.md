## State Management — Signal vs Observable

Servislerde hangi durumda `signal`, hangi durumda `Observable` kullanıldığını açıklayan kural:

| Metod | Türü | Yaklaşım |
|-------|------|----------|
| `loadCategories()` | Paylaşılan liste state | Signal ✅ |
| `getCategoryDetails()` | Tek seferlik fetch (dialog açılınca) | Observable ✅ |
| `createCategory()` | Mutation | Observable ✅ |
| `editCategory()` | Mutation | Observable ✅ |
| `deleteCategory()` | Mutation | Observable ✅ |

**Kural:**
- Birden fazla bileşenin okuyabileceği, zaman içinde değişen, persist olan veri → **Signal**
- Bir kullanıcı aksiyonuna bağlı, tek seferlik, geçici sonuç → **Observable**

Mutation metodları (`create`, `edit`, `delete`) Observable döner. Caller `subscribe({ next, error })` ile sonucu handle eder, ardından `loadCategories()` çağrısı tetiklenerek asıl state güncellenir.
