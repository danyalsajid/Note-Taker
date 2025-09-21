import { createSignal } from 'solid-js';

export default function Login(props) {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [isLoading, setIsLoading] = createSignal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email() || !password()) return;
    
    setIsLoading(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      props.onLogin({ email: email(), password: password() });
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="mb-3">
        <label for="email" class="form-label fw-medium">Email</label>
        <input
          id="email"
          type="email"
          class="form-control"
          placeholder="Enter your email"
          value={email()}
          onInput={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label fw-medium">Password</label>
        <input
          id="password"
          type="password"
          class="form-control"
          placeholder="Enter your password"
          value={password()}
          onInput={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div class="d-grid mb-3">
        <button 
          type="submit" 
          class="btn btn-primary"
          disabled={isLoading() || !email() || !password()}
        >
          {isLoading() ? (
            <>
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </div>

      <div class="text-center">
        <a href="#" class="text-decoration-none">Forgot your password?</a>
      </div>
    </form>
  );
}
