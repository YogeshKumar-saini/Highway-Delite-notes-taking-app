# Notes App Frontend

A modern, responsive React frontend built with Next.js 14, TypeScript, and Tailwind CSS for the Notes App with comprehensive authentication and note management features.

## 🚀 Features

### Authentication Interface
- **Dual Login Methods**: Toggle between password and OTP authentication
- **Registration Flow**: Complete signup with date picker and verification method selection
- **OTP Verification**: Clean interface for email/phone OTP verification
- **Password Recovery**: Forgot password and reset password flows
- **Session Management**: Automatic session handling with SWR

### Notes Management
- **Create Notes**: Simple form to add new notes with title and content
- **Notes List**: Display all user notes with edit/delete actions
- **Inline Editing**: Edit notes directly in the list view
- **Real-time Updates**: Optimistic updates with SWR caching
- **Responsive Design**: Mobile-first responsive interface

### User Experience
- **Loading States**: Proper loading indicators throughout
- **Error Handling**: User-friendly error messages with toast notifications
- **Form Validation**: Client-side validation for better UX
- **Accessibility**: Semantic HTML and proper ARIA labels
- **Modern UI**: Clean, minimal design with smooth animations

## 🛠 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Material-UI (MUI) + Custom components
- **State Management**: SWR for server state
- **HTTP Client**: Fetch API with custom wrapper
- **Date Handling**: date-fns with MUI Date Picker
- **Notifications**: React Toastify
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

## 📦 Dependencies

```json
{
  "next": "14.x",
  "react": "18.x",
  "typescript": "5.x",
  "@mui/material": "UI components",
  "@mui/x-date-pickers": "Date picker components",
  "swr": "Data fetching and caching",
  "react-toastify": "Toast notifications",
  "tailwindcss": "Utility-first CSS",
  "lucide-react": "Icon library",
  "date-fns": "Date utilities",
  "clsx": "Conditional className utility",
  "tailwind-merge": "Tailwind class merging"
}
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Running backend API server

### Installation

1. **Navigate to Frontend Directory**
```bash
cd ui
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Configuration**
Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

5. **Open Application**
Navigate to `http://localhost:3001` in your browser

## 📁 Project Structure

```
ui/
├── app/                          # Next.js 14 App Router
│   ├── hooks/                   # Custom React hooks
│   │   └── use-session.ts       # Session management hook
│   ├── login/                   # Login page
│   │   └── page.tsx
│   ├── register/                # Registration page
│   │   └── page.tsx
│   ├── verify-otp/              # OTP verification page
│   │   └── page.tsx
│   ├── forgot-password/         # Forgot password page
│   │   └── page.tsx
│   ├── password/reset/[token]/  # Reset password page
│   │   └── page.tsx
│   ├── notes/                   # Notes management page
│   │   └── page.tsx
│   ├── globals.css             # Global styles and theme
│   ├── layout.tsx              # Root layout
│   └── page.tsx               # Home page (registration)
├── auth/                       # Authentication components
│   └── auth-shell.tsx         # Shared auth layout
├── components/                 # Reusable components
│   ├── notes/
│   │   └── notes-list.tsx     # Notes management component
│   ├── ui/                    # Shadcn/ui components
│   ├── login-form.tsx         # Login form component
│   ├── register-form.tsx      # Registration form component
│   └── verify-otp-form.tsx    # OTP verification form
├── lib/                       # Utility libraries
│   ├── api.ts                 # API client and utilities
│   └── utils.ts               # General utilities
├── public/                    # Static assets
│   ├── top.png               # Logo
│   └── background.jpg        # Auth background
├── package.json
└── README.md
```

## 🎨 UI Components & Design

### Authentication Shell
- **Responsive Layout**: Two-column design with form and hero image
- **Brand Identity**: Logo and brand name display
- **Consistent Styling**: Shared layout for all auth pages

### Form Components
- **Material-UI Integration**: Consistent form styling
- **Validation Feedback**: Real-time validation messages
- **Loading States**: Disabled states during API calls
- **Error Display**: Toast notifications for errors

### Notes Interface
- **Card-based Design**: Clean note display with shadows
- **Inline Editing**: Click-to-edit functionality
- **Action Buttons**: Edit and delete with intuitive icons
- **Empty States**: Helpful messages when no notes exist

## 🔄 State Management

### Session Management (use-session.ts)
```typescript
const { user, isAuthenticated, isLoading, error, mutate } = useSession()
```

- **SWR Integration**: Automatic caching and revalidation
- **Error Handling**: Graceful error states
- **Loading States**: Proper loading indicators
- **Session Refresh**: Manual session refresh capability

### API Client (api.ts)
```typescript
// Custom API client with error handling
const api = {
  register: (payload) => apiFetch('/api/v1/user/register', {...}),
  login: (payload) => apiFetch('/api/v1/user/login', {...}),
  // ... other methods
}
```

- **Centralized API Calls**: All API interactions in one place
- **Error Handling**: Custom ApiError class
- **Cookie Management**: Automatic credential inclusion
- **Type Safety**: Full TypeScript support

## 🎯 Key Features Implementation

