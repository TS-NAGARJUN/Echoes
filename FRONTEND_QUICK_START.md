# Frontend Quick Start & Testing Guide

**Status**: Ready to run ✅

---

## 🚀 Installation & Setup

### **Step 1: Install Dependencies**
```bash
cd frontend
npm install
```

### **Step 2: Create Environment File**
```bash
# Copy template
cp .env.example .env

# Verify content:
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### **Step 3: Start Frontend**
```bash
npm run dev
```

**Output**: 
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## 🧪 Testing Authentication Flow

### **Prerequisites**
- ✅ Backend running on http://localhost:5000
- ✅ MongoDB Atlas connected
- ✅ Frontend running on http://localhost:5173

---

### **Test 1: Registration**

**Steps**:
1. Navigate to http://localhost:5173/register
2. Fill form:
   ```
   Name: John Doe
   Email: john@example.com
   Password: password123
   Confirm: password123
   ```
3. Click "Create Account"

**Expected Result**:
- ✅ Form validates
- ✅ Button shows loading spinner
- ✅ API call succeeds
- ✅ Token saved to localStorage
- ✅ User data saved to context
- ✅ Page navigates or user data available

**Check in Browser DevTools**:
```javascript
// Application → Local Storage
authToken: "eyJhbGciOi..."
authUser: {"_id":"...", "name":"John Doe", "email":"john@example.com"}
```

---

### **Test 2: Validation Errors**

**Email Validation**:
1. Go to register
2. Enter invalid email: `notanemail`
3. Blur field
4. Error message shows: "Please enter a valid email"

**Password Validation**:
1. Enter password: `123`
2. Blur field
3. Error message shows: "Password must be at least 6 characters"

**Password Mismatch**:
1. Enter password: `password123`
2. Enter confirm: `password456`
3. Blur confirm field
4. Error message shows: "Passwords do not match"

**Duplicate Email**:
1. Try to register with existing email
2. Error message shows: "User already registered with email@..."

---

### **Test 3: Login**

**Steps**:
1. Navigate to http://localhost:5173/login
2. Fill form:
   ```
   Email: john@example.com
   Password: password123
   ```
3. Click "Sign In"

**Expected Result**:
- ✅ Form validates
- ✅ Button shows loading spinner
- ✅ API call succeeds
- ✅ Token saved to localStorage
- ✅ Redirects or shows success

**Check localStorage**:
```javascript
// Token should be same as from registration
authToken: "eyJhbGciOi..." (same as before)
```

---

### **Test 4: Show/Hide Password**

**Steps**:
1. Focus password input
2. Click eye icon
3. Password text becomes visible
4. Click eye icon again
5. Password hides

**Expected Result**:
- ✅ Icon changes
- ✅ Input type toggles between password/text
- ✅ Smooth transition

---

### **Test 5: Form State Management**

**Touched State** (Errors only show after blur):
1. Go to register
2. Click Name field (focus)
3. No error shown
4. Click away (blur)
5. Error shows: "Name is required"

**Field-level Errors**:
1. Valid email, invalid password
2. Only password error shows
3. Email error not shown

---

### **Test 6: Navigation Links**

**From Register**:
1. Look for "Already have an account?"
2. Click link
3. Navigates to `/login`

**From Login**:
1. Look for "Create one"
2. Click link
3. Navigates to `/register`

---

### **Test 7: Responsive Design**

**Desktop** (Max-width on card):
- Card centered
- Max width ~448px
- Padding on sides

**Mobile** (DevTools - iPhone SE):
- Card takes full width
- Padding for safe area
- Inputs touch-friendly
- Text readable

---

## 🔧 Debugging Tips

### **Check Component Structure**
```javascript
// In React DevTools, you should see:
<App>
  <Router>
    <AuthProvider>
      <Routes>
        <LoginPage /> or <RegisterPage />
