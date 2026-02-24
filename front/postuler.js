// URL du backend Render — à ne pas modifier
const API_URL = 'https://recrutement-7th0.onrender.com';

const form = document.getElementById('formPostuler');
const messageRetour = document.getElementById('messageRetour');
const btnSoumettre = document.getElementById('btnSoumettre');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    messageRetour.textContent = '';
    messageRetour.className = 'message-retour';

    const nom        = document.getElementById('nom').value.trim();
    const prenom     = document.getElementById('prenom').value.trim();
    const email      = document.getElementById('email').value.trim();
    const telephone  = document.getElementById('telephone').value.trim();
    const residence  = document.getElementById('residence').value.trim();
    const poste      = document.getElementById('poste').value;
    const typeContrat= document.getElementById('type_contrat').value;
    const experience = document.getElementById('experience').value;
    const portfolio  = document.getElementById('portfolio').value.trim();
    const motivation = document.getElementById('motivation').value.trim();

    if (!nom || !prenom || !email || !telephone || !residence || !poste || !typeContrat || !experience || !motivation) {
        afficherMessage('Veuillez remplir tous les champs obligatoires.', 'erreur');
        return;
    }

    if (!validerEmail(email)) {
        afficherMessage('Veuillez entrer une adresse e-mail valide.', 'erreur');
        return;
    }

    const candidature = { nom, prenom, email, telephone, residence, poste, type_contrat: typeContrat, experience, portfolio, motivation };

    btnSoumettre.disabled = true;
    btnSoumettre.textContent = 'Envoi en cours...';

    try {
        const reponse = await fetch(`${API_URL}/api/candidatures`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(candidature)
        });

        const data = await reponse.json();

        if (reponse.ok) {
            afficherMessage('Votre candidature a bien été envoyée ! Nous vous contacterons bientôt.', 'succes');
            form.reset();
        } else {
            afficherMessage(data.message || 'Une erreur est survenue. Veuillez réessayer.', 'erreur');
        }

    } catch (erreur) {
        afficherMessage('Impossible de contacter le serveur. Vérifiez votre connexion.', 'erreur');
    } finally {
        btnSoumettre.disabled = false;
        btnSoumettre.textContent = 'Envoyer ma candidature';
    }
});

function afficherMessage(texte, type) {
    messageRetour.textContent = texte;
    messageRetour.className = 'message-retour ' + type;
    messageRetour.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function validerEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
