// Factoriser les URL

const API_URL = "http://localhost:5678/api";


// Vérification de la connexion

const token = localStorage.getItem("token");

// Éléments du DOM

const editionMode = document.querySelector("#edition-mode");
const boutonModifier = document.querySelector("#modifier");
const filters = document.querySelector(".filters");
const loginLink = document.querySelector("#login-link");
const gallery = document.querySelector(".gallery");

const galleryModal = document.querySelector(".modal-gallery-container");
const modal = document.querySelector("#modal");
const openModal = document.querySelector("#modifier");
const closeModal = document.querySelector("#close-modal");
const modalGallery = document.querySelector("#modal-gallery");

const modalForm = document.querySelector("#modal-form");
const addPhoto = document.querySelector("#add-photo");
const backModal = document.querySelector("#back-modal");

const previewImage = document.querySelector("#preview-image");
const imageInput = document.querySelector("#image");
const categorySelect = document.querySelector("#category");
const uploadContent = document.querySelector("#upload-content");

// Formulaire d'ajout
const formAjout = document.querySelector("#modal-form form");
const titreInput = document.querySelector("#modal-form input[type='text']");


// Fonction mode édition
function modeEdition() {

    if (editionMode) {
        editionMode.style.display = "flex";
    }

    if (boutonModifier) {
        boutonModifier.style.display = "flex";
    }

    if (filters) {
        filters.style.display = "none";
    }
}

// Mode édition

if (token && loginLink) {
    modeEdition();

    loginLink.textContent = "logout";
    loginLink.href = "#";

    loginLink.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}

// Chargement des travaux
let travaux = [];

function chargerTravaux() {

    fetch(`${API_URL}/works`)
        .then(response => response.json())
        .then(data => {
            travaux = data;
            afficherTravaux(travaux);
            afficherTravauxModal(travaux);
        })        
        .catch(error => {
            console.error(error);
        });
}

// Affichage des travaux
function afficherTravaux(listeTravaux){
        // Protéger la galerie
        if (!gallery) return;

        // Vider la gallerie avant de la remplir
        gallery.innerHTML = "";

    listeTravaux.forEach(work => {
        const figure = document.createElement("figure");

        const image = document.createElement("img");
        image.src = work.imageUrl;
        image.alt = work.title;

        const caption = document.createElement("figcaption");
        caption.innerText = work.title;

        figure.appendChild(image);
        figure.appendChild(caption);

        gallery.appendChild(figure);
    });
}


// Affichage des travaux dans la modale
function afficherTravauxModal(listeTravaux) {
    // Protéger la galerie Modale
    if (!galleryModal) return;

    // Vider la galerie
    galleryModal.innerHTML = "";

    // Parcourir les travaux
    listeTravaux.forEach(work => {

        const figure = document.createElement("figure");

        const image = document.createElement("img");

        image.src = work.imageUrl;
        image.alt = work.title;

        figure.appendChild(image);

        // Bouton poubelle
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.classList.add("delete-button");

        deleteButton.innerHTML =
        '<i class="fa-solid fa-trash-can"></i>';

        figure.appendChild(deleteButton);

        deleteButton.dataset.id = work.id;

        deleteButton.addEventListener("click", (event)=>{
            event.stopPropagation();
            supprimerTravail(work.id);
        });

        galleryModal.appendChild(figure);

    });

}


// Suppression d'un travail
function supprimerTravail(id){
    fetch(`${API_URL}/works/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    .then(response => {
        if(response.ok){
            chargerTravaux();
        } else {
            console.log("Erreur suppression");
        }
    })

    .catch(error => {
        console.log(error);
    });
}


// Active le bouton sélectionné
function activerBouton(bouton) {
    document.querySelectorAll(".filters button").forEach(btn => {
        btn.classList.remove("active");
    });

    bouton.classList.add("active");
}

// Récupération des catégories
function chargerCategories() {

    fetch(`${API_URL}/categories`)
        .then(response => response.json())
        .then(categories => {
                if (!filters) return;

            // Vider les filtres
            filters.innerHTML = "";

            // Bouton "Tous"
            const buttonAll = document.createElement("button");
            buttonAll.innerText = "Tous";
            buttonAll.classList.add("active");

            buttonAll.addEventListener("click", () => {

                // Désactive tous les boutons
                document.querySelectorAll(".filters button").forEach(btn => {
                   btn.classList.remove("active");
                });

                // Active le bouton Tous
                buttonAll.classList.add("active");

                // Réaffiche tous les travaux
                afficherTravaux(travaux);
            });

            filters.appendChild(buttonAll);
            
            // Boutons des catégories
            categories.forEach(category => {

                const button = document.createElement("button");

                button.innerText = category.name;
                button.dataset.id = category.id;

                button.addEventListener("click", () => {
                    activerBouton(button);

                    afficherTravaux(
                    travaux.filter(work => work.categoryId === category.id)
                    );
                });

                filters.appendChild(button);
            });

        })
        .catch(error => {
            console.error(error);
        });
}

// Chargement des catégories dans la modale
function chargerCategoriesModal() {
    fetch(`${API_URL}/categories`)
        .then(response => response.json())
        
        .then(categories => {
            categorySelect.innerHTML = "";

            categories.forEach(category => {
                const option = document.createElement("option");

                option.value = category.id;
                option.textContent = category.name;

                categorySelect.appendChild(option);
            });
        });
}

// INITIALISTAION
chargerTravaux();
    if (!token) {
        chargerCategories();
    }

    chargerCategoriesModal();


// MODALE

function fermerModal() {
    modal.style.display = "none";
    modalGallery.style.display = "block";
    modalForm.style.display = "none";
}

// Ouverture
if (openModal) {
    openModal.addEventListener("click", () => {
        modal.style.display = "flex";
    });
}

// Fermeture avec la croix
if (closeModal) {
    closeModal.addEventListener("click", fermerModal);
}

// Fermeture en cliquant à l'extérieur
if (modal) {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            fermerModal();
        }
    });
}

// Navigation Modale

if (addPhoto) {
    addPhoto.addEventListener("click", () => {
        modalGallery.style.display = "none";
        modalForm.style.display = "block";
    });
}

if (imageInput) {
    imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    previewImage.src = URL.createObjectURL(file);
    previewImage.style.display = "block";

    uploadContent.style.display = "none";
});
}

if (backModal) {
    backModal.addEventListener("click", () => {
        modalGallery.style.display = "block";
        modalForm.style.display = "none";
    });
}

// Soumission du formulaire d'ajout
if (formAjout) {
    formAjout.addEventListener("submit", ajouterTravail);
}
function ajouterTravail(event){
    event.preventDefault();

    if(
        !imageInput.files[0] ||
        !titreInput.value ||
        !categorySelect.value
    ){
        alert("Veuillez remplir tous les champs.");
        return;
    }
    const formData = new FormData();

    formData.append("image", imageInput.files[0]);
    formData.append("title", titreInput.value);
    formData.append("category", categorySelect.value);

    fetch(`${API_URL}/works`,{
        method:"POST",
        headers:{
            Authorization:`Bearer ${token}`
        },
        body:formData
    })
    .then(response=>response.json())

    .then(()=>{
    chargerTravaux();
    fermerModal();

    formAjout.reset();

    previewImage.src = "";
    previewImage.style.display = "none";

    uploadContent.style.display = "flex";
    })
    .catch(error=>console.log(error));
}

