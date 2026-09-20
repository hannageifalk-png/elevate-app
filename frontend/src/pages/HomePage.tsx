import elevateLogo from "../assets/elevate-logo.png";

function HomePage() {
  return (
    <main className="homePage">
    <header className="homeHeader">
        <img src={elevateLogo} alt="Elevate" />
    </header>


      <section className="membershipCards">

        <article className="membershipCard">
          <h2>FREE</h2>
          <p>Kom igång med din träning.</p>
          <p>Få tillgång till grundläggande funktioner.</p>
        </article>

        <article className="membershipCard">
          <h2>PRO</h2>
          <p>Steg 2: Få tillgång till träningsprogram,</p>
          <p>avancerad statistik och fler funktioner.</p>
        </article>

        <article className="membershipCard">
          <h2>ELITE</h2>
          <p>Hela paketet!</p>
          <p>Maximera din träning med fler program,</p>
          <p>djupare statistik och exklusiva funktioner.</p>
        </article>

      </section>


      <nav className="bottomNav">
        <button>Hem</button>
        <button>Statistik</button>
        <button>Play</button>
        <button>Uppslag</button>
        <button>Profil</button>
      </nav>
    </main>
  );
}

export default HomePage;