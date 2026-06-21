// ===========================
// FACTORISER LES URL
// ===========================

const API_URL = "http://localhost:5678/api";


// ===========================
// VÉRIFICATION DE LA CONNEXION
// ===========================

const token = localStorage.getItem("token");

function isConnected() {
	return Boolean(token);
}


// ===========================
// ÉTAT DE L'APPLICATION
// ===========================

const state = {
	works: [],
	categories: [],
	activeCategoryId: "all",
};


// ===========================
// ÉLÉMENTS DU DOM
// ===========================

// Interface principale

const editionMode = document.querySelector("#edition-mode");
const editButton = document.querySelector("#modifier");
const filtersContainer = document.querySelector(".filters");
const loginLink = document.querySelector("#login-link");
const gallery = document.querySelector(".gallery");

// Modale

const modal = document.querySelector("#modal");
const modalGalleryView = document.querySelector("#modal-gallery");
const modalFormView = document.querySelector("#modal-form");
const closeModalButton = document.querySelector("#close-modal");
const addPhotoButton = document.querySelector("#add-photo");
const backModalButton = document.querySelector("#back-modal");
const modalGallery = document.querySelector(".modal-gallery-container");

// Formulaire d'ajout

const addWorkForm = document.querySelector("#modal-form form");
const imageInput = document.querySelector("#image");
const titleInput = document.querySelector("#modal-form input[type='text']");
const categorySelect = document.querySelector("#category");
const previewImage = document.querySelector("#preview-image");
const uploadContent = document.querySelector("#upload-content");


// Gestion des erreurs et du bouton Valider

const addWorkError = createAddWorkError();
const submitAddWorkButton = addWorkForm?.querySelector("button[type='submit']");


// ===========================
// CRÉATION DU MESSAGE D'ERREUR
// ===========================

function createAddWorkError() {
	if (!addWorkForm) return null;

	let error = addWorkForm.querySelector(".erreur-form");
	if (error) return error;

	error = document.createElement("p");
	error.className = "erreur erreur-form";
	addWorkForm.insertBefore(error, titleInput?.previousElementSibling || addWorkForm.firstChild);
	return error;
}


// ===========================
// APPELS À L'API
// ===========================

async function requestApi(endpoint, options = {}) {
	const response = await fetch(`${API_URL}${endpoint}`, options);

	if (!response.ok) {
		throw new Error(`Erreur API ${response.status}`);
	}

	return response.status === 204 ? null : response.json().catch(() => null);
}


// ===========================
// MODE ADMINISTRATION
// ===========================

function initAdminMode() {
	if (!isConnected()) {
		editionMode?.remove();
		editButton?.remove();
		return;
	}

	document.body.classList.add("is-admin");
	editionMode.style.display = "flex";
	editButton.style.display = "flex";
	filtersContainer.style.display = "none";

	loginLink.textContent = "logout";
	loginLink.href = "#";
	loginLink.addEventListener("click", (event) => {
		event.preventDefault();
		localStorage.removeItem("token");
		window.location.href = "index.html";
	});
}


// ===========================
// CRÉATION D'UNE CARTE TRAVAIL
// ===========================

function createWorkFigure(work) {
	const figure = document.createElement("figure");
	const image = document.createElement("img");
	const caption = document.createElement("figcaption");

	image.src = work.imageUrl;
	image.alt = work.title;
	caption.textContent = work.title;

	figure.append(image, caption);
	return figure;
}


// ===========================
// FILTRAGE DES TRAVAUX
// ===========================

function getDisplayedWorks() {
	if (state.activeCategoryId === "all") {
		return state.works;
	}

	return state.works.filter((work) => work.categoryId === Number(state.activeCategoryId));
}


// ===========================
// AFFICHAGE DE LA GALERIE
// ===========================

function renderGallery() {
	if (!gallery) return;

	gallery.innerHTML = "";
	getDisplayedWorks().forEach((work) => {
		gallery.appendChild(createWorkFigure(work));
	});
}


