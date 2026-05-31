# Báo Cáo Bàn Giao Sản Phẩm (PDE)
**Ha Long Luxury Travel Platform — luxury-travel-next**
**Ngày bàn giao:** 25/05/2026

---

## Tổng quan 3 module bàn giao

| # | Module | URL | Trạng thái |
|---|--------|-----|------------|
| 01 | **ALL STYLES** — Hệ thống phong cách du lịch | `/travel-styles/` + `/travel-styles/[slug]/` | ✅ Hoàn thành |
| 02 | **SIM CARD 5G** — Mua eSIM & SIM vật lý | `/sim-card/` + `/sim-card/[slug]/` + đặt hàng | ✅ Hoàn thành |
| 03 | **ASIA VISA** — Đăng ký visa điện tử | `/visa/` | ✅ Hoàn thành |

---

---

# MODULE 01 — ALL STYLES (Travel Styles)

## 1.1. Mô tả tổng quan

Hệ thống "All Styles" là tập hợp **20 phong cách du lịch** do Ha Long Luxury xây dựng, cho phép khách hàng khám phá và lựa chọn kiểu hành trình phù hợp với cá nhân. Hệ thống gồm 3 tầng:

1. **Mega-menu trên thanh điều hướng** — dropdown "ALL STYLES" xuất hiện khi hover
2. **Trang danh mục `/travel-styles/`** — toàn bộ 20 phong cách với tìm kiếm & lọc
3. **Trang chi tiết `/travel-styles/[slug]/`** — thông tin đầy đủ của từng phong cách

---

## 1.2. Mega-Menu "ALL STYLES" (Navigation Header)

### Cách hoạt động
- Khi hover vào "ALL STYLES" trên thanh nav → dropdown toàn màn hình mở ra mượt mà với animation `fade + slide-up`
- Hiển thị **3 nhóm phong cách** side by side, mỗi nhóm có ảnh thumbnail + danh sách tour types

### 3 nhóm Tour Formats trong dropdown

| Nhóm | Tag | Tiêu đề | Subtitle | Tour Types |
|------|-----|---------|---------|------------|
| **01** | 2 – 24 hrs | Stopover Tours | City layovers & transit escapes | City Breaks, Culture & Heritage, Culinary Journeys, Photography Trips, Celebration Trips, Rail Journeys, Multi Country |
| **02** | Full day | Day Trips | One perfect day on the water | Cruise Voyages, Waterfall Retreats, Adventure Vacations, Wildlife & Safari, Diving & Marine, Mountain Retreats, Family Holidays |
| **03** | Multi-day | Golf Tours | Finest courses across Asia | Golf Holidays, Luxury Stays, Island Villas, Beach Escapes, Honeymoon, Wellness & Spa |

### Tính năng hover ảnh (Thumbnail Preview)
Mỗi cột có ảnh thumbnail ở trên cùng. Khi di chuột vào từng tour type trong danh sách:
- Ảnh thumbnail tự động chuyển sang ảnh đại diện của tour type đó
- Transition mượt `opacity + scale` 200ms
- Khi rời chuột → trở về ảnh mặc định của nhóm
- Ảnh được preload ngay khi hover để không bị lag

### Thiết kế visual (mỗi cột)
- **Thumbnail:** chiều cao `clamp(180px, 25vh, 330px)`, góc bo `clamp(12px,1vw,18px)`, shadow lớn
- **Overlay gradient:** `from-[#0a1628]/68` phủ lên ảnh từ dưới lên
- **Badge tag:** pill nhỏ góc dưới trái — "2 – 24 HRS" / "FULL DAY" / "MULTI-DAY" — nền navy mờ, chữ gold
- **Số thứ tự:** Cormorant Garamond serif `clamp(2.7rem,3.15vw,4.4rem)`, màu gold nhạt
- **Tiêu đề nhóm:** Cormorant Garamond `clamp(1.9rem,2.25vw,3rem)`, màu navy
- **Subtitle:** Jost uppercase tracking wide, màu gold-dark
- **Divider:** gradient từ gold → transparent

