// ===========================
// FACTORISER LES URL
// ===========================

const LOGIN_URL = "http://localhost:5678/api/users/login";


// ===========================
// RÉCUPÉRATION DES ÉLÉMENTS DU DOM
// ===========================

const form = document.querySelector("#login-form");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const togglePassword = document.querySelector("#toggle-password");

const emailError = document.querySelector("#erreur-email");
const passwordError = document.querySelector("#erreur-password");
const loginError = document.querySelector("#erreur-login");


// ===========================
// VÉRIFICATION DU FORMAT DE L'E-MAIL
// ===========================

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===========================
// AFFICHER / MASQUER MOT DE PASSE
// ===========================

if(togglePassword){

    togglePassword.addEventListener("click", () => {

        if(passwordInput.type === "password"){

            passwordInput.type = "text";

            togglePassword.classList.remove("fa-eye");
            togglePassword.classList.add("fa-eye-slash");

        }else{

            passwordInput.type = "password";

            togglePassword.classList.remove("fa-eye-slash");
            togglePassword.classList.add("fa-eye");
        }

    });

}

// ===========================
// EFFACEMENT DES MESSAGES D'ERREUR
// ===========================

function clearErrors() {
	emailError.textContent = "";
	passwordError.textContent = "";
	loginError.textContent = "";
}


// ===========================
// AFFICHAGE D'UNE ERREUR DE CONNEXION
// ===========================

function showLoginError(message) {
	loginError.textContent = message;
}


// ===========================
// VALIDATION DU FORMULAIRE
// ===========================

function validateForm(email, password) {

	let isValid = true;

	if (!isValidEmail(email)) {
		emailError.textContent =
			"Veuillez saisir un e-mail valide.";
		isValid = false;
	}

	if (!password.trim()) {
		passwordError.textContent =
			"Veuillez saisir un mot de passe.";
		isValid = false;
	}

	return isValid;
}


// ===========================
// APPEL DE L'API DE CONNEXION
// ===========================

async function loginUser(credentials) {

	const response = await fetch(LOGIN_URL, {

		method: "POST",

		headers: {
			"Content-Type": "application/json",
		},

		body: JSON.stringify(credentials),

	});

	if (!response.ok) {
		throw new Error("Connexion refusée");
	}

	return response.json();
}


// ===========================
// GESTION DE LA CONNEXION
// ===========================

async function handleLogin(event) {

	event.preventDefault();

	if (!form || !emailInput || !passwordInput) {
		return;
	}

	const email = emailInput.value.trim();
	const password = passwordInput.value;

	clearErrors();

	if (!validateForm(email, password)) {
		return;
	}

	try {

		const data = await loginUser({
			email,
			password
		});

		localStorage.setItem("token", data.token);

		window.location.href = "index.html";

	}
	catch (error) {

		showLoginError(
			"Erreur dans l'identifiant ou le mot de passe."
		);

	}
}


// ===========================
// ÉVÉNEMENTS
// ===========================

// Soumission du formulaire

form?.addEventListener(
	"submit",
	handleLogin
);

// Effacement des erreurs dès la saisie

emailInput?.addEventListener(
	"input",
	clearErrors
);

passwordInput?.addEventListener(
	"input",
	clearErrors
);