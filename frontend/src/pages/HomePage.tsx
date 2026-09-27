import elevateLogo from "../assets/elevate-logo-transparent.png";
import "./HomePage.css";
import "./HomePage.css";

function HomePage() {
  return (
    <main className="homePage">

      <header className="homeHeader">
        <img src={elevateLogo} alt="Elevate" />
      </header>

      <section className="welcomeSection">
        <h1>Hej!</h1>
        <p>Vad vill du träna idag?</p>
      </section>

      <section className="dailyWorkout">
        <h2>Dagens pass</h2>
        <h3>Full Body</h3>
          <p>6 övningar · 45 min</p>
          <button>SE PASS →</button>
      </section>

      <section className="exploreSection">
        <h2>Utforska träning</h2>

        <div className="exploreGrid">
          <article>
            <h3>Övningar</h3>
            <p>Hitta nya övningar</p>
          </article>

          <article>
            <h3>Träningsprogram</h3>
            <p>Hitta ett program för dig</p>
          </article>

          <article>
            <h3>Träningspass</h3>
            <p>Välj ett pass att köra</p>
          </article>
        </div>
      </section>

      <section className="recentWorkouts">
        <h2>Senaste träning</h2>
        <p>Här visas dina senaste träningspass.</p>
      </section>

      <section className="premiumSection">
        <h2>Mer för dig</h2>

        <article className="lockedCard">
          <h3>Din detaljerade statistik</h3>
          <p>🔒 Uppgradera ditt medlemskap för att se mer.</p>
          <button>UPPGRADERA</button>
        </article>

        <article className="lockedCard">
          <h3>Artiklar & träning</h3>
          <p>🔒 Upptäck mer innehåll med ett uppgraderat medlemskap.</p>
          <button>UPPGRADERA</button>
        </article>
      </section>

    </main>
  );
}

export default HomePage;