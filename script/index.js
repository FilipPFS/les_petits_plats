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

  for (let i = 0; i < Math.min(recipesToShow.length, 10); i++) {
    const recipe = recipesToShow[i];

    let ingredientsHTML = "";
    for (let j = 0; j < recipe.ingredients.length; j++) {
      const ing = recipe.ingredients[j];
      ingredientsHTML += `
        <div>
          <strong>${ing.ingredient}</strong>
          <span>${ing.quantity ? ing.quantity : ""} ${
        ing.unit ? ing.unit : ""
      }</span>
        </div>
      `;
    }

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
        <p class="recipe-description">${recipe.description.substring(
          0,
          200
        )}...</p>
        <h4 class="section-title">Ingrédients</h4>
        <div class="ingredients">${ingredientsHTML}</div>
      </div>
    `;
    resultsDiv.appendChild(div);
  }
}

// Liste des filtres avancés
function updateAdvancedFilters(recipesList) {
  const ingredientsSet = new Set();
  const appliancesSet = new Set();
  const ustensilsSet = new Set();

  for (let i = 0; i < recipesList.length; i++) {
    const recipe = recipesList[i];
    for (let j = 0; j < recipe.ingredients.length; j++) {
      ingredientsSet.add(recipe.ingredients[j].ingredient);
    }
    appliancesSet.add(recipe.appliance);
    for (let k = 0; k < recipe.ustensils.length; k++) {
      ustensilsSet.add(recipe.ustensils[k]);
    }
  }

  displayFilterOptions(
    "ingredient",
    Array.from(ingredientsSet),
    ingredientsList
  );
  displayFilterOptions("appliance", Array.from(appliancesSet), appliancesList);
  displayFilterOptions("ustensil", Array.from(ustensilsSet), ustensilsList);
}

function displayFilterOptions(type, list, container) {
  let html = "";
  for (let i = 0; i < list.length; i++) {
    html += `<li class="filter-option" data-type="${type}">${list[i]}</li>`;
  }
  container.innerHTML = html;
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

      const lis = filterEl.querySelectorAll(".filter-list li");
      for (let i = 0; i < lis.length; i++) {
        lis[i].style.display = "";
      }
    }
  });
}

wireFilterList(ingredientsList, "ingredient");
wireFilterList(appliancesList, "appliance");
wireFilterList(ustensilsList, "ustensil");

function addTag(value, type) {
  value = value.toLowerCase();

  let exists = false;
  for (let i = 0; i < selectedTags.length; i++) {
    if (selectedTags[i].value === value) {
      exists = true;
      break;
    }
  }

  if (!exists) {
    selectedTags.push({ value, type });
    displayTags();
    filterWithTags();
  }
}

function displayTags() {
  let html = "";
  for (let i = 0; i < selectedTags.length; i++) {
    const t = selectedTags[i];
    html += `
      <div class="tag ${t.type}">
        <p>${t.value}</p>
        <button class="remove-tag" data-value="${t.value}">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.0833 11.0833L6.08331 6.08334M6.08331 6.08334L1.08331 1.08334M6.08331 6.08334L11.0833 1.08334M6.08331 6.08334L1.08331 11.0833" stroke="#1B1B1B" stroke-width="2.16667" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    `;
  }

  tagsContainer.innerHTML = html;

  const buttons = document.querySelectorAll(".remove-tag");
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", () =>
      removeTag(buttons[i].dataset.value)
    );
  }
}

function removeTag(value) {
  const newTags = [];
  for (let i = 0; i < selectedTags.length; i++) {
    if (selectedTags[i].value !== value) {
      newTags.push(selectedTags[i]);
    }
  }
  selectedTags = newTags;
  displayTags();
  filterWithTags();
}

// Système de filtrage complet
function filterWithTags() {
  let filtered = [];
  for (let i = 0; i < recipes.length; i++) {
    filtered.push(recipes[i]);
  }

  // Filtrage par tags
  if (selectedTags.length > 0) {
    for (let t = 0; t < selectedTags.length; t++) {
      const tag = selectedTags[t];
      const newFiltered = [];

      for (let i = 0; i < filtered.length; i++) {
        const r = filtered[i];
        let match = false;

        if (tag.type === "ingredient") {
          for (let j = 0; j < r.ingredients.length; j++) {
            if (r.ingredients[j].ingredient.toLowerCase() === tag.value) {
              match = true;
              break;
            }
          }
        } else if (tag.type === "appliance") {
          if (r.appliance.toLowerCase() === tag.value) match = true;
        } else if (tag.type === "ustensil") {
          for (let j = 0; j < r.ustensils.length; j++) {
            if (r.ustensils[j].toLowerCase() === tag.value) {
              match = true;
              break;
            }
          }
        }

        if (match) newFiltered.push(r);
      }

      filtered = newFiltered;
    }
  }

  // Filtrage par champ principal
  const query = searchInput.value.trim().toLowerCase();
  if (query.length >= 3) {
    const newFiltered = [];
    for (let i = 0; i < filtered.length; i++) {
      const r = filtered[i];
      let match =
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query);

      if (!match) {
        for (let j = 0; j < r.ingredients.length; j++) {
          if (r.ingredients[j].ingredient.toLowerCase().includes(query)) {
            match = true;
            break;
          }
        }
      }

      if (match) newFiltered.push(r);
    }

    filtered = newFiltered;
  }

  displayRecipes(filtered, query);
  updateAdvancedFilters(filtered);
}

// recherche principale
searchInput.addEventListener("input", () => {
  filterWithTags();
});

// dropdown menus
const toggles = document.querySelectorAll(".filter-toggle");
for (let i = 0; i < toggles.length; i++) {
  toggles[i].addEventListener("click", () => {
    const parent = toggles[i].closest(".filter");
    parent.classList.toggle("open");

    const filters = document.querySelectorAll(".filter");
    for (let j = 0; j < filters.length; j++) {
      if (filters[j] !== parent) filters[j].classList.remove("open");
    }
  });
}

// recherche dans la liste des filtres
const filterInputs = document.querySelectorAll(".filter-search");
for (let i = 0; i < filterInputs.length; i++) {
  filterInputs[i].addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();
    const list = e.target.nextElementSibling;
    const lis = list.querySelectorAll("li");

    for (let j = 0; j < lis.length; j++) {
      const text = lis[j].textContent.toLowerCase();
      lis[j].style.display = text.includes(value) ? "block" : "none";
    }
  });
}

// intialisation
displayRecipes(recipes);
updateAdvancedFilters(recipes);
