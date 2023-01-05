import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";
import { async } from "q";

const appTitle = "FactHive";

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        let query = supabase.from("FactHiveFacts").select("*");

        if (currentCategory != "all") {
          query = query.eq("category", currentCategory);
        }

        const { data: FactHiveFacts, error } = await query
          .order("votes_like", { ascending: false })
          .limit(1000);

        if (!error) {
          setFacts(FactHiveFacts);
        } else {
          alert("Something Went Wrong!");
        }

        setIsLoading(false);
      }
      getFacts();
    },
    [currentCategory]
  );

  return (
    <>
      {/* HEADER */}
      <Header showForm={showForm} setShowForm={setShowForm} />

      {/* FACT FORM */}
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        {/* SIDEBAR */}
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {/* Load Facts */}
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="Today I learned" />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

// List of Categories
const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function isValidUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    // Prevent the browser reload
    e.preventDefault();

    // check if data is valid. if so create a new fact
    if (text && isValidUrl(source) && category && textLength <= 200) {
      //Upload fact to supabase and recieve the new fact object
      setIsUploading(true);

      const { data: newFact, error } = await supabase
        .from("FactHiveFacts")
        .insert([{ fact_text: text, source: source, category: category }])
        .select();

      setIsUploading(false);

      // console.log(newFact);

      // add the fact to UI
      if (!error) {
        setFacts((facts) => [newFact[0], ...facts]);
      }

      // reset the input fields
      setText("");
      setSource("");
      setCategory("");

      // close the form
      setShowForm(false);
    } else {
      // Handeling issues
      if (!isValidUrl(source)) {
        alert("Source is Not valid!");
      } else if (!text) {
        alert("Write a fact before posting!");
      } else if (!category) {
        alert("Please select a category!");
      } else if (textLength > 200) {
        alert("Please make sure to write the fact in under 200 characters!");
      } else {
        alert("Something Went Wrong!");
      }
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      {/* <!-- CHARACTER LIMIT COUNT --> */}
      <span>{200 - textLength}</span>
      {/* <!-- SOURCE INPUT --> */}
      <input
        type="text"
        placeholder="Source..."
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      {/* <!-- CATEGORY OPTION --> */}
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
        disabled={isUploading}
      </select>
      {/* <!-- SUBMIT BUTTON --> */}
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => {
              setCurrentCategory("all");
            }}
          >
            All
          </button>
        </li>

        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => {
                setCurrentCategory(cat.name);
              }}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length == 0) {
    return <p>No facts for this category yet! Create the first One✌️</p>;
  }

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} factObj={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>
        There {facts.length == 1 ? `is only` : `are`} {facts.length}{" "}
        {facts.length == 1 ? `fact` : `facts`} for this category. Add you Own!
      </p>
    </section>
  );
}

function Fact({ factObj, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    factObj.votes_like + factObj.votes_amazing < factObj.votes_false;

  async function handleVote(vote) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("FactHiveFacts")
      .update({ [vote]: factObj[vote] + 1 })
      .eq("id", factObj.id)
      .select();

    // setIsUpdating(false);

    // console.log(updatedFact);
    if (!error) {
      setFacts((facts) =>
        facts.map((f) => (f.id == factObj.id ? updatedFact[0] : f))
      );
    }
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[👎DISPUTED]</span> : null}
        {factObj.fact_text}
        <a className="source" href={factObj.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find(
            (cat) => cat.name === factObj.category
          ).color,
        }}
      >
        {factObj.category}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handleVote("votes_like")} disabled={isUpdating}>
          👍 {factObj.votes_like}
        </button>
        <button
          onClick={() => handleVote("votes_amazing")}
          disabled={isUpdating}
        >
          🤯 {factObj.votes_amazing}
        </button>
        <button onClick={() => handleVote("votes_false")} disabled={isUpdating}>
          ⛔ {factObj.votes_false}
        </button>
      </div>
    </li>
  );
}

export default App;