### Hover effect trên từng tour item
- Hover → item nâng lên `-translate-y-0.5`, nền trắng mờ `bg-white/48`, shadow nhẹ
- Thanh vàng bên trái `w-[3px]` xuất hiện từ trên xuống `scale-y-0 → scale-y-100`
- Dấu chấm bullet pulse to lên + đổi màu navy với ring vàng
- Tên tour dịch phải `translate-x-1`
- Badge số ngày (ví dụ "3 TO 6 DAYS") dịch trái

### Panel "Other Services" trong cùng dropdown
Bên phải dropdown còn có panel "OTHER SERVICES" liệt kê thêm dịch vụ:
- Car Rental
- Bus & Train Ticket
- **Sim Card 5G** → dẫn đến `/sim-card/`
- **Asia Visa** → dẫn đến `/visa/`
- Bike & Motorbike Rental

---

## 1.3. Trang Danh mục `/travel-styles/`

### Hero Section
- Ảnh nền toàn màn hình với overlay gradient 2 chiều (ngang + dọc)
- Eyebrow badge: uppercase gold
- Tiêu đề H1: `clamp(40px,5vw,72px)`, font weight 900, letter-spacing `-0.07em`
- Mô tả lead: 2 dòng giới thiệu số phong cách (thay thế `{count}` = 20)
- 2 badge pill: "20 TRAVEL STYLES" + "PRIVATE JOURNEYS"

### Thanh tìm kiếm & lọc (Refine Panel)
Panel nổi `-mt-[64px]` chồng lên phần hero, bo góc `38px`, shadow đậm.

**Search box:**
- Input full-width, chiều cao `68px`, bo góc pill
- Placeholder: "Search mood, family, cruise..."
- Focus state: border gold + glow ring `rgba(200,169,106,0.12)`

**Filter buttons (11 tabs):**

| Tab | Từ khóa lọc |
|-----|------------|
| All styles | Tất cả |
| Luxury | luxury, villa, golf, premium... |
| Romantic | honeymoon, celebration, romantic... |
| Family | family, kid, safe, relaxed |
| Culture | culture, heritage, culinary, rail... |
| Adventure | adventure, mountain, safari, diving... |
| Water | beach, island, cruise, ocean, marine... |
| City | city, urban, break |
| Wellness | wellness, spa, retreat |
| Nature | nature, waterfall, wildlife, forest... |
| Multi-city | multi country, borders, indochina... |

Active tab: navy background + ivory text + inset border ring
Inactive tab: white/transparent, hover → gold border

**Live count:** Hiển thị số phong cách đang khớp (ví dụ "7 styles found")

---

## 1.4. Grid kết quả — Style Cards

Mỗi card hiển thị:
- Ảnh 4K toàn diện, object-cover, hover zoom nhẹ `scale(1.035)` 600ms
- **Gradient overlay** từ dưới lên: navy → transparent
- **Tags phân loại** (tối đa 2): pill nhỏ màu theo category (Luxury=vàng, Romantic=đỏ hồng, Adventure=xanh lá, v.v.)
- **Số thứ tự** (01–20): Cormorant serif nhỏ góc trên trái
- **Eyebrow:** uppercase gold nhỏ
- **Tên phong cách:** Playfair Display hoặc serif lớn, màu ivory
- **Mô tả ngắn:** 1–2 câu, màu ivory/82
- **Thời gian:** badge "7 TO 12 DAYS"
- **Nút "Explore":** góc dưới phải, ArrowUpRight icon

Hover cả card: nâng lên `-translate-y-1`, shadow lớn hơn, nút hiện rõ hơn.

---

## 1.5. Trang chi tiết `/travel-styles/[slug]/`

20 trang chi tiết, mỗi trang được generate tự động từ slug của tên phong cách.

**Cấu trúc trang:**
1. **Hero full-screen** — ảnh 4K + tên phong cách + eyebrow + thống kê (điểm đến, giá từ, số khách, nhịp độ)
2. **Breadcrumb navigation** — quay lại trang All Styles
3. **Experience lead** — mô tả trải nghiệm sâu
4. **Features grid** — 3 điểm nổi bật của phong cách này
5. **Sample Journey** — lịch trình mẫu theo ngày (Day 1, Day 2, ...)
6. **What's Included** — danh sách dịch vụ bao gồm
7. **Signature Hotels** — 2–3 khách sạn gợi ý
8. **Tour Carousel** — các tour thực tế theo phong cách này (từ CMS)
9. **Sidebar CTA** — "Design This Journey" dẫn đến `/customize-your-trip/`
10. **Related Styles** — 4 phong cách liên quan

