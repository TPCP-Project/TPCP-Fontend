### TPCP Frontend – Cấu trúc thư mục

Dưới đây là cấu trúc thư mục và danh sách file hiện có trong dự án, bám sát theo snapshot bạn cung cấp.

```text
tpcp-fontend/
├─ index.html
├─ node_modules/
├─ package-lock.json
├─ package.json
├─ public/
│  ├─ favicon.ico
│  ├─ hero.mp4
│  └─ robots.txt
├─ src/
│  ├─ App.css
│  ├─ App.tsx
│  ├─ assets/
│  │  ├─ icons/
│  │  │  ├─ home.svg
│  │  │  └─ user.svg
│  │  └─ images/
│  │     ├─ banner.jpg
│  │     └─ logo.png
│  ├─ components/
│  │  ├─ chat/
│  │  │  ├─ ChatList.tsx
│  │  │  ├─ ChatWindow.tsx
│  │  │  └─ MessageItem.tsx
│  │  ├─ common/
│  │  │  ├─ Footer/
│  │  │  │  ├─ Footer.module.css
│  │  │  │  ├─ Footer.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ Header/
│  │  │  │  ├─ Header.module.css
│  │  │  │  ├─ Header.tsx
│  │  │  │  └─ index.ts
│  │  │  ├─ Layout/
│  │  │  │  ├─ DashboardLayout.module.css
│  │  │  │  ├─ DashboardLayout.tsx
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Layout.module.css
│  │  │  │  └─ Layout.tsx
│  │  │  ├─ Loading/
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ Loading.module.css
│  │  │  │  └─ Loading.tsx
│  │  │  └─ Modal/
│  │  │     ├─ index.ts
│  │  │     ├─ Modal.module.css
│  │  │     └─ Modal.tsx
│  │  ├─ CheckoutButton.tsx
│  │  ├─ JoinProjectByInviteCode.tsx
│  │  ├─ modals/
│  │  │  ├─ CreateProjectModal.tsx
│  │  │  └─ EditProjectModal.tsx
│  │  ├─ ProjectDetail.tsx
│  │  ├─ ProjectInvitations.tsx
│  │  ├─ ProjectJoinRequests.tsx
│  │  ├─ ProjectMembers.tsx
│  │  ├─ SubscriptionGuard.tsx
│  │  └─ ui/
│  │     ├─ Button/
│  │     │  ├─ Button.module.css
│  │     │  ├─ Button.tsx
│  │     │  └─ index.ts
│  │     ├─ Card/
│  │     │  ├─ Card.module.css
│  │     │  ├─ Card.tsx
│  │     │  └─ index.ts
│  │     └─ Input/
│  │        ├─ index.ts
│  │        ├─ Input.module.css
│  │        └─ Input.tsx
│  ├─ context/
│  │  ├─ AppContext.tsx
│  │  ├─ AuthContext.tsx
│  │  └─ ThemeContext.tsx
│  ├─ hooks/
│  │  ├─ useApi.ts
│  │  ├─ useAuth.ts
│  │  ├─ useDebounce.ts
│  │  └─ useLocalStorage.ts
│  ├─ main.tsx
│  ├─ pages/
│  │  ├─ About/
│  │  │  ├─ About.module.css
│  │  │  ├─ About.tsx
│  │  │  └─ index.ts
│  │  ├─ Contact/
│  │  │  ├─ Contact.module.css
│  │  │  ├─ Contact.tsx
│  │  │  └─ index.ts
│  │  ├─ Dashboard/
│  │  │  ├─ AI.tsx
│  │  │  ├─ Chat.tsx
│  │  │  ├─ Dashboard.module.css
│  │  │  ├─ KPI.tsx
│  │  │  ├─ Overview/
│  │  │  │  ├─ Overview.module.css
│  │  │  │  └─ Overview.tsx
│  │  │  ├─ Payment.tsx
│  │  │  ├─ Projects.tsx
│  │  │  ├─ Tasks.tsx
│  │  │  ├─ Team.tsx
│  │  │  └─ Upload.tsx
│  │  ├─ Home/
│  │  │  ├─ Home.module.css
│  │  │  ├─ Home.tsx
│  │  │  └─ index.ts
│  │  ├─ Login/
│  │  │  ├─ index.ts
│  │  │  ├─ Login.module.css
│  │  │  └─ Login.tsx
│  │  ├─ NotFound/
│  │  │  ├─ index.ts
│  │  │  ├─ NotFound.module.css
│  │  │  └─ NotFound.tsx
│  │  ├─ Payment/
│  │  │  └─ PaymentSuccess.tsx
│  │  ├─ Pricing/
│  │  │  ├─ index.tsx
│  │  │  ├─ Pricing.module.css
│  │  │  └─ Pricing.tsx
│  │  ├─ Register/
│  │  │  ├─ index.ts
│  │  │  ├─ Register.module.css
│  │  │  └─ Register.tsx
│  │  └─ VerifySignup/
│  │     ├─ index.ts
│  │     ├─ VerifySignup.module.css
│  │     └─ VerifySignup.tsx
│  ├─ routes/
│  │  ├─ AppRoutes.tsx
│  │  ├─ PrivateRoute.tsx
│  │  └─ PublicRoute.tsx
│  ├─ services/
│  │  ├─ api.ts
│  │  ├─ authService.ts
│  │  ├─ chatService.ts
│  │  ├─ httpClient.ts
│  │  ├─ invitationService.ts
│  │  ├─ projectService.ts
│  │  ├─ socketService.ts
│  │  ├─ subscriptionService.ts
│  │  └─ userService.ts
│  ├─ styles/
│  │  ├─ globals.css
│  │  ├─ mixins.css
│  │  ├─ reset.css
│  │  └─ variables.css
│  ├─ utils/
│  │  ├─ constants.ts
│  │  ├─ formatters.ts
│  │  ├─ httpError.ts
│  │  └─ validators.ts
│  └─ vite-env.d.ts
├─ test-chat-api.ts
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```

Ghi chú:

- Danh sách trên phản ánh chính xác các file/thư mục có trong snapshot hiện tại. Nếu bạn thêm/xóa file sau này, hãy cập nhật lại phần này cho đồng bộ.
