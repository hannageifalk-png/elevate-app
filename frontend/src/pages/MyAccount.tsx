import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

type Purchase = {
  id: string;
  tier: number;
  product_name: string;
  price: number;
  currency: string;
  provider: string;
  provider_transaction_id: string;
  purchased_at: string;
};

function MyAccount() {
  const { profile } = useAuth();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [openReceiptId, setOpenReceiptId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    const fetchPurchases = async () => {
      const { data, error } = await supabase
        .from("purchase")
        .select(
          "id, tier, product_name, price, currency, provider, provider_transaction_id, purchased_at"
        )
        .eq("user_id", profile.id)
        .order("purchased_at", { ascending: false });

      if (error) {
        console.error("Kunde inte hämta kvitton:", error);
        return;
      }

      setPurchases(data ?? []);
    };

    fetchPurchases();
  }, [profile]);


  if (!profile) {
    return <p>Laddar...</p>;
  }

  return (
  <main className="my-account">
    <section className="account-header">
      <p className="account-eyebrow">Konto</p>
      <h1>Mitt konto</h1>

      <div className="account-info">
        <div>
          <span>Namn</span>
          <strong>{profile.display_name}</strong>
        </div>

        <div>
          <div>
          <span>Medlemskap</span>
          <strong>
            {profile.role === 0
              ? "Gratis"
              : profile.role === 1
              ? "Standard"
              : profile.role === 2
              ? "Premium"
              : "Admin"}
          </strong>
        </div>
          <strong>
            {new Date(profile.created_at).toLocaleDateString("sv-SE")}
          </strong>
        </div>
      </div>
    </section>

    <section className="receipts-section">
      <div className="receipts-heading">
        <p>Köphistorik</p>
        <h2>Mina kvitton</h2>
      </div>

      {purchases.length === 0 ? (
        <p>Du har inga kvitton ännu.</p>
      ) : (
        <div className="receipt-list">
          {purchases.map((purchase) => (
            <article className="receipt-card" key={purchase.id}>
              <div className="receipt-summary">
                <div>
                  <h3>{purchase.product_name}</h3>
                  <p>
                    {new Date(purchase.purchased_at).toLocaleDateString(
                      "sv-SE"
                    )}
                  </p>
                </div>

                <strong>
                  {purchase.price} {purchase.currency}
                </strong>
              </div>

              <button
                className="receipt-button"
                onClick={() =>
                  setOpenReceiptId(
                    openReceiptId === purchase.id ? null : purchase.id
                  )
                }
              >
                {openReceiptId === purchase.id
                  ? "Dölj kvitto"
                  : "Visa kvitto"}
              </button>

              {openReceiptId === purchase.id && (
                <div className="receipt-details">
                  <h4>Kvitto</h4>
                  <p>Produkt: {purchase.product_name}</p>
                  <p>
                    Pris: {purchase.price} {purchase.currency}
                  </p>
                  <p>
                    Betalningsmetod:{" "}
                    {purchase.provider === "mock"
                      ? "Testbetalning"
                      : purchase.provider}
                  </p>
                  <p>
                    Transaktions-ID: {purchase.provider_transaction_id}
                  </p>
                  <p>
                    Köpdatum:{" "}
                    {new Date(
                      purchase.purchased_at
                    ).toLocaleDateString("sv-SE")}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  </main>
  );
} 

export default MyAccount;