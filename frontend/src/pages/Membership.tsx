import { useAuth } from "../context/AuthContext";
import { MEMBERSHIP_NAMES } from "../constants/membership";
import { useState } from "react";
import { supabase } from "../lib/supabase";

function Membership(){
    const { user, profile } = useAuth();
    
    const [selectedTier, setSelectedTier] = useState<number | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");

    const handlePayment = async () => {
  if (!user || selectedTier === null) {
    return;
  }

  setPaymentMessage("Behandlar betalningen...");

  const transactionId = crypto.randomUUID();

  const { error } = await supabase
    .from("purchase")
    .insert({
      user_id: user.id,
      tier: selectedTier,
      provider: "mock",
      provider_transaction_id: transactionId,
    });

  if (error) {
    console.error("Betalningen misslyckades:", error.message);
    setPaymentMessage("Betalningen kunde inte genomföras.");
    return;
  }

  setPaymentMessage("Betalningen genomfördes!");
};

return(
     <main>
        <h1>Medlemskap</h1>

        <p>
            Ditt medlemskap:{" "}
            {profile
                ? MEMBERSHIP_NAMES[profile.role]
                : "Laddar..."}
                </p>

        <section>
            <h2>Gratis</h2>
            <p>0 kr</p>                
            <p>Kom igång med Elevate utan kostnad.</p>
            <button>Välj Gratis</button>
        </section>

        <section>
            <h2>Standard</h2>
            <p>29 kr</p>
            <p>Få tillgång till fler funktioner och träningsmöjligheter.</p>
            <button onClick={() => setSelectedTier(1)}>Välj Standard</button>
        </section>

        <section>
            <h2>Premium</h2>
            <p>99 kr</p>
            <p>Få tillgång till hela Elevates utbud och se din statistik.</p>
            <button onClick={() => setSelectedTier(2)}>Välj Premium</button>
        </section>

    {selectedTier !== null && (
    <section>
        <h2>Bekräfta ditt val</h2>

        <p>
        Du har valt medlemskapet{" "}
        {MEMBERSHIP_NAMES[selectedTier]}.
        </p>

        <button onClick={() => setShowPayment(true)}>
            Fortsätt till betalning
        </button>

        {showPayment && selectedTier !== null && (
        <section>
            <h2>Betalning</h2>

            <p>
            Medlemskap: {MEMBERSHIP_NAMES[selectedTier]}
            </p>

            <p>
            Pris: {selectedTier === 1 ? "29 kr" : "99 kr"}
            </p>

            <label>
            Kortnummer
            <input
                type="text"
                placeholder="1234 5678 9012 3456"
            />
            </label>

            <label>
            Giltighetstid
            <input
                type="text"
                placeholder="MM/ÅÅ"
            />
            </label>

            <label>
            CVC
            <input
                type="text"
                placeholder="123"
            />
            </label>

            <button onClick={handlePayment}>Genomför betalning</button>

            {paymentMessage && <p>{paymentMessage}</p>}
            </section>
        )}
    </section>  
    )}
</main>
)}

export default Membership;