// ===========================
// AFFICHAGE DES FILTRES
// ===========================

function renderFilters() {
	if (!filtersContainer || isConnected()) return;

	filtersContainer.innerHTML = "";

	const allButton = createFilterButton("Tous", "all");
	filtersContainer.appendChild(allButton);

	state.categories.forEach((category) => {
		const button = createFilterButton(category.name, String(category.id));
		filtersContainer.appendChild(button);
	});
}


// ===========================
// CRÉATION D'UN BOUTON FILTRE
// ===========================

function createFilterButton(label, categoryId) {
	const button = document.createElement("button");
	button.type = "button";
	button.textContent = label;
	button.dataset.categoryId = categoryId;
	button.classList.toggle("active", state.activeCategoryId === categoryId);

	button.addEventListener("click", () => {
		state.activeCategoryId = categoryId;
		renderFilters();
		renderGallery();
	});

	return button;
}


// ===========================
// AFFICHAGE DE LA GALERIE DE LA MODALE
// ===========================

function renderModalGallery() {
	if (!modalGallery) return;

	modalGallery.innerHTML = "";

	state.works.forEach((work) => {
		const figure = document.createElement("figure");
		const image = document.createElement("img");
		const deleteButton = document.createElement("button");

		image.src = work.imageUrl;
		image.alt = work.title;

		deleteButton.type = "button";
		deleteButton.className = "delete-button";
		deleteButton.dataset.id = work.id;
		deleteButton.setAttribute("aria-label", `Supprimer ${work.title}`);
		deleteButton.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';

		deleteButton.addEventListener("click", async (event) => {
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();

			await deleteWork(work.id);
		});

		figure.append(image, deleteButton);
		modalGallery.appendChild(figure);
	});
}


// ===========================
// CHARGEMENT DES CATÉGORIES DANS LE SELECT DE LA MODALE
// ===========================

function renderCategoryOptions() {
	if (!categorySelect) return;

	categorySelect.innerHTML = '<option value="" selected disabled hidden></option>';
	state.categories.forEach((category) => {
		const option = document.createElement("option");
		option.value = category.id;
		option.textContent = category.name;
		categorySelect.appendChild(option);
	});
}


// ===========================
// RENDU COMPLET DE L'APPLICATION
// ===========================

function renderAll() {
	renderGallery();
	renderFilters();
	renderModalGallery();
	renderCategoryOptions();
	updateSubmitState();
}


// ===========================
// OUVERTURE DE LA MODALE
// ===========================

function openModal() {
	if (!modal) return;

	resetAddWorkForm();
	modal.style.display = "flex";
	showModalGallery();
}


// ===========================
// FERMETURE DE LA MODALE
// ===========================

function closeModal() {
	if (!modal) return;

	modal.style.display = "none";
	resetAddWorkForm();
	showModalGallery();
}


// ===========================
// AFFICHAGE DE LA GALERIE DE LA MODALE
// ===========================

function showModalGallery() {
	modalGalleryView.style.display = "block";
	modalFormView.style.display = "none";
}


// ===========================
// AFFICHAGE DU FORMULAIRE D'AJOUT
// ===========================

function showModalForm() {
	modalGalleryView.style.display = "none";
	modalFormView.style.display = "block";
}

// ===========================
// SUPPRESSION D'UN TRAVAIL
// ===========================

