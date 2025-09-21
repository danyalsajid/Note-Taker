import { createSignal } from 'solid-js';

export default function Signup(props) {
  const [formData, setFormData] = createSignal({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });
  const [isLoading, setIsLoading] = createSignal(false);
  const [errors, setErrors] = createSignal({});

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors()[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const data = formData();

    if (!data.name.trim()) newErrors.name = 'Name is required';
    if (!data.email.trim()) newErrors.email = 'Email is required';
    if (!data.password) newErrors.password = 'Password is required';
    if (data.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate signup process
    setTimeout(() => {
      setIsLoading(false);
      props.onSignup(formData());
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div class="mb-3">
        <label for="name" class="form-label fw-medium">Full Name</label>
        <input
          id="name"
          type="text"
          class={`form-control ${errors().name ? 'is-invalid' : ''}`}
          placeholder="Enter your full name"
          value={formData().name}
          onInput={(e) => updateFormData('name', e.target.value)}
          required
        />
        {errors().name && <div class="invalid-feedback">{errors().name}</div>}
      </div>

      <div class="mb-3">
        <label for="signup-email" class="form-label fw-medium">Email</label>
        <input
          id="signup-email"
          type="email"
          class={`form-control ${errors().email ? 'is-invalid' : ''}`}
          placeholder="Enter your email"
          value={formData().email}
          onInput={(e) => updateFormData('email', e.target.value)}
          required
        />
        {errors().email && <div class="invalid-feedback">{errors().email}</div>}
      </div>

      <div class="mb-3">
        <label for="signup-password" class="form-label fw-medium">Password</label>
        <input
          id="signup-password"
          type="password"
          class={`form-control ${errors().password ? 'is-invalid' : ''}`}
          placeholder="Enter your password"
          value={formData().password}
          onInput={(e) => updateFormData('password', e.target.value)}
          required
        />
        {errors().password && <div class="invalid-feedback">{errors().password}</div>}
      </div>

      <div class="mb-3">
        <label for="confirm-password" class="form-label fw-medium">Confirm Password</label>
        <input
          id="confirm-password"
          type="password"
          class={`form-control ${errors().confirmPassword ? 'is-invalid' : ''}`}
          placeholder="Confirm your password"
          value={formData().confirmPassword}
          onInput={(e) => updateFormData('confirmPassword', e.target.value)}
          required
        />
        {errors().confirmPassword && <div class="invalid-feedback">{errors().confirmPassword}</div>}
      </div>

      <div class="mb-3">
        <label for="role" class="form-label fw-medium">Role</label>
        <select
          id="role"
          class="form-select"
          value={formData().role}
          onChange={(e) => updateFormData('role', e.target.value)}
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
          <option value="Doctor">Doctor</option>
          <option value="Nurse">Nurse</option>
        </select>
      </div>

      <div class="d-grid">
        <button 
          type="submit" 
          class="btn btn-primary"
          disabled={isLoading()}
        >
          {isLoading() ? (
            <>
              <span class="spinner-border spinner-border-sm me-2" role="status"></span>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </form>
  );
}
