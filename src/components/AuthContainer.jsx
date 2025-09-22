import { createSignal } from "solid-js";
import Login from "./Login";
import Signup from "./Signup";

export default function AuthContainer({ onLogin }) {
  const [isLogin, setIsLogin] = createSignal(true);

  return (
    <div class="vh-100 d-flex align-items-center justify-content-center" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
      <div class="auth-container">
        <div class="card shadow-lg border-0" style="width: 400px; border-radius: 15px;">
          <div class="card-body p-5">
            {/* Logo/Icon */}
            <div class="text-center mb-4">
              <div class="auth-icon bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                   style="width: 60px; height: 60px; font-size: 24px;">
                <i class="bi bi-person"></i>
              </div>
              <h3 class="fw-bold text-dark mb-1">Healthcare Notes</h3>
              <p class="text-muted small mb-0">Please sign in to continue</p>
            </div>
            
            {isLogin() ? (
              <Login onLogin={onLogin} switchToSignup={() => setIsLogin(false)} />
            ) : (
              <Signup onSignup={(user) => user ? onLogin(user) : setIsLogin(true)} switchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