**SEO:** Mỗi trang có `generateMetadata()` riêng với canonical URL, OG tags.

---

## 1.6. Danh sách 20 phong cách du lịch

| # | Phong cách | Eyebrow | Thời gian | Mood |
|---|-----------|---------|-----------|------|
| 01 | Beach Escapes | Ocean calm | 7–12 days | Restful and warm |
| 02 | Island Villas | Private hideaway | 5–10 days | Secluded luxury |
| 03 | Honeymoon | Romantic coast | 8–14 days | Intimate and calm |
| 04 | Luxury Stays | Signature hotels | Flexible | Polished comfort |
| 05 | Culture & Heritage | Living history | 9–16 days | Deep discovery |
| 06 | Adventure Vacations | Soft adventure | 8–15 days | Active but refined |
| 07 | Waterfall Retreats | Nature reset | 4–8 days | Fresh and slow |
| 08 | Culinary Journeys | Taste led | 6–12 days | Flavor and story |
| 09 | Family Holidays | Easy rhythm | 7–13 days | Relaxed and safe |
| 10 | Wellness & Spa | Quiet recovery | 4–10 days | Restorative |
| 11 | Wildlife & Safari | Wild places | 6–12 days | Rare and alive |
| 12 | Cruise Voyages | By water | 2–7 days | Slow horizon |
| 13 | Photography Trips | Frame the route | 7–14 days | Visual and patient |
| 14 | Celebration Trips | Milestone travel | Flexible | Personal and joyful |
| 15 | Mountain Retreats | Highland air | 5–11 days | Clear and cool |
| 16 | City Breaks | Urban polish | 3–6 days | Sharp and lively |
| 17 | Rail Journeys | Scenic slow travel | 6–12 days | Measured and scenic |
| 18 | Diving & Marine | Blue world | 5–10 days | Bright and weightless |
| 19 | Golf Holidays | Fairway days | 4–9 days | Leisurely precision |
| 20 | Multi Country | Seamless borders | 10–21 days | Connected and easy |

---

---

# MODULE 02 — SIM CARD 5G & eSIM

## 2.1. Mô tả tổng quan

Hệ thống mua SIM card vật lý và eSIM du lịch. Tích hợp **180 sản phẩm** từ Klook với đầy đủ gói cước, trang chi tiết, bộ lọc và luồng đặt hàng hoàn chỉnh.

**Cấu trúc:**
```
/sim-card/                    → Catalog (danh sách + tìm kiếm + phân trang)
/sim-card/[slug]/             → Chi tiết sản phẩm (9 sections)
/sim-card/[slug]/book/        → Form đặt hàng
/api/sim-order/               → API xử lý + gửi email
```

---

## 2.2. Trang Catalog `/sim-card/`

### Tìm kiếm & Lọc
- **Search box:** Tìm theo tên sản phẩm hoặc quốc gia — real-time, không reload trang
- **Tab lọc:** All / eSIM / SIM Card / 5G / 4G
- Khi đổi filter hoặc search → reset về trang 1 tự động

### Mỗi product card hiển thị
- Ảnh quốc gia (từ Klook image key)
- Tên sản phẩm
- Badge loại: eSIM (màu gold) / SIM (màu navy)
- Tốc độ mạng (5G / 4G LTE)
- Giá từ (USD)
- Số lượt đặt
- Điểm đánh giá + số review
- Nút "View Plans" → trang chi tiết

### Phân trang (Pagination)
**Thiết kế mới — lớn hơn, thoáng hơn:**
- **10 sản phẩm / trang**
- Container: pill `border-radius: 32px`, border gold mờ, shadow `0 24px 64px rgba(11,27,43,0.11)`
- Nút Prev/Next: `50×50px`, bo góc `14px`, nền ivory `#faf7f1`
- Nút số trang: `50×50px`, bo góc `14px`
  - Active: nền gold `#C8A96A`, chữ navy, shadow vàng `0 12px 28px rgba(200,169,106,0.32)`
  - Inactive: nền trắng, chữ navy/55, border champagne
