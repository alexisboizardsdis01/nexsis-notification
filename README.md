# Extension Nexsis Notifier

Cette extension pour navigateur surveille les alertes Nexsis et joue un son de notification lorsqu'une alerte est détectée.

## Fonctionnalités

- Surveillance automatique des appels dans le SGA
- Rejoue la notification lorsqu'un appel est détectée
- Réglage du volume des notifications sonores
- Configuration du délai entre les notifications sonores

## Installation

1. Téléchargez le fichier .xpi
2. Ouvrez la page de gestion des extensions de votre navigateur
4. Cliquez sur la roue cranté, et sur "Installer un module depuis un fichier"
5. Sélectionnez le fichier .xpi

## Utilisation

1. Naviguez vers la page du SGA
2. L'extension commence automatiquement à surveiller les alertes
3. Lorsqu'une alerte est détectée, l'extension rejoue le son de notification jusqu'à ce que l'appel soit pris.
4. Cliquez sur l'icône de l'extension dans la barre d'outils pour ouvrir le panneau de configuration
5. Ajustez le volume des notifications avec le curseur
6. Modifiez l'intervalle entre les notifications en secondes

## Paramètres configurables

- **Volume** : Réglage du volume des notifications sonores (0-100%)
- **Délai** : Intervalle en secondes entre les notifications sonores (1-60 secondes)

## Fichiers principaux

- `manifest.json` : Configuration de l'extension
- `content.js` : Script principal pour la détection des alertes et la lecture des sons
- `popup.html` et `popup.js` : Interface utilisateur pour les paramètres
- `son_nexsis.mp3` : Fichier audio pour la notification
- `icon-48.png` : Icône de l'extension

## Remarques techniques

- L'extension utilise un MutationObserver pour détecter les changements dans la page
- Les paramètres sont stockés dans chrome.storage.local pour persistance
- Compatible avec les navigateurs basés sur Chromium et Firefox

# CHANGELOG

## V1
- Création d'un système de base

## V2
- Ajout du réglage de volume
- Afinnement de la détéction d'appel

## V3
- Ajout du réglage de l'intervale entre les sonneries
- Ajout d'un logo

## V4
- Fixe 
- Changement du logo de l'extension

Développé par A. BOIZARD - SDIS01
