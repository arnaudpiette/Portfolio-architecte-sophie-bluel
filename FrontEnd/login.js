// Vérification de l'e-mail
function verifierEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Vérification du mot de passe
function verifierPassword(password) {
    return password.trim() !== "";
}

// Appel API
function connecterUtilisateur(login) {
    return fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(login)
    });
}

// Récupération des éléments du DOM
const form = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");

const erreurEmail = document.querySelector("#erreur-email");
const erreurPassword = document.querySelector("#erreur-password");
const erreurLogin = document.querySelector("#erreur-login");


// Affichage erreur API
function afficherErreurConnexion() {
    erreurLogin.textContent =
        "Erreur dans l'identifiant ou le mot de passe";
}

// Effacement des messages d'erreur
function effacerErreurs() {
    erreurEmail.textContent = "";
    erreurPassword.textContent = "";
    erreurLogin.textContent = "";
}

// Événements
if (form) {
    form.addEventListener("submit", connexionUtilisateur);
}   


// Connexion utilisateur
function connexionUtilisateur(event) {
    event.preventDefault();
    
    // Récupération des valeurs du formulaire
    const email = emailInput.value;
    const password = passwordInput.value;

    // Réinitialisation des messages d'erreur
    effacerErreurs();

    // Validation
    const emailValide = verifierEmail(email);
    const passwordValide = verifierPassword(password);

    // Affichage des erreurs de validation
    if (!emailValide) {
        erreurEmail.textContent = "Erreur dans l'e-mail";
    }
    if (!passwordValide) {
        erreurPassword.textContent = "Erreur dans le mot de passe";
    }
    
    // Arrêt si le formulaire est invalide
    if (!emailValide || !passwordValide) {
        return;
    }

    // Création de l’objet login
    const login = { email, password };

    // Envoi de la requête de connexion
    connecterUtilisateur(login)
        .then(response => {
            if (!response.ok) {
            throw new Error("Identifiant ou mot de passe incorrect");
            }
            return response.json();
        })
        // Connexion réussie
        .then(data => {
            localStorage.setItem("token", data.token);
            window.location.href = "index.html";
        })
        // Gestion des erreurs
        .catch(() => {
        afficherErreurConnexion();
        });
}