- Ellipsis `···`: khi tổng trang > 7, hiển thị giữa các số xa
- Spacing: `gap: 10px`, padding `18px 24px`

---

## 2.3. Trang Chi tiết `/sim-card/[slug]/`

### Thông tin sản phẩm (header)
- Tên sản phẩm đầy đủ
- Điểm đánh giá + số review (ví dụ: ⭐ 4.9 · 2,400+ reviews)
- Số lượt đặt mua (hiển thị compact: 1K+, 2K+)
- Badge: tốc độ 5G/4G, loại eSIM/SIM, vùng phủ sóng
- Ảnh banner sản phẩm

### Scroll Navigation (9 tabs)
Thanh tab cố định (sticky) khi scroll xuống:

| Tab | Nội dung section |
|-----|-----------------|
| Overview | Mô tả tổng quan, điểm nổi bật |
| Package options | Bộ lọc & chọn gói cước |
| Product details | Thông số kỹ thuật chi tiết |
| What to expect | Những gì khách hàng nhận được |
| Terms & Conditions | Điều khoản sử dụng |
| How to use | Hướng dẫn kích hoạt từng bước |
| Additional information | Thông tin bổ sung |
| Reviews | Đánh giá từ người dùng thực |
| FAQs | 11 câu hỏi thường gặp |

### Gói cước (Package Options)
Bộ lọc 4 chiều đồng thời:

| Bộ lọc | Các lựa chọn |
|--------|-------------|
| Loại gói | Data in total / Data per day |
| Thời hạn | 3 / 5 / 7 / 10 / 15 / 30 ngày ... |
| Dung lượng | 1GB / 3GB / 5GB / 10GB / Unlimited |
| Loại thiết bị | Data only |

Mỗi gói cước hiển thị:
- Tên gói đầy đủ
- Giá gốc (gạch ngang)
- Giá bán (USD)
- Badge "Best Value" cho gói phổ biến
- Nút "Book Now" → sang trang đặt hàng với gói được chọn sẵn

**Tổng dữ liệu:** 190 entries gói cước, mỗi sản phẩm có đến 44 gói (30 "Data in total" + 14 "Data per day")

### Hướng dẫn sử dụng (How to use)
6 bước kích hoạt eSIM với icon số thứ tự:
1. Cập nhật Klook App lên bản mới nhất
2. Account → Bookings → Activate (hoặc dùng QR code)
3. Đọc hướng dẫn và bắt đầu cài đặt
4. Cài đặt qua WiFi, không rời màn hình
5. Tại điểm đến: bật đường eSIM + Data Roaming
6. Chuyển Cellular Data sang eSIM, kiểm tra trạng thái

### FAQ Accordion (11 câu hỏi)
1. Thiết bị nào tương thích eSIM? (iPhone XS+, Samsung S20+, Pixel 3+)
2. Kích hoạt qua Klook App như thế nào?
3. Kích hoạt bằng QR Code như thế nào?
4. eSIM không kích hoạt được, xử lý thế nào?
5. Có thể quét 1 QR code trên nhiều máy không? (Không — single-use)
6. Có cần bật Data Roaming không? (Có — chỉ cho đường eSIM)
7. Lỗi khi cài đặt, xử lý thế nào?
8-11. Các câu hỏi kỹ thuật khác

### Reviews
Hiển thị review thực từ người dùng Klook: tên ẩn danh, ngày, tiêu đề, nội dung, gói đã mua.

---

## 2.4. Dữ liệu sản phẩm — 18 quốc gia & vùng lãnh thổ

| Khu vực | Quốc gia |
|---------|---------|
| Đông Nam Á | Vietnam, Thailand, Singapore, Malaysia, Indonesia, Philippines, Cambodia, Laos, Myanmar |
| Đông Á | Japan, Korea, Taiwan, Hong Kong, Macau |
| Nam Á | India |
| Trung Đông | UAE |
| Châu Đại Dương | Australia, New Zealand |
| Châu Âu | UK, Turkey |
| Bắc Mỹ | Canada |

