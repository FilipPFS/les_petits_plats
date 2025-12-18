const searchInput = document.getElementById("search");
const resultsDiv = document.getElementById("results");

const ingredientsList = document.getElementById("ingredients-list");
const appliancesList = document.getElementById("appliances-list");
const ustensilsList = document.getElementById("ustensils-list");

const tagsContainer = document.getElementById("tags-container");
const paginationContainer = document.getElementById("pagination");

let selectedTags = [];

// Fetch recipes function
const fetchRecipes = async (page = 1, limit = 5, query = "", tags = {}) => {
  try {
    let url = `http://localhost/petit_plats_api/api/recipes/test.php?page=${page}&limit=${limit}`;

    if (query.trim() !== "") url += `&query=${encodeURIComponent(query)}`;

    if (tags.ingredient?.length) {
      tags.ingredient.forEach((ing) => {
        url += `&ingredient[]=${encodeURIComponent(ing)}`;
      });
    }

    if (tags.appliance?.length) {
      tags.appliance.forEach((app) => {
        url += `&appliance[]=${encodeURIComponent(app)}`;
      });
    }

    if (tags.ustensil?.length) {
      tags.ustensil.forEach((u) => {
        url += `&ustensil[]=${encodeURIComponent(u)}`;
      });
    }

    console.log("FETCH:", url);

    const res = await axios.get(url);
    return res.data; // return full API response
  } catch (error) {
    console.error("API ERROR:", error);
    return { data: [], page: 1, total_pages: 1 };
  }
};

function getSelectedTagsObject() {
  return {
    ingredient: selectedTags
      .filter((t) => t.type === "ingredient")
      .map((t) => t.value),
    appliance: selectedTags
      .filter((t) => t.type === "appliance")
      .map((t) => t.value),
    ustensil: selectedTags
      .filter((t) => t.type === "ustensil")
      .map((t) => t.value),
  };
}

// Loading recipes
async function loadPage(page, query, tags) {
  const response = await fetchRecipes(page, 5, query, tags);

  displayRecipes(response.data, query);
  updateAdvancedFilters(response.data);
  displayPagination(response.page, response.total_pages, query, tags);
}

// Initial Load Function
async function loadRecipes() {
  await loadPage(1, "", getSelectedTagsObject());
}

// Display recipes
function displayRecipes(recipes, query = "") {
  resultsDiv.innerHTML = "";

  if (!recipes.length) {
    resultsDiv.innerHTML = `<p>Aucune recette ne contient « ${query} ».</p>`;
    return;
  }

  recipes.forEach((recipe) => {
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
                  <span>${ing.quantity || ""} ${ing.unit || ""}</span>
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

// Advanced filters
function updateAdvancedFilters(recipesList) {
  const ingredients = new Set();
  const appliances = new Set();
  const ustensils = new Set();

  recipesList.forEach((r) => {
    r.ingredients.forEach((i) => ingredients.add(i.ingredient));
    appliances.add(r.appliance);
    r.ustensils.forEach((u) => ustensils.add(u));
  });

  displayFilterOptions("ingredient", [...ingredients], ingredientsList);
  displayFilterOptions("appliance", [...appliances], appliancesList);
  displayFilterOptions("ustensil", [...ustensils], ustensilsList);
}

function displayFilterOptions(type, list, container) {
  container.innerHTML = list
    .map((item) => `<li class="filter-option" data-type="${type}">${item}</li>`)
    .join("");
}

// Tag system
function wireFilterList(container, type) {
  container.addEventListener("click", (e) => {
    const li = e.target.closest(".filter-option");
    if (!li) return;

    addTag(li.textContent.trim(), type);

    const filterEl = container.closest(".filter");
    if (filterEl) {
      filterEl.classList.remove("open");
      const searchField = filterEl.querySelector(".filter-search");
      if (searchField) searchField.value = "";
      filterEl.querySelectorAll("li").forEach((li) => (li.style.display = ""));
    }
  });
}

wireFilterList(ingredientsList, "ingredient");
wireFilterList(appliancesList, "appliance");
wireFilterList(ustensilsList, "ustensil");

function addTag(value, type) {
  value = value.toLowerCase();

  if (!selectedTags.some((t) => t.value === value && t.type === type)) {
    selectedTags.push({ value, type });
    displayTags();
    filterWithTags();
  }
}

function removeTag(value, type) {
  selectedTags = selectedTags.filter(
    (t) => !(t.value === value && t.type === type)
  );
  displayTags();
  filterWithTags();
}

function displayTags() {
  tagsContainer.innerHTML = selectedTags
    .map(
      (t) => `
        <div class="tag ${t.type}">
          <p>${t.value}</p>
          <button class="remove-tag" data-value="${t.value}" data-type="${t.type}">x</button>
        </div>`
    )
    .join("");

  document.querySelectorAll(".remove-tag").forEach((btn) => {
    btn.addEventListener("click", () =>
      removeTag(btn.dataset.value, btn.dataset.type)
    );
  });
}

// Filter (search + tags)
let queryTimeout;

async function filterWithTags() {
  clearTimeout(queryTimeout);

  queryTimeout = setTimeout(async () => {
    const query = searchInput.value.trim().toLowerCase();
    const tags = getSelectedTagsObject();

    console.log("TAGS", tags);

    const response = await fetchRecipes(1, 5, query, tags);

    displayRecipes(response.data, query);
    updateAdvancedFilters(response.data);
    displayPagination(response.page, response.total_pages, query, tags);
  }, 300);
}

searchInput.addEventListener("input", filterWithTags);

// =============================================================
// PAGINATION
// =============================================================
function displayPagination(currentPage, totalPages, query, tags) {
  paginationContainer.innerHTML = "";

  // previous
  if (currentPage > 1) {
    const prev = document.createElement("button");
    prev.classList = "btn-page";
    prev.textContent = "«";
    prev.addEventListener("click", () =>
      loadPage(currentPage - 1, query, tags)
    );
    paginationContainer.appendChild(prev);
  }

  // pages
  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.textContent = p;
    btn.classList = "btn-page";

    if (p === currentPage) btn.classList.add("active");

    btn.addEventListener("click", () => loadPage(p, query, tags));
    paginationContainer.appendChild(btn);
  }

  // next
  if (currentPage < totalPages) {
    const next = document.createElement("button");
    next.classList = "btn-page";
    next.textContent = "»";
    next.addEventListener("click", () =>
      loadPage(currentPage + 1, query, tags)
    );
    paginationContainer.appendChild(next);
  }
}

// =============================================================
// DROPDOWNS
// =============================================================
document.querySelectorAll(".filter-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const parent = btn.closest(".filter");
    parent.classList.toggle("open");

    document.querySelectorAll(".filter").forEach((f) => {
      if (f !== parent) f.classList.remove("open");
    });
  });
});

// search in filter list
document.querySelectorAll(".filter-search").forEach((input) => {
  input.addEventListener("input", (e) => {
    const value = e.target.value.toLowerCase().trim();
    const list = e.target.nextElementSibling;
    list.querySelectorAll("li").forEach((li) => {
      li.style.display = li.textContent.toLowerCase().includes(value)
        ? "block"
        : "none";
    });
  });
});

// START
loadRecipes();