async function deleteWork(id) {
	try {
		console.log("Suppression ID :", id);

		await requestApi(`/works/${id}`, {
			method: "DELETE",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		// Rechargement complet depuis l'API
		state.works = await requestApi("/works");

		// Mise à jour des deux galeries sans fermer la modale
		renderGallery();
		renderModalGallery();

	} catch (error) {
		console.error("Erreur suppression :", error);
	}
}


// ===========================
// RÉCUPÉRATION DE L'IMAGE SÉLECTIONNÉE
// ===========================

function getSelectedImage() {
	return imageInput?.files?.[0] || null;
}


// ===========================
// VALIDATION DU FORMULAIRE D'AJOUT
// ===========================

function validateAddWorkForm() {
	const file = getSelectedImage();
	const title = titleInput.value.trim();
	const category = categorySelect.value;

	if (!file || !title || !category) {
		return "Veuillez remplir tous les champs.";
	}

	if (!["image/jpeg", "image/png"].includes(file.type)) {
		return "Le fichier doit être au format JPG ou PNG.";
	}

	if (file.size > 4 * 1024 * 1024) {
		return "L'image ne doit pas dépasser 4 Mo.";
	}

	return "";
}


// ===========================
// MISE À JOUR DU BOUTON VALIDER
// ===========================

function updateSubmitState() {
	if (!submitAddWorkButton) return;

	const hasRequiredValues = Boolean(getSelectedImage() && titleInput.value.trim() && categorySelect.value);
	submitAddWorkButton.disabled = !hasRequiredValues;
	submitAddWorkButton.classList.toggle("is-ready", hasRequiredValues);
}


// ===========================
// AFFICHAGE DES ERREURS DU FORMULAIRE
// ===========================

function showAddWorkError(message = "") {
	if (!addWorkError) return;

	addWorkError.textContent = message;
}


// ===========================
// RÉINITIALISATION DU FORMULAIRE
// ===========================

function resetAddWorkForm() {
	if (!addWorkForm) return;

	addWorkForm.reset();
	previewImage.removeAttribute("src");
	previewImage.classList.remove("show");
	uploadContent.style.display = "flex";
	showAddWorkError();
	updateSubmitState();
}


// ===========================
// PRÉVISUALISATION DE L'IMAGE
// ===========================

function previewSelectedImage() {
	const file = getSelectedImage();

	if (!file) {
		resetAddWorkForm();
		return;
	}

	previewImage.src = URL.createObjectURL(file);
	previewImage.classList.add("show");
	uploadContent.style.display = "none";
	showAddWorkError();
	updateSubmitState();
}


// ===========================
// AJOUT D'UN TRAVAIL
// ===========================

async function addWork(event) {
	event.preventDefault();

	const errorMessage = validateAddWorkForm();
	if (errorMessage) {
		showAddWorkError(errorMessage);
		updateSubmitState();
		return;
	}

	const formData = new FormData();
	formData.append("image", getSelectedImage());
	formData.append("title", titleInput.value.trim());
	formData.append("category", categorySelect.value);

	try {
		submitAddWorkButton.disabled = true;
		const createdWork = await requestApi("/works", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		});

		state.works.push(createdWork);
		state.activeCategoryId = "all";
		renderAll();
		closeModal();
	} catch (error) {
		console.error(error);
		showAddWorkError("Une erreur est survenue pendant l'ajout.");
		updateSubmitState();
	}
}


// ===========================
// ASSOCIATION DES ÉVÉNEMENTS
// ===========================

function bindEvents() {
	editButton?.addEventListener("click", openModal);
	closeModalButton?.addEventListener("click", closeModal);
	addPhotoButton?.addEventListener("click", showModalForm);
	backModalButton?.addEventListener("click", showModalGallery);
	addWorkForm?.addEventListener("submit", addWork);
	imageInput?.addEventListener("change", previewSelectedImage);
	titleInput?.addEventListener("input", updateSubmitState);
	categorySelect?.addEventListener("change", updateSubmitState);

	modal?.addEventListener("click", (event) => {
		if (event.target === modal) {
			closeModal();
		}
	});
}


// ===========================
// INITIALISATION DE L'APPLICATION
// ===========================

async function init() {
	initAdminMode();
	bindEvents();

	try {
		const [works, categories] = await Promise.all([
			requestApi("/works"),
			requestApi("/categories"),
		]);

		state.works = works;
		state.categories = categories;
		renderAll();
	} catch (error) {
		console.error(error);
	}
}


// ===========================
// LANCEMENT DE L'APPLICATION
// ===========================

init();