> **Đã bổ sung 10 quốc gia/vùng mới** trong đợt bàn giao: Malaysia, Singapore, UAE, Australia, UK, New Zealand, Turkey, Canada, India, Macau — mỗi quốc gia có đầy đủ 44 gói cước.

---

## 2.5. Trang Đặt hàng `/sim-card/[slug]/book/`

**Pre-fill tự động:** Khi vào từ trang chi tiết, các trường sau được điền sẵn:
- Tên sản phẩm, ID, loại (eSIM/SIM), nhà mạng
- Gói đã chọn (tên, dung lượng, thời hạn, giá)

**Thông tin cần điền:**

| Mục | Trường | Bắt buộc |
|-----|--------|----------|
| **Liên hệ** | Họ tên | ✅ |
| | Email (nhận QR code) | ✅ |
| | SĐT + mã quốc tế | ✅ |
| **Giao hàng** | Phương thức: eSIM QR (email) / SIM vật lý | ✅ |
| | Ngày đến | ✅ |
| | Số chuyến bay | Tuỳ chọn |
| | Tên & địa chỉ khách sạn (cho SIM vật lý) | Tuỳ chọn |
| **Xác nhận** | Số lượng, tổng tiền USD | — |
| | Ghi chú | Tuỳ chọn |

---

## 2.6. API Xử lý Đơn hàng `POST /api/sim-order/`

**Order ID:** `SIM-YYYYMMDD-XXXXXX`

**Bảo mật:**
- Rate limiting: 5 request / 60 giây / IP
- Validate bắt buộc: fullName + email + phone + product.id + quantity

**Email Admin** — Chủ đề: `New eSIM Order SIM-XXXXXXXX — [Tên sản phẩm]`
- Đầy đủ thông tin đơn: sản phẩm, gói, số lượng, tổng tiền, thông tin liên hệ, phương thức giao hàng
- Non-fatal: lỗi email admin không ảnh hưởng đến khách hàng

**Email Khách hàng** — Chủ đề: `Your SIM Card Order is Confirmed`
- Lời chào cá nhân hoá
- Tóm tắt đơn hàng trong khung nổi bật
- Hướng dẫn tự động theo loại:
  - *eSIM:* "QR code gửi trong 15 phút sau xác nhận thanh toán"
  - *SIM vật lý:* "Liên hệ xác nhận thông tin nhận SIM, mang theo hộ chiếu"

---

---

# MODULE 03 — ASIA VISA APPLICATION

## 3.1. Mô tả tổng quan

Hệ thống đăng ký visa điện tử (e-Visa) cho Việt Nam, được thiết kế theo luồng của Visa2Asia. Khách hàng điền đầy đủ thông tin, nhận xác nhận qua email và được xử lý trong 8 giờ (Urgent) hoặc 3–5 ngày làm việc.

**URL:** `/visa/`
**API:** `POST /api/visa-application/`
**Application ID:** `VISA-YYYYMMDD-XXXXXX`

---

## 3.2. Giao diện trang `/visa/`

**Header trang:**
- Gradient nền đặc biệt: navy → pearl chuyển tiếp tại điểm 88px
- Eyebrow badge: "VISA SERVICE"
- Tiêu đề H1 responsive: `clamp(38px, 4.7vw, 60px)`
- Lead text: "Fast e-Visa processing with no embassy visit required."
- Khoảng cách sát navbar (`pt-[88px]` + `!pt-6 md:!pt-8`), không bị thừa khoảng trắng

---

## 3.3. Form Đăng ký Visa — 5 phần

### Phần 1 — Thông tin liên hệ (Contact)
| Trường | Loại | Ghi chú |
|--------|------|---------|
| Title | Select | Mr / Mrs / Ms / Dr |
| Full Name | Text | Bắt buộc |
| Email | Email | Bắt buộc — nhận visa approval letter |
| Country Code + Phone | Select + Text | Bắt buộc |
| Message / Notes | Textarea | Tuỳ chọn |
| Website | Hidden (honeypot) | Chống spam bot tự động |

