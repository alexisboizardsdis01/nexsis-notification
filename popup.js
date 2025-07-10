// popup.js
console.log("[Nexsis Notification] Popup initialized");

// Récupération des éléments DOM
const slider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const delayInput = document.getElementById('delayInput');
const statusMessage = document.getElementById('statusMessage');

// Fonction pour afficher un message de statut temporaire
function showStatus(message) {
  statusMessage.textContent = message;
  setTimeout(() => { statusMessage.textContent = ''; }, 2000);
}

// Fonction pour mettre à jour le volume
function updateVolume() {
  const volume = parseInt(slider.value, 10);
  volumeValue.textContent = volume;
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: `if(window.setExtensionVolume){window.setExtensionVolume(${volume/100});}`
      }, function(results) {
        if (chrome.runtime.lastError) {
          console.error('Error setting volume:', chrome.runtime.lastError);
        } else {
          showStatus('Volume modifié');
        }
      });
    }
  });
  
  // Sauvegarde dans le stockage local
  chrome.storage.local.set({extensionVolume: volume/100});
}

// Fonction pour mettre à jour le délai
function updateDelay() {
  const delay = parseInt(delayInput.value, 10);
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.executeScript(tabs[0].id, {
        code: `if(window.setCheckDelay){window.setCheckDelay(${delay});}`
      }, function(results) {
        if (chrome.runtime.lastError) {
          console.error('Error setting delay:', chrome.runtime.lastError);
        } else {
          showStatus('Délai modifié');
        }
      });
    }
  });
  
  // Sauvegarde dans le stockage local
  chrome.storage.local.set({checkDelay: delay});
}

// Ajout des événements
slider.addEventListener('input', function() {
  volumeValue.textContent = slider.value;
});

// Événements pour le volume
slider.addEventListener('change', updateVolume);

// Événements pour le délai - réagit immédiatement aux changements
delayInput.addEventListener('input', updateDelay);
delayInput.addEventListener('change', updateDelay);

// Chargement des valeurs sauvegardées
chrome.storage.local.get(['extensionVolume', 'checkDelay'], function(result) {
  console.log('Loaded settings:', result);
  
  // Configuration du volume
  if (typeof result.extensionVolume === 'number') {
    slider.value = Math.round(result.extensionVolume * 100);
    volumeValue.textContent = slider.value;
  } else {
    slider.value = 20; // Valeur par défaut
    volumeValue.textContent = slider.value;
  }
  
  // Configuration du délai
  if (typeof result.checkDelay === 'number') {
    delayInput.value = result.checkDelay;
  } else {
    delayInput.value = 5; // Valeur par défaut
  }
});