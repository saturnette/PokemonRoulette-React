import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import "./App.css";

const POKEMON_API = "https://pokeapi.co/api/v2/pokemon/";
import POKEMON_ND_LIST from "./assets/pokemonND.json";

const lowercasePokemonNames = POKEMON_ND_LIST.pokemonND.map((pokemon) =>
  pokemon.name.toLowerCase()
);

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [teamName, setTeamName] = useState("");
  const pokemonListRef = useRef(null);

  const getRandomUniquePokemon = async () => {
    const uniquePokemonSet = new Set();
    while (uniquePokemonSet.size < 6) {
      const randomIndex = Math.floor(
        Math.random() * lowercasePokemonNames.length
      );
      uniquePokemonSet.add(lowercasePokemonNames[randomIndex]);
    }

    const promises = Array.from(uniquePokemonSet).map(async (name) => {
      const response = await fetch(`${POKEMON_API}${name}`);
      const data = await response.json();
      return data;
    });

    const newPokemonList = await Promise.all(promises);
    setPokemonList(newPokemonList);
  };

  function getTierByName(pokemonName) {
    const lowercasePokemonName = pokemonName.toLowerCase();
    const foundPokemon = POKEMON_ND_LIST.pokemonND.find(
      (jsonPokemon) => jsonPokemon.name.toLowerCase() === lowercasePokemonName
    );
    return foundPokemon
      ? foundPokemon.Tier
      : "No se encontró el Pokémon en el JSON";
  }

  const saveAsImage = () => {
    const scrollY = window.scrollY;

    html2canvas(pokemonListRef.current, {
      scrollY: -scrollY,
      useCORS: true,
      backgroundColor: "black",
    }).then((canvas) => {
      canvas.toBlob((blob) => {
        saveAs(blob, `pokemon-${teamName}.png`);
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
            />
          </label>
        </div>
        <div className="center">
          <button onClick={getRandomUniquePokemon}>Generar equipo</button>
          <button onClick={saveAsImage}>Guardar como imagen</button>
        </div>
        <div ref={pokemonListRef} className="pokemon-list">
          <div className="team-name">Team {teamName}</div>
          {pokemonList.map((pokemon, index) => (
            <div key={pokemon.id} className="pokemon-card">
              <img
                id={`pokemon-sprite-${index}`}
                src={
                  pokemon.name === "zygarde-10"
                    ? pokemon.sprites.front_shiny
                    : pokemon.sprites.front_default
                }
                alt={pokemon.name}
                style={{ width: "96px", height: "96px" }}
              />
              <p className="bold-text">
                {pokemon.name
                  .split("-")
                  .map((part, index) =>
                    index === 0
                      ? part.charAt(0).toUpperCase() + part.slice(1)
                      : `-${part.charAt(0).toUpperCase() + part.slice(1)}`
                  )
                  .join("")}{" "}
              </p>

              <span
                className={`tier-badge ${getTierByName(
                  pokemon.name.toLowerCase()
                ).toLowerCase()}-badge`}
              >
                {getTierByName(pokemon.name.toLowerCase())}
              </span>
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
