import { recipes } from "../recipes.js";

const searchInput = document.getElementById("search");
const resultsDiv = document.getElementById("results");

// Fonction pour afficher les recettes
function displayRecipes(recipesToShow, query) {
  resultsDiv.innerHTML = "";
  if (recipesToShow.length === 0) {
    resultsDiv.innerHTML = `<p>Aucune recette ne contient ${query} vous pouvez chercher tarte aux pommes », « poisson », etc. </p>`;
    return;
  }

  recipesToShow.slice(0, 10).forEach((recipe) => {
    const div = document.createElement("div");
    div.className = "recipe-card";
    div.innerHTML = `
    <div class="recipe-img">
      <img src="/JSON recipes/${recipe.image}" alt="${recipe.name}" />
      <span class="badge time">${recipe.time} min</span>
    </div>

    <div class="recipe-content">
      <h3 class="recipe-title">${recipe.name}</h3>

      <h4 class="section-title">Recette</h4>
      <p class="recipe-description">
        ${recipe.description.substring(0, 200)}...
      </p>

      <h4 class="section-title">Ingrédients</h4>
      <div class="ingredients">
        ${recipe.ingredients
          .map(
            (ing) => `
            <div>
              <strong>${ing.ingredient}</strong>
              <span>${ing.quantity ? ing.quantity : ""} ${
              ing.unit ? ing.unit : ""
            }</span>
            </div>
          `
          )
          .join("")}
      </div>
    </div>
  `;

    resultsDiv.appendChild(div);
  });
}

// Fonction de recherche
function searchRecipes(query) {
  query = query.toLowerCase();

  return recipes.filter((recipe) => {
    const inName = recipe.name.toLowerCase().includes(query);
    const inDescription = recipe.description.toLowerCase().includes(query);
    const inIngredients = recipe.ingredients.some((ing) =>
      ing.ingredient.toLowerCase().includes(query)
    );

    return inName || inDescription || inIngredients;
  });
}

// Écouteur sur l’input
searchInput.addEventListener("input", (e) => {
  const value = e.target.value.trim().replace(/[^\w\s]/gi, "");

  if (value.length >= 3) {
    const filtered = searchRecipes(value);
    displayRecipes(filtered, value);
  } else if (value.length === 0) {
    displayRecipes(recipes);
  }
});

// Affiche tout au départ
displayRecipes(recipes);
