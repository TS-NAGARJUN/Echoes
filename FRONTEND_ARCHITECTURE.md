# Frontend Architecture & Components Documentation

**Date**: April 1, 2026  
**Status**: Modern Auth System Complete ✅

---

## 🏗️ Architecture Overview

### **Core Design Principles**
- ✅ **Modular** - Small, reusable components with single responsibility
- ✅ **Loosely Coupled** - Components don't depend on each other
- ✅ **Custom Hooks** - Logic separated from UI components
- ✅ **Context API** - Global state management
- ✅ **Reusable** - Components can be used across the application

---

## 📁 Project Structure

```
frontend/src/
├── context/
│   └── AuthContext.jsx          # Global auth state & methods
├── hooks/
│   ├── useAuth.js               # Access AuthContext
│   ├── useForm.js               # Form state management
│   ├── useLogin.js              # Login logic
│   └── useRegister.js           # Register logic
├── utils/
│   ├── api.js                   # Axios instance with interceptors
│   └── validators.js            # Form validation utilities
├── components/
│   ├── common/
│   │   ├── InputField.jsx       # Text input component
│   │   ├── PasswordInput.jsx    # Password input with toggle
│   │   └── FormButton.jsx       # Button with loading state
│   └── Auth/
│       ├── AuthCard.jsx         # Card wrapper for forms
│       ├── AuthLayout.jsx       # Layout with gradient background
│       └── SocialAuthButtons.jsx # Social login placeholder
├── pages/
│   ├── LoginPage.jsx            # Login page
│   └── RegisterPage.jsx         # Register page
├── App.jsx                      # Main app with routing
├── main.jsx                     # Entry point
└── index.css                    # Global styles & animations
```

---

## 🎯 Component Hierarchy & Reusability

### **1. InputField Component**
**Purpose**: Reusable text input with error handling

**Props**:
```javascript
{
  label: String,                 // Input label
  type: String,                  // 'text', 'email', etc (default: 'text')
  name: String,                  // Input name
  value: String,                 // Current value
  onChange: Function,            // Input change handler
  onBlur: Function,              // Input blur handler
  error: String,                 // Error message
  touched: Boolean,              // Field was touched
  placeholder: String,           // Placeholder text
  disabled: Boolean,             // Disabled state (default: false)
  autoComplete: String           // Autocomplete attribute
}
```

**Used In**:
- LoginPage (email)
- RegisterPage (name, email)

---

### **2. PasswordInput Component**
**Purpose**: Password input with show/hide toggle (extends InputField)

**Features**:
- ✅ Eye icon toggle for visibility
- ✅ Same styling as InputField
- ✅ Error handling
- ✅ Smooth animations

**Props**: Same as InputField (type is always "password" internally)

**Used In**:
- LoginPage (password)
- RegisterPage (password, confirmPassword)

---

### **3. FormButton Component**
**Purpose**: Submit button with loading state and variants

**Props**:
```javascript
{
  type: String,                  // 'submit', 'button' (default: 'submit')
  isLoading: Boolean,            // Shows spinner (default: false)
  disabled: Boolean,             // Disabled state (default: false)
  children: ReactNode,           // Button text
  className: String,             // Additional CSS classes
  variant: String                // 'primary', 'secondary' (default: 'primary')
}
```

**Features**:
- ✅ Animated spinner on loading
- ✅ Primary and secondary variants
- ✅ Keyboard focus styles

---

### **4. AuthCard Component**
**Purpose**: Wrapper card for authentication forms

**Props**:
```javascript
{
  children: ReactNode,           // Form content
  title: String,                 // Card title
  subtitle: String               // Card subtitle
}
```

**Features**:
- ✅ Chat icon branding
- ✅ Centered title & subtitle
- ✅ Shadow and rounded corners

---

### **5. AuthLayout Component**
**Purpose**: Page layout with animated gradient background

**Features**:
- ✅ Gradient background
- ✅ Animated blob shapes
- ✅ Responsive padding
- ✅ Centered content

**Animation**:
```css
- Three animated blobs
- Blue, purple, and pink colors
- 7 second animation cycle
- Different animation delays
```

---

### **6. SocialAuthButtons Component**
**Purpose**: Placeholder for social login integration

