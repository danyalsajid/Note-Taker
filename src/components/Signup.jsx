import { createSignal } from "solid-js";

export default function Signup({ onSignup, switchToLogin }) {
  const [formData, setFormData] = createSignal({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  const [loading, setLoading] = createSignal(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = formData();
    
    if (data.password !== data.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate signup API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Account created successfully! Please login.");
      onSignup();
    } catch (error) {
      console.error("Signup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="mb-3">
        <label for="name" class="form-label text-muted">
          <i class="bi bi-person me-2"></i>Full Name
        </label>
        <input
          type="text"
          class="form-control"
          id="name"
          placeholder="Enter your full name"
          value={formData().name}
          onInput={(e) => handleInputChange("name", e.target.value)}
          style="border-radius: 8px; padding: 12px;"
          required
        />
      </div>

      <div class="mb-3">
        <label for="username" class="form-label text-muted">
          <i class="bi bi-at me-2"></i>Username
        </label>
        <input
          type="text"
          class="form-control"
          id="username"
          placeholder="Choose a username"
          value={formData().username}
          onInput={(e) => handleInputChange("username", e.target.value)}
          style="border-radius: 8px; padding: 12px;"
          required
        />
      </div>
      
      <div class="mb-3">
        <label for="email" class="form-label text-muted">
          <i class="bi bi-envelope me-2"></i>Email
        </label>
        <input
          type="email"
          class="form-control"
          id="email"
          placeholder="Enter your email"
          value={formData().email}
          onInput={(e) => handleInputChange("email", e.target.value)}
          style="border-radius: 8px; padding: 12px;"
          required
        />
      </div>
      
      <div class="mb-3">
        <label for="role" class="form-label text-muted">
          <i class="bi bi-briefcase me-2"></i>Role
        </label>
        <select
          class="form-select"
          id="role"
          value={formData().role}
          onChange={(e) => handleInputChange("role", e.target.value)}
          style="border-radius: 8px; padding: 12px;"
          required
        >
          <option value="">Select your role</option>
          <option value="Doctor">Doctor</option>
          <option value="Nurse">Nurse</option>
          <option value="Administrator">Administrator</option>
          <option value="Clinician">Clinician</option>
        </select>
      </div>
      
      <div class="mb-3">
        <label for="password" class="form-label text-muted">
          <i class="bi bi-lock me-2"></i>Password
        </label>
        <input
          type="password"
          class="form-control"
          id="password"
          placeholder="Create a password"
          value={formData().password}
          onInput={(e) => handleInputChange("password", e.target.value)}
          style="border-radius: 8px; padding: 12px;"
          required
        />
      </div>
      
      <div class="mb-4">
        <label for="confirmPassword" class="form-label text-muted">
          <i class="bi bi-lock-fill me-2"></i>Confirm Password
        </label>
        <input
          type="password"
          class="form-control"
          id="confirmPassword"
          placeholder="Confirm your password"
          value={formData().confirmPassword}
          onInput={(e) => handleInputChange("confirmPassword", e.target.value)}
          style="border-radius: 8px; padding: 12px;"
          required
        />
      </div>
      
      <div class="d-grid mb-3">
        <button
          type="submit"
          class="btn btn-success py-2"
          style="border-radius: 8px; font-weight: 500;"
          disabled={loading()}
        >
          {loading() ? (
            <>
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Creating Account...
            </>
          ) : (
            <>
              <i class="bi bi-person-plus me-2"></i>
              Create Account
            </>
          )}
        </button>
      </div>

      <div class="text-center">
        <p class="text-muted mb-2">Already have an account?</p>
        <button
          type="button"
          class="btn btn-link text-primary p-0"
          onClick={switchToLogin}
          style="text-decoration: none; font-weight: 500;"
        >
          Sign In
        </button>
      </div>
    </form>
  );
}
