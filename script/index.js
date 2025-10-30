import { recipes } from "../recipes.js";

const searchInput = document.getElementById("search");
const resultsDiv = document.getElementById("results");

const ingredientsList = document.getElementById("ingredients-list");
const appliancesList = document.getElementById("appliances-list");
const ustensilsList = document.getElementById("ustensils-list");

const tagsContainer = document.getElementById("tags-container");

let selectedTags = [];

// fonction qui affiche les recettes
function displayRecipes(recipesToShow, query = "") {
  resultsDiv.innerHTML = "";

  if (recipesToShow.length === 0) {
    resultsDiv.innerHTML = `<p>Aucune recette ne contient « ${query} », vous pouvez chercher « tarte aux pommes », « poisson », etc.</p>`;
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

// Liste des filtres avancés
function updateAdvancedFilters(recipesList) {
  const ingredientsSet = new Set();
  const appliancesSet = new Set();
  const ustensilsSet = new Set();

  recipesList.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => ingredientsSet.add(ing.ingredient));
    appliancesSet.add(recipe.appliance);
    recipe.ustensils.forEach((u) => ustensilsSet.add(u));
  });

  displayFilterOptions(
    "ingredient",
    Array.from(ingredientsSet),
    ingredientsList
  );
  displayFilterOptions("appliance", Array.from(appliancesSet), appliancesList);
  displayFilterOptions("ustensil", Array.from(ustensilsSet), ustensilsList);
}

function displayFilterOptions(type, list, container) {
  container.innerHTML = list
    .map((item) => `<li class="filter-option" data-type="${type}">${item}</li>`)
    .join("");
}

function wireFilterList(container, type) {
  container.addEventListener("click", (e) => {
    const li = e.target.closest(".filter-option");
    if (!li || !container.contains(li)) return;

    addTag(li.textContent.trim(), type);

    const filterEl = container.closest(".filter");
    if (filterEl) {
      filterEl.classList.remove("open");

      const searchField = filterEl.querySelector(".filter-search");
      if (searchField) {
        searchField.value = "";
      }
      filterEl
        .querySelectorAll(".filter-list li")
        .forEach((li) => (li.style.display = ""));
    }
  });
}

wireFilterList(ingredientsList, "ingredient");
wireFilterList(appliancesList, "appliance");
wireFilterList(ustensilsList, "ustensil");

function addTag(value, type) {
  value = value.toLowerCase();

  if (!selectedTags.find((t) => t.value === value)) {
    selectedTags.push({ value, type });
    displayTags();
    filterWithTags();
  }
}

function displayTags() {
  tagsContainer.innerHTML = selectedTags
    .map(
      (t) => `
      <div class="tag ${t.type}">
     <p>${t.value}</p>
        <button class="remove-tag" data-value="${t.value}"><svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.0833 11.0833L6.08331 6.08334M6.08331 6.08334L1.08331 1.08334M6.08331 6.08334L11.0833 1.08334M6.08331 6.08334L1.08331 11.0833" stroke="#1B1B1B" stroke-width="2.16667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        </button>
      </div>`
    )
    .join("");

  document.querySelectorAll(".remove-tag").forEach((btn) => {
    btn.addEventListener("click", () => removeTag(btn.dataset.value));
  });
}

function removeTag(value) {
  selectedTags = selectedTags.filter((t) => t.value !== value);
  displayTags();
  filterWithTags();
}

// Système de filtrage complet
function filterWithTags() {
  let filtered = [...recipes];

  // Filtrage par tags
  if (selectedTags.length > 0) {
    selectedTags.forEach((tag) => {
      if (tag.type === "ingredient") {
        filtered = filtered.filter((r) =>
          r.ingredients.some(
            (i) => i.ingredient.toLowerCase() === tag.value.toLowerCase()
          )
        );
      } else if (tag.type === "appliance") {
        filtered = filtered.filter(
          (r) => r.appliance.toLowerCase() === tag.value.toLowerCase()
        );
      } else if (tag.type === "ustensil") {
        filtered = filtered.filter((r) =>
          r.ustensils
            .map((u) => u.toLowerCase())
            .includes(tag.value.toLowerCase())
        );
      }
    });
  }

  // Filtrage par champ principal
  const query = searchInput.value.trim().toLowerCase();
  if (query.length >= 3) {
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.ingredients.some((i) => i.ingredient.toLowerCase().includes(query))
    );
  }

  displayRecipes(filtered, query);
  updateAdvancedFilters(filtered);
}

// recherche principale
searchInput.addEventListener("input", () => {
  filterWithTags();
});

// dropdown menus
document.querySelectorAll(".filter-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const parent = btn.closest(".filter");
    parent.classList.toggle("open");

    // Ferme les autres filtres
    document.querySelectorAll(".filter").forEach((f) => {
      if (f !== parent) f.classList.remove("open");
    });
  });
});

// recherche dans la liste des filtres
document.querySelectorAll(".filter-search").forEach((input) => {
  input.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();
    const list = e.target.nextElementSibling; // ul juste après

    list.querySelectorAll("li").forEach((li) => {
      const text = li.textContent.toLowerCase();
      li.style.display = text.includes(value) ? "block" : "none";
    });
  });
});

// intialisation
displayRecipes(recipes);
updateAdvancedFilters(recipes);