**Features**:
- ✅ Google and Facebook buttons
- ✅ Divider line with "OR CONTINUE WITH" text
- ✅ Ready for future integration

---

## 🔧 Custom Hooks System

### **useAuth Hook**
**Purpose**: Access global auth context
**Returns**: AuthContext with user, token, loading, error, etc.

```javascript
const { user, token, error, isAuthenticated } = useAuth();
```

---

### **useForm Hook**
**Purpose**: Generic form state management

**Returns**:
```javascript
{
  values,                  // Form field values
  errors,                  // Field errors
  touched,                 // Touched state
  isSubmitting,            // Submission in progress
  handleChange,            // Input change handler
  handleBlur,              // Input blur handler
  handleSubmit,            // Form submission handler
  setFieldError,           // Set specific field error
  setFieldValue,           // Set specific field value
  resetForm                // Reset form to initial state
}
```

**Usage**:
```javascript
const form = useForm(initialValues, onSubmitCallback);
```

---

### **useLogin Hook**
**Purpose**: Handle login logic and validation

**Returns**: useForm + submitLogin function

**Workflow**:
1. Validate form (email, password)
2. Call API /auth/login
3. Store token & user in AuthContext
4. Update localStorage
5. Handle errors

---

### **useRegister Hook**
**Purpose**: Handle registration logic and validation

**Returns**: useForm + submitRegister function

**Workflow**:
1. Validate form (name, email, password, confirm)
2. Call API /auth/register
3. Store token & user in AuthContext
4. Update localStorage
5. Handle errors (duplicate email, etc)

---

## 🌐 Context API Setup

### **AuthContext**
**State**:
```javascript
{
  user: Object,            // Current user data
  token: String,           // JWT token
  loading: Boolean,        // Global loading state
  error: String,           // Global error message
  isAuthenticated: Boolean // Derived from token
}
```

**Methods**:
```javascript
storeAuthData(userData, token)  // Save user & token
clearAuth()                     // Clear all auth data
logout()                        // Logout user
setLoading(bool)                // Update loading state
setError(msg)                   // Update error message
```

**Persistence**: Uses localStorage for token & user data

---

## 🛠️ Utility Functions

### **Validators (utils/validators.js)**

```javascript
validateEmail(email)            // Check email format
validatePassword(password)      // Check password >= 6 chars
validateName(name)              // Check name >= 2 chars
validateLoginForm(values)       // Validate login form
validateRegisterForm(values)    // Validate register form
```

---

### **API (utils/api.js)**

**Features**:
- ✅ Axios instance with baseURL
- ✅ Request interceptor (adds Bearer token)
- ✅ Response interceptor (error handling)
- ✅ Auto-extracts data from response

**Usage**:
```javascript
import api from '../utils/api';

const response = await api.post('/auth/login', { email, password });
// Already returns response.data automatically
```

---

## 📄 Pages

### **LoginPage**
**Route**: `/login`

**Components Used**:
- AuthLayout
- AuthCard
- InputField (email)
- PasswordInput (password)
- FormButton
- SocialAuthButtons
- Remember me checkbox
- Forgot password link

**Features**:
- ✅ Form validation
- ✅ Error messages
- ✅ Loading state
- ✅ Link to register
- ✅ Remember me option

---

### **RegisterPage**
**Route**: `/register`

**Components Used**:
- AuthLayout
- AuthCard
- InputField (name, email)
- PasswordInput (password, confirmPassword)
- FormButton
- SocialAuthButtons
- Terms & Conditions checkbox

**Features**:
- ✅ Form validation
- ✅ Password confirmation
- ✅ Duplicate email detection
- ✅ Error messages
- ✅ Loading state
- ✅ Link to login

---

## 🎨 Design System

### **Colors**
```
Primary: Blue (#2563eb)
Secondary: Purple (#9333ea)
Text: Gray (#1f2937)
Error: Red (#ef4444)
Border: Light Gray (#e5e7eb)
```

### **Animations**
```
Blob: 7s infinite translate & scale
Input focus: Smooth color transition (200ms)
Button load: Spinning icon
```

### **Spacing**
```
Component gap: 1rem (mb-4)
Section gap: 1.5rem (gap-6)
Padding: 2rem (p-8)
```

