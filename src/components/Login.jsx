import { createSignal } from "solid-js";
import apiService from "../services/api";

export default function Login({ onLogin, switchToSignup }) {
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [showPassword, setShowPassword] = createSignal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username().trim() || !password().trim()) {
      alert("Please enter both username and password");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await apiService.login(username().trim(), password().trim());
      console.log("Login successful:", response);
      onLogin(response.user);
    } catch (error) {
      console.error("Login failed:", error);
      alert(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword());
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="mb-3">
        <label for="username" class="form-label text-muted">
          <i class="bi bi-person me-2"></i>Username
        </label>
        <input
          type="text"
          class="form-control"
          id="username"
          placeholder="Enter your username"
          value={username()}
          onInput={(e) => setUsername(e.target.value)}
          style="border-radius: 8px; padding: 12px;"
          required
        />
      </div>
      
      <div class="mb-4">
        <label for="password" class="form-label text-muted">
          <i class="bi bi-lock me-2"></i>Password
        </label>
        <div class="position-relative">
          <input
            type={showPassword() ? "text" : "password"}
            class="form-control"
            id="password"
            placeholder="Enter your password"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
            style="border-radius: 8px; padding: 12px; padding-right: 45px;"
            required
          />
          <i 
            class={`bi ${showPassword() ? 'bi-eye-slash' : 'bi-eye'} position-absolute top-50 end-0 translate-middle-y me-3 text-muted`}
            style="cursor: pointer;"
            onClick={togglePasswordVisibility}
            title={showPassword() ? "Hide password" : "Show password"}
          ></i>
        </div>
      </div>
      
      <div class="d-grid mb-3">
        <button
          type="submit"
          class="btn btn-primary py-2"
          style="border-radius: 8px; font-weight: 500;"
          disabled={loading()}
        >
          {loading() ? (
            <>
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Signing In...
            </>
          ) : (
            <>
              <i class="bi bi-box-arrow-in-right me-2"></i>
              Sign In
            </>
          )}
        </button>
      </div>

      <div class="text-center">
        <p class="text-muted mb-2">Don't have an account?</p>
        <button
          type="button"
          class="btn btn-link text-primary p-0"
          onClick={switchToSignup}
          style="text-decoration: none; font-weight: 500;"
        >
          Create Account
        </button>
      </div>

      <div class="mt-4 pt-3 border-top">
        <p class="text-muted small mb-2 fw-bold">Demo Credentials:</p>
        <p class="text-muted small mb-1">
          <strong>Admin:</strong> admin / Test@123
        </p>
        <p class="text-muted small mb-0">
          <strong>Clinician:</strong> clinician / Test@123
        </p>
      </div>
    </form>
  );
}
