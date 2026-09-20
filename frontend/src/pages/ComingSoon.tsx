import { Link } from "react-router-dom";

type ComingSoonProps = {
  title: string;
};

function ComingSoon({ title }: ComingSoonProps) {
  return (
    <main>
      <h1>{title}</h1>

      <section>
        <p>Coming soon</p>
      </section>

      <Link to="/traning">← Tillbaka till Träning</Link>
    </main>
  );
}

export default ComingSoon;
