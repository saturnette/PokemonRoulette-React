import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import "./App.css";

const POKEMON_API = "https://pokeapi.co/api/v2/pokemon/";
import { FormatsData } from "./assets/pokemonND.ts";

const pokemonByTier = {
  Uber: [],
  OU: [],
  UU: [],
  RUBL: [],
  RU: [],
  NUBL: [],
  NU: [],
  PUBL: [],
  PU: [],
};

Object.entries(FormatsData).forEach(([name, data]) => {
  if (data.natDexTier && data.tier !== "LC" && data.tier !== "NFE") {
    const tier = data.natDexTier;
    if (pokemonByTier.hasOwnProperty(tier)) {
      pokemonByTier[tier].push(name.toLowerCase());
    }
  }
});

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const pokemonListRef = useRef(null);

  const fetchPokemonData = async (pokemonName) => {
    try {
      const response = await fetch(`${POKEMON_API}${pokemonName}`);
      if (!response.ok) {
        console.error(
          `Error fetching ${pokemonName}: API responded with ${response.status}`
        );
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${pokemonName}:`, error);
      return null;
    }
  };

  const getRandomUniquePokemon = async () => {
    setIsLoading(true);
    setError("");
    setPokemonList([]);
    const teamPokemon = [];

    try {
      let uberFound = false;
      const shuffledUber = [...pokemonByTier.Uber].sort(
        () => 0.5 - Math.random()
      );

      for (const pokemonName of shuffledUber) {
        const data = await fetchPokemonData(pokemonName);
        if (data) {
          teamPokemon.push({ ...data, tier: "Uber" });
          uberFound = true;
          break;
        }
      }

      if (!uberFound) {
        throw new Error(
          "No se pudo obtener un Pokémon Uber. Por favor, intenta de nuevo."
        );
      }

      const ruPokemon = [];
      const shuffledRU = [...pokemonByTier.RU].sort(() => 0.5 - Math.random());

      for (const pokemonName of shuffledRU) {
        if (
          teamPokemon.some(
            (p) => p.name.toLowerCase() === pokemonName.toLowerCase()
          )
        ) {
          continue;
        }

        const data = await fetchPokemonData(pokemonName);
        if (data) {
          ruPokemon.push({ ...data, tier: "RU" });

          if (ruPokemon.length >= 5) {
            break;
          }
        }
      }

      if (ruPokemon.length < 5) {
        throw new Error(
          `Solo se pudieron obtener ${ruPokemon.length} Pokémon RU de los 5 requeridos. Por favor, intenta de nuevo.`
        );
      }

      teamPokemon.push(...ruPokemon);

      if (teamPokemon.length !== 6) {
        throw new Error(
          `Se obtuvieron ${teamPokemon.length} Pokémon en lugar de 6. Por favor, intenta de nuevo.`
        );
      }

      setPokemonList(teamPokemon);
    } catch (error) {
      console.error("Error generating team:", error);
      setError(
        error.message ||
          "Error generando el equipo. Por favor, intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };


  const saveAsImage = () => {
    const scrollY = window.scrollY;

    html2canvas(pokemonListRef.current, {
      scrollY: -scrollY,
      useCORS: true,
      backgroundColor: "black",
    }).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, `pokemon-${teamName || "team"}.png`);
      });
    });
  };

  return (
    <div
      className="App"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <div>
        <h1 className="title">Nat-Dex Roulette</h1>
        <div className="center">
          <label>
            Equipo generado para:{" "}
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={isLoading}
            />
          </label>
        </div>
        <div className="center">
          <button
            onClick={getRandomUniquePokemon}
            disabled={isLoading}
            style={{ marginRight: "10px" }}
          >
            {isLoading ? "Generando..." : "Generar equipo"}
          </button>
          <button
            onClick={saveAsImage}
            disabled={isLoading || pokemonList.length === 0}
          >
            Guardar como imagen
          </button>
        </div>

        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Generando equipo Pokémon...</p>
          </div>
        )}

        {error && (
          <div
            className="error-message"
            style={{ color: "red", textAlign: "center", margin: "10px 0" }}
          >
            {error}
          </div>
        )}

        <div ref={pokemonListRef} className="pokemon-list">
          {pokemonList.length > 0 && (
            <div className="team-name">Team {teamName}</div>
          )}
          {pokemonList.map((pokemon, index) => (
            <div key={pokemon.id || index} className="pokemon-card">
              <img
                id={`pokemon-sprite-${index}`}
                src={
                  pokemon.sprites?.front_default ||
                  (pokemon.name === "zygarde-10" &&
                    pokemon.sprites?.front_shiny) ||
                  "placeholder.png"
                }
                alt={pokemon.name}
                style={{ width: "96px", height: "96px" }}
              />
              <p className="bold-text">
                {pokemon.name
                  .split("-")
                  .map((part, i) =>
                    i === 0
                      ? part.charAt(0).toUpperCase() + part.slice(1)
                      : `-${part.charAt(0).toUpperCase() + part.slice(1)}`
                  )
                  .join("")}{" "}
              </p>
            </div>
          ))}
        </div>
      </div>
      <footer style={{ textAlign: "center", marginTop: "auto" }}>
        <h2>/saturno.ette</h2>
      </footer>
    </div>
  );
}

export default App;
