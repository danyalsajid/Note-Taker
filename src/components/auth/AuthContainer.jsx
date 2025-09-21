import { createSignal } from 'solid-js';
import Login from './Login';
import Signup from './Signup';

export default function AuthContainer(props) {
  const [isLogin, setIsLogin] = createSignal(true);

  return (
    <div class="min-vh-100 bg-primary d-flex align-items-center">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-lg-4">
            <div class="text-center text-white mb-4">
              <h1 class="display-6 fw-bold mb-2">Healthcare Notes</h1>
              <p class="lead opacity-75">Organize notes across your healthcare hierarchy</p>
            </div>
            
            <div class="card shadow-lg border-0">
              <div class="card-header bg-white border-0 p-0">
                <div class="auth-tabs-container">
                  <button 
                    class={`auth-tab ${isLogin() ? 'active' : ''}`}
                    onClick={() => setIsLogin(true)}
                  >
                    Login
                  </button>
                  <button 
                    class={`auth-tab ${!isLogin() ? 'active' : ''}`}
                    onClick={() => setIsLogin(false)}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <div class="card-body p-4">
                {isLogin() ? (
                  <Login onLogin={props.onLogin} />
                ) : (
                  <Signup onSignup={props.onSignup} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
