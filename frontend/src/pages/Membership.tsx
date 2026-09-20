import { useAuth } from "../context/AuthContext";
import { MEMBERSHIP_NAMES } from "../constants/membership";
import { useState } from "react";
import { supabase } from "../lib/supabase";

function Membership(){
    const { user, profile, refreshProfile } = useAuth();
    
    const [selectedTier, setSelectedTier] = useState<number | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");

    const [receipt, setReceipt] = useState<{
        transactionId: string;
        tier: number;
        date: string;
        } | null>(null);

    const handlePayment = async () => {
    if (!user || selectedTier === null) {
        return;
    }

    if (!profile || selectedTier <= profile.role) {
        setPaymentMessage(
            "Du kan endast uppgradera till en högre medlemsnivå."
        );
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
    const { error: updateError } = await supabase
        .from("app_user")
        .update({ role: selectedTier })
        .eq("id", user.id);

        
        if (updateError) {
            console.error(
                "Medlemskapet kunde inte uppdateras:",
                updateError.message
            );
            setPaymentMessage(
                "Betalningen genomfördes, men medlemskapet kunde inte uppdateras."
            );
            return;
        }
    
    await refreshProfile();

    setReceipt({
        transactionId,
        tier: selectedTier,
        date: new Date().toLocaleString("sv-SE"),
    });

    setSelectedTier(null);
    setShowPayment(false);

    setPaymentMessage("Betalningen genomfördes!");

    };

return ( 
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
            <button disabled>
            {profile?.role === 0
                ? "Ditt medlemskap"
                : "Ingår i ditt medlemskap"}
            </button>
        </section>

        <section>
            <h2>Standard</h2>
            <p>29 kr</p>
            <p>Få tillgång till fler funktioner och träningsmöjligheter.</p>
            <button
            onClick={() => setSelectedTier(1)}
            disabled={!profile || profile.role >= 1}
            >
            {profile?.role === 1
                ? "Ditt medlemskap"
                : profile && profile.role > 1
                ? "Ingår i ditt medlemskap"
                : "Välj Standard"}
            </button>
        </section>

        <section>
            <h2>Premium</h2>
            <p>99 kr</p>
            <p>Få tillgång till hela Elevates utbud och se din statistik.</p>
            <button
            onClick={() => setSelectedTier(2)}
            disabled={!profile || profile.role >= 2}
            >
            {profile?.role === 2
                ? "Ditt medlemskap"
                : profile && profile.role > 2
                ? "Ingår i ditt medlemskap"
                : "Välj Premium"}
            </button>
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
    )
}
    {receipt && (
        <section>
            <h2>Kvitto</h2>

            <p>Medlemskap: {MEMBERSHIP_NAMES[receipt.tier]}</p>
            <p>Pris: {receipt.tier === 1 ? "29 kr" : "99 kr"}</p>
            <p>Betalningsmetod: Testbetalning</p>
            <p>Datum: {receipt.date}</p>
            <p>Transaktions-ID: {receipt.transactionId}</p>
            <p>Tack för ditt köp!</p>
        </section>
    )}
</main>
)}

export default Membership;