### Phần 2 — Thông tin visa
| Trường | Loại |
|--------|------|
| Visa Type | Single Entry / Multiple Entry |
| Purpose of Visit | Tourism / Business / Medical / Other |
| Processing Time | Normal (3–5 ngày) / Urgent (8 giờ) |
| Entry Date | Date picker |
| Exit Date | Date picker |
| Arrival Airport | Nội Bài (HAN) / Tân Sơn Nhất (SGN) / Đà Nẵng (DAD) / ... |
| Number of Visas | Number |

### Phần 3 — Danh sách người đi (Applicants)
Cho phép thêm/xoá nhiều người, mỗi người gồm:
| Trường | Loại |
|--------|------|
| Full Name | Text |
| Gender | Male / Female |
| Date of Birth | Date |
| Nationality | Select (danh sách quốc gia) |
| Passport Number | Text |

### Phần 4 — Dịch vụ đưa đón sân bay (Car Pickup)
Toggle bật/tắt. Khi bật hiện thêm:
| Trường | Loại |
|--------|------|
| Car Seats | Number |
| Pickup Time | Time |
| Fast Track | Checkbox |
| Baby Seat | Checkbox |
| English-speaking Driver | Checkbox |
| Night Trip (22:00–05:00) | Checkbox |

### Phần 5 — Tóm tắt phí & Xác nhận
| Hàng | Nội dung |
|------|---------|
| Visa Fee | Phí visa (số lượng × đơn giá theo loại) |
| Extra Fee | Phí đưa đón, fast track, các dịch vụ thêm |
| **TOTAL** | **Tổng thanh toán (USD)** |

Nút Submit "Submit Application" — gửi toàn bộ form.

---

## 3.4. API Xử lý Đơn `POST /api/visa-application/`

**Luồng xử lý:**
```
Nhận POST request
    ↓
Rate limiting: 3 request / 10 phút / IP
    ↓
Honeypot check: field 'website' có giá trị → reject (spam bot)
    ↓
Validate: contact.email + contact.fullName (bắt buộc)
    ↓
Tạo Application ID: VISA-YYYYMMDD-RANDOM
    ↓
├── Email Admin: thông báo đầy đủ (non-fatal)
└── Email Khách: xác nhận nhận đơn
    ↓
Response: { id, status: 'received' } — HTTP 201 Created
```

---

## 3.5. Email Admin

**Chủ đề:** `New Visa Application — Nguyễn Văn A [VISA-20260525-XXXXXX]`

**Nội dung đầy đủ:**
- Application ID
- Thông tin liên hệ: Title + Tên, Email, SĐT, Ghi chú
- Chi tiết visa: Loại, Mục đích, Thời gian xử lý, Ngày vào/ra, Sân bay, Số lượng
- Dịch vụ Car Pickup (nếu có): số ghế, giờ đón, fast track, baby seat, tài xế tiếng Anh, ca đêm
- **Bảng danh sách Applicants** (HTML table): STT · Tên · Giới tính · Ngày sinh · Quốc tịch · Số hộ chiếu
- **Phí:** Visa Fee / Extra Fee / **TOTAL (USD)** — font size 18px nổi bật

---

## 3.6. Email Khách hàng

**Chủ đề:** `Your Vietnam Visa Application has been received — VISA-XXXXXXXX`

**Nội dung cá nhân hoá:**
- Lời chào: "Dear Mr/Mrs [Tên đầy đủ]"
- Câu xác nhận đã nhận đơn
- **Khung tóm tắt nổi bật** (border radius 12px, nền champagne):
  - Application ID
  - Số lượng visa
  - Thời gian xử lý *(tự động: Normal → "3–5 business days" / Urgent → "8 business hours")*
  - Ngày nhập cảnh
  - Sân bay
  - Tổng phí USD
- **3 bước tiếp theo:**
  1. Chúng tôi review và xác minh thông tin
  2. Gửi visa approval letter qua email trong [X thời gian]
  3. Hướng dẫn thanh toán sẽ gửi sau khi visa xác nhận