### Dual Authentication System
```typescript
// Login form supports both password and OTP methods
const [mode, setMode] = useState<"password" | "otp">("password")

// Dynamic form rendering based on selected method
{mode === "password" ? (
  <PasswordField />
) : (
  <OtpField />
)}
```

### Real-time Notes Management
```typescript
// SWR for real-time data fetching
const { data, mutate } = useSWR("/api/v1/user/notes", () => api.getNotes())

// Optimistic updates
await api.createNote(noteData)
mutate() // Refresh notes list
```

### Form Validation
```typescript
// Client-side validation before API calls
if (password.length < 6) {
  setErr("Password must be at least 6 characters.")
  return
}
```

## 🎨 Styling & Theme

### Tailwind CSS Configuration
- **Custom Color Palette**: Consistent brand colors
- **Dark Mode Support**: Built-in dark theme variables
- **Responsive Design**: Mobile-first approach
- **Component Utilities**: Custom utility classes

### Design System
- **Typography**: Geist font family for modern look
- **Spacing**: Consistent spacing scale
- **Colors**: Professional blue/gray palette
- **Shadows**: Subtle elevation for depth
- **Borders**: Rounded corners for modern feel

## 🔧 Configuration

### Next.js Configuration
```typescript
// app/layout.tsx - Root configuration
export const metadata: Metadata = {
  title: "Notes App",
  description: "notes taking app",
}
```

### API Configuration
```typescript
// lib/api.ts - API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (Primary focus)
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Touch-friendly button sizes
- Optimized form layouts
- Readable typography
- Accessible navigation

## 🔍 Performance Optimizations

### SWR Caching
- **Client-side Caching**: Reduces API calls
- **Background Revalidation**: Keeps data fresh
- **Error Retry**: Automatic retry on failures
- **Optimistic Updates**: Immediate UI feedback

### Code Splitting
- **Route-based Splitting**: Next.js automatic code splitting
- **Component Lazy Loading**: Dynamic imports where needed
- **Bundle Optimization**: Tree shaking for smaller bundles

### Image Optimization
- **Next.js Image**: Automatic optimization
- **Responsive Images**: Multiple sizes for different screens
- **Lazy Loading**: Images load as needed

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Development Workflow
1. Start backend server first
2. Start frontend development server
3. Both servers run concurrently for full functionality
4. Hot reload enabled for rapid development

## 🔐 Authentication Flow Diagrams

### Registration Flow
```
User Input → Validation → API Call → OTP Sent → Verification → Account Activated
```

### Login Flow
```
Method Selection → Credentials/OTP → API Authentication → JWT Token → Dashboard
```

## 📊 Error Handling

### API Error Management
```typescript
try {
  const result = await api.someMethod()
  // Handle success
} catch (e) {
  const message = e instanceof ApiError 
    ? e.payload?.message || e.message 
    : "Generic error message"
  toast.error(message)
}
```

### User Feedback
- **Toast Notifications**: Success and error messages
- **Form Validation**: Real-time field validation
- **Loading States**: Visual feedback during operations
- **Error Boundaries**: Graceful error recovery

## 🚀 Deployment

### Build Process
```bash
npm run build        # Creates optimized production build
npm run start        # Starts production server
```

### Environment Variables
- Set `NEXT_PUBLIC_API_URL` to production API URL
- Configure any additional environment-specific variables

### Hosting Recommendations
- **Vercel**: Seamless Next.js deployment
- **Netlify**: Static site hosting with serverless functions
- **Railway/Render**: Full-stack deployment options

## 🔧 Customization

### Theme Customization
- Modify `app/globals.css` for color scheme changes
- Update Tailwind configuration for custom utilities
- Adjust component styles in individual files

### Component Extension
- Add new pages in the `app/` directory
- Create reusable components in `components/`
- Extend API client in `lib/api.ts`

## 🤝 Contributing

### Code Standards
- Use TypeScript for type safety
- Follow Next.js 14 App Router conventions
- Implement proper error handling
- Write accessible HTML
- Use semantic component naming

### Development Guidelines
1. Test on multiple screen sizes
2. Verify all form validations
3. Test error scenarios
4. Ensure proper loading states
5. Validate accessibility features

## 📈 Future Enhancements

### Planned Features
- **Rich Text Editor**: Enhanced note editing
- **Note Categories**: Organization with tags/folders
- **Search Functionality**: Full-text note search
- **Export Options**: PDF/markdown export
- **Collaboration**: Note sharing capabilities
- **Offline Support**: PWA features
- **Dark Mode**: Complete dark theme implementation

### Technical Improvements
- **Unit Testing**: Jest and React Testing Library
- **E2E Testing**: Playwright or Cypress
- **Performance Monitoring**: Web Vitals tracking
- **Bundle Analysis**: Webpack bundle analyzer
- **Accessibility Audit**: Comprehensive a11y testing

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify backend server is running
   - Check NEXT_PUBLIC_API_URL environment variable
   - Ensure CORS is properly configured

2. **Authentication Issues**
   - Clear browser cookies and localStorage
   - Verify JWT token format
   - Check token expiration

3. **Build Errors**
   - Update dependencies to latest versions
   - Check TypeScript configuration
   - Verify all imports are correct

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and stack traces.