import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Logged in!");
  };

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}

      <p>
        Don't have an account?{" "}
        <Link to="/register">Create account</Link>
      </p>
    </main>
  );
}

export default Login;