- Cam kết bảo mật thông tin cá nhân
- Footer: Ha Long Luxury Travel branding (gold)

---

---

# HỆ THỐNG EMAIL CHUNG (Cả 3 module)

## Cấu hình SMTP
| Thông số | Giá trị |
|----------|---------|
| Provider | Gmail SMTP |
| Host | smtp.gmail.com |
| Port | 587 (TLS/STARTTLS) |
| Cấu hình | File `.env.local` |

## Pattern xử lý (bảo vệ trải nghiệm khách hàng)
| Email | Hành vi khi lỗi SMTP |
|-------|---------------------|
| Email Admin | **Non-fatal** — ghi log lỗi, tiếp tục gửi xác nhận cho khách |
| Email Khách | **Fatal** — trả về HTTP 500, thông báo cho khách để liên hệ lại |

## Template Design (nhất quán toàn hệ thống)
- Nền ngoài: `#F8F5EF` (pearl)
- Card trắng ấm: `#FFFAF0` + border `#EFE5D1`
- Eyebrow brand: uppercase gold — "HA LONG LUXURY"
- Heading: Georgia serif 32px
- Body: Manrope 15px, line-height 1.7
- Accent box: border-radius 12px, nền champagne

---

---

# BẢO MẬT HỆ THỐNG

| Lớp bảo vệ | Module | Cấu hình |
|------------|--------|----------|
| Rate Limiting | Tất cả | Booking: 3/10min · Visa: 3/10min · SIM: 5/60s |
| Honeypot | Booking + Visa | Field ẩn `website` — bot tự động bị reject |
| Input Sanitization | Tất cả email | `escapeHtml()` cho mọi dữ liệu user trước khi render HTML |
| Email Config Guard | Tất cả API | `assertEmailReady()` kiểm tra SMTP config trước khi nhận request |
| Request Validation | Tất cả API | Validate các trường bắt buộc trả về HTTP 400 nếu thiếu |

---

---

# DANH SÁCH FILE BÀN GIAO

## Module ALL STYLES
| File | Vai trò |
|------|---------|
| `components/header.tsx` | Mega-menu "ALL STYLES" + animation + hover preview |
| `lib/trip-styles.ts` | Định nghĩa 20 phong cách (dữ liệu, ảnh, slug) |
| `app/travel-styles/page.tsx` | Trang danh mục `/travel-styles/` |
| `components/sections/travel-style-atlas.tsx` | Component hero + tìm kiếm + filter + grid kết quả |
| `app/travel-styles/[slug]/page.tsx` | Trang chi tiết từng phong cách |

## Module SIM CARD
| File | Vai trò |
|------|---------|
| `app/sim-card/page.tsx` | Trang catalog SIM |
| `app/sim-card/[slug]/page.tsx` | Trang chi tiết sản phẩm |
| `app/sim-card/[slug]/book/page.tsx` | Trang đặt hàng |
| `app/api/sim-order/route.ts` | API xử lý đơn + gửi email |
| `components/sim-card-catalog.tsx` | Catalog + filter + pagination mới |
| `components/sim-package-options.tsx` | Bộ lọc gói cước đa chiều |
| `components/sim-book-form.tsx` | Form đặt hàng đầy đủ |
| `components/sim-detail-scroll-nav.tsx` | Tab điều hướng sticky |
| `components/sim-faq-accordion.tsx` | FAQ 11 câu hỏi |
| `data/klook-raw-products.json` | 180 sản phẩm từ Klook |
| `data/klook-detail-data.json` | 190 entries gói cước chi tiết |

## Module ASIA VISA
| File | Vai trò |
|------|---------|
| `app/visa/page.tsx` | Trang đăng ký visa |
| `app/api/visa-application/route.ts` | API xử lý + gửi email |
| `components/visa-form.tsx` | Form 5 phần đầy đủ |

## Lib dùng chung
| File | Vai trò |
|------|---------|
| `lib/email.ts` | Module SMTP, templates, helper functions |
| `lib/security.ts` | Rate limiting, clientKey, spam protection |

---

*Tài liệu bàn giao được tạo ngày 25/05/2026 — Ha Long Luxury Travel Platform*
