import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

function Register () {
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setmessage] = useState("");

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setmessage("");

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: displayName,
            },
        },
    });

    if (error) {
        setmessage(error.message);
        return;
    }

    setmessage("Konto skapat!");
    };

    return (
        <main>
            <h1>Skapa konto</h1>

            <form onSubmit={handleRegister}>
                <div>
                    <label htmlFor="displayName">Namn</label>
                    <input 
                        id="displayName"
                        type="text"     
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required 
                        />
                </div>

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
                    <label htmlFor="password">Lösenord</label>
                     <input 
                        id="password"
                        type="password"     
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        />
                </div>

                <button type="submit">Skapa konto</button>
            </form>

            <p>
            Har du redan ett konto? <Link to="/login">Logga in</Link>
            </p>

            {message && <p>{message}</p>}
        </main>
    )
}

export default Register;