---

## 🚀 Usage Examples

### **Form Input**
```jsx
<InputField
  label="Email"
  name="email"
  value={email}
  onChange={handleChange}
  onBlur={handleBlur}
  error={errors.email}
  touched={touched.email}
/>
```

### **Password Input**
```jsx
<PasswordInput
  label="Password"
  name="password"
  value={password}
  onChange={handleChange}
  error={errors.password}
/>
```

### **Form Button**
```jsx
<FormButton isLoading={isSubmitting}>
  Sign In
</FormButton>
```

### **Using Authentication**
```jsx
const { user, isAuthenticated, logout } = useAuth();

if (isAuthenticated) {
  return <div>Welcome, {user.name}!</div>;
}
```

---

## 🔌 API Integration

### **Request Format**
```javascript
// Login
POST /api/auth/login
{
  email: "user@example.com",
  password: "password123"
}

// Register
POST /api/auth/register
{
  name: "John Doe",
  email: "john@example.com",
  password: "password123",
  profilePic: "url" (optional)
}
```

### **Response Format**
```javascript
{
  success: true,
  data: {
    _id: "userId",
    name: "John Doe",
    email: "john@example.com",
    token: "jwt_token"
  }
}
```

**Token Storage**:
- Saved in localStorage as `authToken`
- Automatically included in all requests via interceptor
- Used in Authorization header: `Bearer {token}`

---

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────┐
│ User enters credentials in LoginPage            │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ handleSubmit → validateLoginForm (utils)        │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ useLogin hook → api.post('/auth/login')        │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ Backend validates & returns token & user       │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ storeAuthData → Save to context + localStorage │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ Component re-renders with user data            │
│ Ready for protected routes                      │
└─────────────────────────────────────────────────┘
```

---

## 📋 Files Checklist

### **Required Files Created**
- [x] context/AuthContext.jsx
- [x] hooks/useAuth.js
- [x] hooks/useForm.js
- [x] hooks/useLogin.js
- [x] hooks/useRegister.js
- [x] utils/api.js
- [x] utils/validators.js
- [x] components/common/InputField.jsx
- [x] components/common/PasswordInput.jsx
- [x] components/common/FormButton.jsx
- [x] components/Auth/AuthCard.jsx
- [x] components/Auth/AuthLayout.jsx
- [x] components/Auth/SocialAuthButtons.jsx
- [x] pages/LoginPage.jsx
- [x] pages/RegisterPage.jsx
- [x] App.jsx (updated)
- [x] main.jsx (updated)
- [x] index.css (updated)
- [x] .env.example (created)

---

## 🚀 Next Steps

### **Step 1: Install Dependencies**
```bash
cd frontend
npm install
```

### **Step 2: Create .env file**
```bash
# Copy from .env.example
cp .env.example .env

# Update with your backend URL if needed
```

### **Step 3: Run Frontend**
```bash
npm run dev
# Opens on http://localhost:5173 (Vite default)
```

### **Step 4: Test Auth Flow**
1. Go to `/register` - Create new account
2. Should redirect to `/login` after registration
3. Go to `/login` - Sign in with credentials
4. Token stored in localStorage
5. Context updated with user data

---

## ✨ Design Innovations

### **1. Gradient Background with Animated Blobs**
- Smooth, modern aesthetic
- Three animated shapes with different delays
- Creates depth and movement

### **2. Modular Components**
- No tight coupling
- Components work independently
- Easy to reuse in other pages

### **3. Custom Hooks for Logic**
- UI separated from business logic
- Easy to test
- Reusable across components

### **4. Form State Management**
- Handles touched state (show errors only when touched)
- Field-level error handling
- Generic useForm hook for future forms

### **5. Smooth Transitions**
- Input focus color changes
- Button loading animations
- Error message animations

---

## 🔒 Security Notes

- ✅ Token stored in localStorage (accessible to JS)
- ✅ Interceptor adds token to all requests
- ✅ /logout clears token from storage
- ✅ Protected routes will be added soon
- ⚠️ FUTURE: Consider using HttpOnly cookies for production

---

**Status**: ✅ Frontend Auth System Complete | Ready for Dashboard Development