```

### **Check Auth Context**
```javascript
// In browser console
// Save rendered component to variable: $r
// Then check:
$r.props.value.user
$r.props.value.token
$r.props.value.isAuthenticated
```

### **Check Local Storage**
```javascript
// In browser console
JSON.parse(localStorage.getItem('authToken'))
JSON.parse(localStorage.getItem('authUser'))
```

### **Check Network Requests**
```
DevTools → Network tab → XHR
Look for:
- POST /api/auth/register
- POST /api/auth/login
Status should be 201 or 200
```

### **Check API Interceptor**
```javascript
// In browser console
fetch('http://localhost:5000/api/users', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
})
.then(r => r.json())
.then(console.log)
```

---

## ❌ Common Issues & Solutions

### **Issue: "Cannot find module" error**
**Solution**: 
```bash
# Delete node_modules and reinstall
rm -r node_modules
npm install
```

### **Issue: Frontend can't reach backend**
**Solution**:
- Verify backend is running on 5000
- Check CORS origin in backend .env
- Verify VITE_API_URL in .env is correct

### **Issue: Token not saved to localStorage**
**Solution**:
- Check Network tab for API response
- Verify response includes token field
- Check browser console for errors

### **Issue: Form validation not working**
**Solution**:
- Verify validators.js is imported
- Check form handleBlur is called (click away from field)
- Check browser console for errors

### **Issue: Password show/hide not working**
**Solution**:
- Check PasswordInput component renders
- Verify eye icon click handler
- Check browser console for errors

---

## 📊 Component Tree

```
App
├── Router
│   └── AuthProvider
│       ├── Routes
│       │   ├── Route /login → LoginPage
│       │   │   ├── AuthLayout
│       │   │   │   └── AuthCard
│       │   │   │       ├── InputField (email)
│       │   │   │       ├── PasswordInput (password)
│       │   │   │       ├── FormButton
│       │   │   │       └── SocialAuthButtons
│       │   │   │
│       │   ├── Route /register → RegisterPage
│       │   │   └── (similar structure)
```

---

## 🎯 Features to Verify

### **✅ Must Have**
- [ ] Registration form works
- [ ] Login form works
- [ ] Validation shows on blur
- [ ] Passwords don't match error
- [ ] Button loading state
- [ ] Token saves to localStorage
- [ ] Eye icon toggles password visibility

### **✅ Should Have**
- [ ] Email format validation
- [ ] Duplicate email error
- [ ] Links navigate correctly
- [ ] Error messages are clear
- [ ] Design looks modern
- [ ] Mobile responsive

### **✅ Nice to Have**
- [ ] Remember me checkbox
- [ ] Forgot password link
- [ ] Social auth buttons visible
- [ ] Smooth animations
- [ ] Keyboard navigation works

---

## 📈 Performance Notes

### **Optimizations In Place**
- ✅ CSS is minified (Tailwind)
- ✅ Components only re-render when needed
- ✅ useCallback prevents unnecessary renders
- ✅ Context doesn't cause re-render if state unchanged

### **Network Optimizations**
- ✅ API calls batched
- ✅ Token injected via interceptor (no extra calls)
- ✅ Response cached in localStorage

---

## 🔐 Security Checklist

- ✅ Password not logged or stored plaintext
- ✅ Token stored securely (localStorage for now)
- ✅ CORS configured
- ✅ Input validation on frontend and backend
- ✅ Base64/JWT token format
- ⚠️ FUTURE: Consider HttpOnly cookies for production

---

## 📞 Support

### **If something breaks:**

1. **Check terminal** for error messages
2. **Check browser console** (F12 → Console)
3. **Check Network tab** (F12 → Network → XHR)
4. **Check React DevTools** (F12 → Components)
5. **Check Application/Storage** (F12 → Application → Local Storage)

### **Restart Steps**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Then open http://localhost:5173 in browser.

---

**Next**: Test the flow above, then proceed to build Dashboard page ✅
