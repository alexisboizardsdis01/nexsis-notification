// ******************************************************************
// * NEXSIS NOTIFICATION EXTENSION - CONTENT SCRIPT
// ******************************************************************

// ======================================================================
// INITIALISATION DES VARIABLES
// ======================================================================
// Initialisation de l'audio
let audio = new Audio(browser.runtime.getURL('son_nexsis.mp3'));
audio.loop = false;

// Variables de contrôle
let intervalId = null;
let checkDelay = 5; // Délai en secondes (par défaut: 5 secondes)
let extensionVolume = 0.20; // Volume par défaut

const urlNexsis = [
    "https://bac.qualif.nexsis18-112.fr/sga/salon-traitement",
    "https://formation.qualif.nexsis18-112.fr/sga/salon-traitement",
    "https://nexsis.prod.nexsis18-112.fr/sga/salon-traitement"
]

// ======================================================================
// FONCTIONS PRINCIPALES DE DÉTECTION ET LECTURE AUDIO
// ======================================================================

/**
 * Vérifie si la div contient des alertes et joue le son si nécessaire
 */
function checkDivAndPlay() {
    const bodyDiv = document.querySelector('div.body');
    const url = window.location.href;
    let shouldPlay = false;
    
    if (bodyDiv && bodyDiv.children.length > 0 && urlNexsis.includes(url)) {
        // Exclure si un enfant contient le texte spécifique
        let foundNoAlert = false;
        for (let child of bodyDiv.children) {
            if (child.textContent && child.textContent.includes("Il n'y a pas d'alerte en attente")) {
                foundNoAlert = true;
                break;
            }
        }
        shouldPlay = !foundNoAlert;
    }
    
    if (shouldPlay) {
        if (!intervalId) {
            console.log('[Div Sound Notifier] Children detected (and not excluded), starting sound interval.');
            // Ne pas jouer le son immédiatement, mais attendre checkDelay avant le premier son
            console.log(`[Div Sound Notifier] Premier son après ${checkDelay} secondes`);
            intervalId = setInterval(playSound, checkDelay * 1000);
        }
    } else {
        if (intervalId) {
            console.log('[Div Sound Notifier] No children or excluded text, stopping sound interval.');
            clearInterval(intervalId);
            intervalId = null;
        }
        if (!audio.paused) {
            audio.pause();
            audio.currentTime = 0;
            console.log('[Div Sound Notifier] Audio stopped because div is empty or excluded');
        }
    }
}

/**
 * Joue le son de notification
 */
function playSound() {
    audio.pause(); // Stop any current playback
    audio.currentTime = 0;
    audio.play().then(() => {
        console.log('[Div Sound Notifier] Audio played successfully');
    }).catch(e => console.warn('[Div Sound Notifier] Audio play error:', e));
}

// ======================================================================
// CONFIGURATION DES PARAMÈTRES
// ======================================================================

/**
 * Configure le délai entre les vérifications
 */
window.setCheckDelay = function(delay) {
    if (typeof delay === 'number' && delay >= 0) {
        checkDelay = delay;
        console.log(`[Div Sound Notifier] Délai de vérification réglé à ${checkDelay} seconde(s)`);
        
        // Mettre à jour l'intervalle existant si nécessaire
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = setInterval(playSound, checkDelay * 1000);
            console.log(`[Div Sound Notifier] Intervalle de son mis à jour avec nouveau délai: ${checkDelay}s`);
        }
        
        // Sauvegarder le délai dans le stockage local
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({checkDelay: checkDelay});
        }
    }
};

/**
 * Configure le volume du son
 */
window.setExtensionVolume = function(vol) {
    extensionVolume = Math.max(0, Math.min(1, vol));
    audio.volume = extensionVolume;
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({extensionVolume: extensionVolume});
    }
    console.log('[Div Sound Notifier] Volume réglé à', extensionVolume);
};

// ======================================================================
// CHARGEMENT DES PARAMÈTRES SAUVEGARDÉS
// ======================================================================
// Charger les paramètres sauvegardés au démarrage
if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['extensionVolume', 'checkDelay'], function(result) {
        // Chargement du volume
        if (typeof result.extensionVolume === 'number') {
            extensionVolume = result.extensionVolume;
            audio.volume = extensionVolume;
            console.log('[Div Sound Notifier] Volume initial chargé:', extensionVolume);
        } else {
            audio.volume = extensionVolume;
        }
        
        // Chargement du délai
        if (typeof result.checkDelay === 'number') {
            checkDelay = result.checkDelay;
            console.log(`[Div Sound Notifier] Délai initial chargé: ${checkDelay}s`);
        }
    });
} else {
    audio.volume = extensionVolume;
}

// ======================================================================
// ÉVÉNEMENTS ET OBSERVATEURS
// ======================================================================

// Observateur de mutations du DOM
const observer = new MutationObserver((mutations) => {
    checkDivAndPlay();
});

// Événements de chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    const bodyDiv = document.querySelector('div.body');
    if (bodyDiv) {
        observer.observe(bodyDiv, { childList: true });
        console.log('[Div Sound Notifier] Observer attached to div.body');
        checkDivAndPlay();
    } else {
        console.log('[Div Sound Notifier] div.body not found');
    }
});

window.addEventListener('load', () => {
    console.log('[Div Sound Notifier] window load event');
    const bodyDiv = document.querySelector('div.body');
    if (bodyDiv) {
        observer.observe(bodyDiv, { childList: true });
        console.log('[Div Sound Notifier] Observer attached to div.body (window load)');
        checkDivAndPlay();
    } else {
        console.log('[Div Sound Notifier] div.body not found (window load)');
    }
});

// ======================================================================
// VÉRIFICATIONS PÉRIODIQUES ET MANUELLES
// ======================================================================

// Vérification régulière de l'état de la div.body
setInterval(() => {
    checkDivAndPlay();
}, 500);

// Vérification initiale avec délai configurable
window.setTimeout(() => {
    console.log(`[Div Sound Notifier] Manual startup check (setTimeout with ${checkDelay}s delay)`);
    checkDivAndPlay();
}, checkDelay * 1000);

// ======================================================================
// GESTION DES MESSAGES
// ======================================================================

// Écoute les messages venant de la popup pour changer le volume
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.type === 'SET_VOLUME' && typeof request.volume === 'number') {
            extensionVolume = Math.max(0, Math.min(1, request.volume));
            audio.volume = extensionVolume;
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({extensionVolume: extensionVolume});
            }
            console.log('[Div Sound Notifier] Volume réglé à', extensionVolume, '(via message)');
        }
    });
}